---
topic: "Domain-Driven Design"
title: "Entities your agent can't break"
description: "These days an agent writes a good chunk of your domain code, and it takes whatever path the code leaves open. How to model creating and restoring entities in TypeScript, with classes, so the wrong shortcut doesn't even compile."
cover: "https://github.com/mkuchak/blog/assets/3791148/3f04ab80-ccf4-46d9-8ce2-360c60b0fe31"
date: 2026-09-28
tags: ["Domain-Driven Design", "TypeScript", "Object-Oriented Programming", "AI Agents"]
---

You ask your agent for a `User` entity and an endpoint to change the email. A few seconds later it's all there, tests passing. The question left for you isn't how to write that code anymore. It's whether it left a door open.

An agent takes the shortest path that compiles and passes the tests. If the entity lets you do `user.email = body.email`, that's what shows up in the diff, because it works. If the constructor takes any object, the request body goes straight into it. That's not the model being sloppy. That's the class allowing it.

So the part of the job that's still yours is the shape: classes and types where the wrong shortcut doesn't compile. The compiler becomes the reviewer that reads every generated line, including the ones you won't. In this post I'll show that shape for the most common case in any domain, creating and restoring an entity, in plain object-oriented TypeScript.

## The quick version that compiles

You've seen this `User` around, handwritten or generated. It's short, easy to read and compiles with `strict` on:

```user.ts
export class User {
  id: string = crypto.randomUUID();
  email!: string;
  password!: string;
  firstName!: string;
  middleName?: string;
  lastName!: string;

  constructor(props: Partial<User>) {
    Object.assign(this, props);
  }
}
```

I tested what it lets through, on TypeScript 7 and Node 24:

- `new User({})` compiles and creates a user with no email and no password. `Partial` makes everything optional.
- `new User({ id: row.id, ... })` with `row.id` coming back `undefined` wipes out the UUID the field had just generated. The entity ends up with no id.
- If the request body has `isAdmin: true`, it gets copied straight into the entity. TypeScript only complains about extra fields in object literals, and the body is a variable.
- A JSON payload with a `__proto__` key swaps the object's prototype. The entity stops being a `User` (`instanceof` returns `false`), loses its methods and inherits whatever came in the JSON.
- `user.email = "not an email"` compiles. Any part of the system can change any field without going through a single rule.

None of these break a happy-path test. All of them make it to production.

## Creating isn't restoring

Before getting to the right shape, there's a difference that constructor hides. A domain object comes to life in two ways, and they don't do the same thing.

| | Create | Restore |
|---|---|---|
| Where the data comes from | user, API, form | database, queue, cache |
| Validates the rules | yes | no, it was validated on the way in |
| Generates id and creation date | yes | no, they come from the database |
| Password | plain text, gets hashed | already a hash |
| Emits a domain event | yes (`UserRegistered`) | no |

Validating again on restore feels careful, but it's a trap. If the email rule gets stricter next year, the system can no longer load users that have been in the database for years. A password hash has nothing to do with a "12 characters minimum" rule meant for a typed password. And if `UserRegistered` fires every time someone loads the user from the database, the welcome email goes out again.

Two different operations means two factory methods. And that holds from the entity all the way down to the smallest value object.

## Value objects that don't mix

Start with the smallest piece, the email:

```email.ts
export class Email {
  private constructor(private readonly value: string) {}

  static parse(input: string): Email {
    const value = input.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error(`Invalid email: ${input}`);
    }
    return new Email(value);
  }

  static restore(value: string): Email {
    return new Email(value);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

With a private constructor, `new Email(...)` doesn't compile outside the class. That leaves two ways in: `parse`, which validates and is meant for data coming from outside, and `restore`, which trusts and is meant for data already in the database. Same difference as the table, applied to a value.

And `private readonly value` isn't there just for encapsulation. TypeScript compares classes by shape, not by name. If two classes both have a public `readonly value: string`, the compiler can't tell them apart. I tested it: an `EmailVO` goes through with no error where the code expects a `UserIdVO`. A `private` member changes that, because TypeScript only treats two classes with private members as compatible if those members come from the same declaration. So `Email` and `UserId` become types you can't swap for each other.

`UserId` follows the same pattern, with `generate` instead of `parse`:

```user-id.ts
export class UserId {
  private constructor(private readonly value: string) {}

  static generate(): UserId {
    return new UserId(crypto.randomUUID());
  }

  static restore(value: string): UserId {
    return new UserId(value);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

`PasswordHash` is the same, with a single `static fromDigest(digest: string)`, because a hash only exists once someone has computed it. Whoever computes it lives outside the domain, behind an interface:

```password-hash.ts
export interface PasswordHasher {
  hash(plain: string): Promise<PasswordHash>;
}
```

## The state is a type alias

The entity keeps its state in a handwritten type alias that says what it holds once it's valid:

```user.ts
export type UserState = {
  id: UserId;
  email: Email;
  passwordHash: PasswordHash;
  firstName: string;
  middleName: string | null;
  lastName: string;
  createdAt: Date;
};
```

Notice the state holds `passwordHash`, not `password`. The plain-text password is input only and never makes it into the state. And `middleName` is `string | null`, which is what the database gives you back, instead of an optional field that's sometimes there and sometimes not.

The input type for creation comes from the state:

```user.ts
export type NewUser = Pick<UserState, "firstName" | "lastName"> & {
  email: string;
  password: string;
  middleName?: string | undefined;
};
```

Whatever is the same comes from the state, and whatever changes shape on the way in (the email that hasn't been validated yet, the plain-text password) is declared separately. I used `Pick` and not `Omit` on purpose, because `Pick` is a list of what's allowed in. If someone (or some agent) adds a `lastLoginAt` to the state, it doesn't become a field any request can fill in. The compiler points out that the field is missing on creation, and somebody decides where it comes from.

Last, the events the entity can emit, as a discriminated union:

```user.ts
export type UserEvent =
  | { type: "UserRegistered"; userId: UserId; at: Date }
  | { type: "EmailChanged"; userId: UserId; from: Email; to: Email; at: Date };
```

## The entity

```user.ts
export class User {
  private events: UserEvent[] = [];

  private constructor(private state: UserState) {}

  static async register(input: NewUser, hasher: PasswordHasher): Promise<User> {
    if (input.password.length < 12) {
      throw new Error("Password must have at least 12 characters");
    }
    const user = new User({
      id: UserId.generate(),
      email: Email.parse(input.email),
      passwordHash: await hasher.hash(input.password),
      firstName: input.firstName,
      middleName: input.middleName ?? null,
      lastName: input.lastName,
      createdAt: new Date(),
    });
    user.events.push({ type: "UserRegistered", userId: user.id, at: user.state.createdAt });
    return user;
  }

  static restore(state: UserState): User {
    return new User(state);
  }

  get id(): UserId {
    return this.state.id;
  }

  get email(): Email {
    return this.state.email;
  }

  get fullName(): string {
    const { firstName, middleName, lastName } = this.state;
    return [firstName, middleName, lastName].filter(Boolean).join(" ");
  }

  changeEmail(next: string): void {
    const from = this.state.email;
    const to = Email.parse(next);
    if (to.equals(from)) return;
    this.state = { ...this.state, email: to };
    this.events.push({ type: "EmailChanged", userId: this.id, from, to, at: new Date() });
  }

  toState(): Readonly<UserState> {
    return { ...this.state };
  }

  toJSON() {
    return { id: this.id.toString(), email: this.email.toString(), fullName: this.fullName };
  }

  pullEvents(): UserEvent[] {
    const events = this.events;
    this.events = [];
    return events;
  }
}
```

Since the constructor is private, there are only two ways to get a `User`. `register` validates, generates what belongs to the domain, hashes the password and emits the event. `restore` just builds the entity from a state that's already valid.

The state sits in a `private` field and you read it through getters. To change anything, you go through a method with a business name, like `changeEmail`, which is where the rule lives and where the event is born. There's no `Object.assign`, so extra fields and `__proto__` have no way in. And there's no `!` shutting the compiler up.

One detail worth knowing: TypeScript's `private` only exists at compile time. At runtime the field is there like any other, and that has an annoying side effect. Without `toJSON`, `JSON.stringify(user)` serializes the whole `state`, password hash included. I tested it, and the digest shows up in the JSON. An agent writing `res.json(user)` in an endpoint has no way of guessing that. With `toJSON`, the entity's public representation is defined in one place, and the hash never leaves it.

For the same reason, `(user as any).state` gets to the field. For what this post is after, that's fine: the compiler is what stops the shortcut, and an `as any` stands out in a diff as much as any other shortcut.

## Let the compiler say no

Now the same shortcuts against these classes. These are the messages `tsc` actually spits out:

```text
user.email = Email.parse("x@y.z");
error TS2540: Cannot assign to 'email' because it is a read-only property.

new User(state);
error TS2673: Constructor of class 'User' is private and only accessible within the class declaration.

user.state;
error TS2341: Property 'state' is private and only accessible within class 'User'.

new Email("a@b.co");
error TS2673: Constructor of class 'Email' is private and only accessible within the class declaration.

const id: UserId = Email.parse("a@b.co");
error TS2322: Type 'Email' is not assignable to type 'UserId'.

User.restore({ id: "1", email: "a@b.c", passwordHash: "h", ... });
error TS2322: Type 'string' is not assignable to type 'UserId'.
error TS2322: Type 'string' is not assignable to type 'Email'.
error TS2322: Type 'string' is not assignable to type 'PasswordHash'.

User.register({ ..., isAdmin: true }, hasher);
error TS2353: Object literal may only specify known properties, and 'isAdmin' does not exist in type 'NewUser'.
```

Each message already points to the right path. A private constructor sends you looking for the factory methods. A read-only field sends you looking for the method that changes it. If the agent runs `tsc` after editing, it gets these messages along with the test results and fixes things before you even open the diff. In practice, the shape of the classes becomes an instruction the agent can't ignore, and it applies to every piece of generated code in the project, not just this one prompt.

## The repository does the restoring

The repository is the only class that turns a database row into an entity, and the only one that calls `restore`:

```user-repository.ts
export interface SqlClient {
  query<Row>(sql: string, params: unknown[]): Promise<Row[]>;
}

export class UserRepository {
  constructor(private readonly db: SqlClient) {}

  async findById(id: UserId): Promise<User | null> {
    const [row] = await this.db.query<UserRow>("select * from users where id = $1", [id.toString()]);
    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<void> {
    const s = user.toState();
    await this.db.query(
      `insert into users (id, email, password_hash, first_name, middle_name, last_name, created_at)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (id) do update set email = excluded.email`,
      [s.id.toString(), s.email.toString(), s.passwordHash.toString(), s.firstName, s.middleName, s.lastName, s.createdAt],
    );
  }

  private toDomain(row: UserRow): User {
    return User.restore({
      id: UserId.restore(row.id),
      email: Email.restore(row.email),
      passwordHash: PasswordHash.fromDigest(row.password_hash),
      firstName: row.first_name,
      middleName: row.middle_name,
      lastName: row.last_name,
      createdAt: row.created_at,
    });
  }
}
```

Those `restore` calls are the trust boundary, explicit and in one place. The data was already validated when it came in through `register`, so there's no need to validate it again here. If old data needs to fit a new rule, that's a migration, not a side effect of loading an entity.

In a review, a `restore` called outside the repository is the easiest thing to search for: someone, human or agent, is skipping validation.

## Use case and controller

The use case puts the pieces together. It takes its dependencies in the constructor and has a single method:

```register-user.ts
export class RegisterUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: NewUser): Promise<User> {
    const user = await User.register(input, this.hasher);
    await this.users.save(user);
    return user;
  }
}
```

Checking the shape of what comes in the request is the controller's job. It takes `unknown` and only hands the use case a `NewUser`, no library needed:

```register-user-controller.ts
export class RegisterUserController {
  constructor(private readonly registerUser: RegisterUser) {}

  async handle(body: unknown): Promise<{ id: string }> {
    const user = await this.registerUser.execute(this.parse(body));
    return { id: user.id.toString() };
  }

  private parse(body: unknown): NewUser {
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      throw new Error("Expected a JSON object");
    }
    const fields = body as Record<string, unknown>;
    const middleName = fields["middleName"];
    if (middleName !== undefined && typeof middleName !== "string") {
      throw new Error("middleName must be a string");
    }
    return {
      email: this.text(fields, "email"),
      password: this.text(fields, "password"),
      firstName: this.text(fields, "firstName").trim(),
      middleName: middleName?.trim() || undefined,
      lastName: this.text(fields, "lastName").trim(),
    };
  }

  private text(fields: Record<string, unknown>, key: string): string {
    const value = fields[key];
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`${key} is required`);
    }
    return value;
  }
}
```

The parameter is `unknown`, not `any`, so the compiler makes you prove each field's type before using it. `NewUser` is built field by field, so only what was read by name gets through. I tested it with a JSON carrying `isAdmin` and `__proto__`: both got dropped, and the user saved and loaded back was still a `User`. And since `parse` returns `NewUser`, if that type gains a required field, the controller stops compiling until someone handles it.

The controller doesn't repeat domain rules either. It only checks that `email` is a string. Whether that string is a valid email is up to `Email.parse`, inside `register`.

## The tsconfig helps too

Besides `strict`, two options make a difference here:

- `exactOptionalPropertyTypes` tells a missing field apart from a field that's present with the value `undefined`. In the example at the top, this is what turns the wiped-out `id` bug into a compile error.
- `noUncheckedIndexedAccess` makes `array[0]` be `T | undefined`, which is what it really is. It's why `findById` has to handle the case where the query returns no rows.

It works the same way with the agent: whatever is in the tsconfig applies to every piece of generated code, without anyone having to remember to ask.

## Do you still need to know this?

Less than before. But you can't skip it.

You probably won't type most of these lines. The agent writes the classes, the repository and the controller, and it does a good job when the shape is already set. What's still on you comes down to three things:

- asking for this shape (private constructor, `register` and `restore`, state as a type alias, value objects with a `private` member);
- glancing at the diff and spotting the shortcut (`Partial<T>` in the constructor, `Object.assign(this, ...)`, a mutable public field, `restore` outside the repository);
- deciding where the trust boundary goes.

Knowing how to model an entity used to mean knowing how to write these classes. Now it means knowing how to set up a shape where the agent can't write the wrong class, and letting the compiler hold every line to it.
