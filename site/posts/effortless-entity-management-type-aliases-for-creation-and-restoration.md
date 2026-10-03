---
topic: "Domain-Driven Design"
title: "Effortless Entity Management: Type Aliases for Creation and Restoration"
description: "Dive into how TypeScript type aliases simplify the creation and restoration of Domain-Driven Design (DDD) entities, offering a cleaner constructor pattern compared to traditional static factory methods. Discover the elegance and ease of maintenance that this approach brings to your code."
cover: "https://github.com/mkuchak/blog/assets/3791148/3f04ab80-ccf4-46d9-8ce2-360c60b0fe31"
date: 2024-02-08
tags: ["Domain-Driven Design", "TypeScript", "Design Patterns", "Type Aliases"]
---

### TL;DR

In this article, we'll explore how to use TypeScript type aliases to simplify the creation and restoration of Domain-Driven Design (DDD) entities. By leveraging type aliases, we can achieve a cleaner constructor pattern, enhancing readability and maintainability. 

This approach offers a more elegant and flexible solution compared to traditional static factory methods, aligning with TypeScript's strengths in expressing complex domain models.

For a fast track to the code and examples, jump to the [The Approach of Type Aliases](#the-approach-of-type-aliases) and [Creating the `ClassProps<T, U>` Type Alias](#creating-the-classpropst-u-type-alias) sections.

---

As we delve into the intricate world of Domain-Driven Design (DDD), we encounter the need for elegant solutions that simplify code complexity, ensuring easier maintenance and evolution. Today, I invite you to explore a new approach using TypeScript type aliases, offering a perfect method for creating and restoring entities within the DDD framework. Say goodbye to the confusion of stacking confusing properties in a constructor or creating static factory methods to instantiate your entities.

## The Implications of Stacking Properties in a Constructor

When creating an entity, it's common to stack properties in a constructor. This can be problematic, especially when you have many properties. After all, the order of properties matters, and if you forget to pass an argument, TypeScript may not be able to detect the error. Additionally, if you add a new property, depending on its position, you'll need to update all the places where the entity is instantiated. Let's look at an example:

```User.ts
import crypto from "node:crypto";

export class User {
  constructor(
    public id?: string = crypto.randomUUID(),
    public email: string,
    public password: string,
    public surname: string,
    public givenName: string,
    public middleName?: string
  ) {}
}
```

When instantiating the `User` entity, you need to pass all the arguments in the correct order.

```ts
const user = new User(
  undefined,
  "johndoe@example.com",
  "p@$$w0rd",
  "Doe",
  "John",
  "Smith"
);
```

Here, besides having a less elegant entity creation, having to pass `undefined` for `id`, we also have to pass all arguments in the correct order. If we forget to pass an argument, TypeScript may not be able to detect the error if the next property is optional.

## What about Value Objects?

The situation becomes even more complicated when we have value objects. For example, let's suppose we have two value objects `Email` and `Password`, which are used in the aggregate root `User`.

```Email.ts
export class Email {
  constructor(readonly value: string) {
    if (!/^\S+@\S+$/.test(value)) {
      throw new Error("Invalid email");
    }
  }
}
```

```Password.ts
export class Password {
  constructor(readonly value: string) {
    if (value.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
  }

  // hash and verify methods...
}
```

Now, the `User` entity uses these value objects.

```User.ts
import crypto from "node:crypto";
import { Email } from "./Email";
import { Password } from "./Password";

export class User {
  constructor(
    public id?: string = crypto.randomUUID(),
    public email: string | Email,
    public password: string | Password,
    public surname: string,
    public givenName: string,
    public middleName?: string
  ) {
    if (typeof email === "string") {
      this.email = new Email(email);
    }
    if (typeof password === "string") {
      this.password = new Password(password);
    }
  }
}

const user = new User(
  undefined,
  "johndoe@example.com",
  "p@$$w0rd",
  "Doe",
  "John",
  "Smith"
);

console.log(user.email.value); // ❌ Property 'value' does not exist on type 'string | Email'.
```

Here, we have a problem. TypeScript cannot infer that `user.email` is of type `Email`, as the `User` entity constructor accepts both `string` and `Email`. This is a problem because we don't want `user.email` to be of type `string`. Additionally, we have to check if `email` and `password` are of type `string` and, if they are, instantiate the value objects `Email` and `Password`. This is repetitive code and prone to errors.

## The Approach of Static Factory Methods

A common approach to solving these problems is to use static factory methods. This allows us to create methods that instantiate the entity and can have a more descriptive name. Additionally, we can use value objects as arguments only in the private constructor method, avoiding the need to check the type of arguments.

```User.ts
import crypto from "node:crypto";
import { Email } from "./Email";
import { Password } from "./Password";

export class User {
  private constructor(
    public id: string,
    public email: Email,
    public password: Password,
    public surname: string,
    public givenName: string,
    public middleName?: string
  ) {}

  static create(
    email: string,
    password: string,
    surname: string,
    givenName: string,
    middleName?: string
  ): User {
    return new User(
      crypto.randomUUID(),
      new Email(email),
      new Password(password),
      surname,
      givenName,
      middleName
    );
  }

  static restore(
    id: string,
    email: string,
    password: string,
    surname: string,
    givenName: string,
    middleName?: string
  ): User {
    return new User(
      id,
      new Email(email),
      new Password(password),
      surname,
      givenName,
      middleName
    );
  }
}

const user = User.create(
  "johndoe@example.com",
  "p@$$w0rd",
  "Doe",
  "John",
  "Smith"
);

console.log(user.email.value); // ✅ johndoe@example.com
```

Static factory methods solve the problem. However, this approach also has its disadvantages. For example, if you add a new property, you'll have to update all static factory methods. Additionally, you'll have to create a static factory method for each combination of properties you want to allow.

## The Approach of Type Aliases

A more elegant approach to solving these problems is to use type aliases. This allows us to create an object that represents all the properties of the entity and place it directly in the constructor method. This object can be typed using a `ClassProps<T, U>` type alias (we'll see how to create this alias later) that infers all the properties of the aggregate root, where `T` is the entity and `U` is an optional typing representing the properties of the entity that can be replaced. This replacement is necessary when we have value objects and want the constructor method to accept primitive types to later instantiate the value objects.

```User.ts
import crypto from "node:crypto";
import { Email } from "./Email";
import { Password } from "./Password";

export type UserProps = ClassProps<User, { email: string; password: string }>; // ✨ Here is the magic!

export class User {
  id?: string = crypto.randomUUID();
  email: Email;
  password: Password;
  surname!: string;
  givenName!: string;
  middleName?: string;

  constructor(props: UserProps) {
    Object.assign(this, props); // ✨ Assign all properties to the instance at once!
    this.email = new Email(props.email);
    this.password = new Password(props.password);
  }
}

const user = new User({
  email: "johndoe@example.com",
  password: "p@$$w0rd",
  surname: "Doe",
  givenName: "John",
  middleName: "Smith",
});

console.log(user.email.value); // ✅ johndoe@example.com
```

See how we achieved leaner code. We started using a `props` object that represents all the properties of the entity and passed it directly to the constructor method. Additionally, we used `Object.assign` to assign all properties to the object at once. This is a safer approach, as it avoids the need to pass all arguments in the correct order and also avoids the need to check the type of arguments.

```ts
// `UserProps` using `ClassProps` type alias with `U` to replace specific properties will look like this:
type UserProps = {
  id?: string;
  email: string;
  password: string;
  surname: string;
  givenName: string;
  middleName?: string;
};
```

You may have noticed that we need to use the non-null assertion operator (`!`) for the `surname` and `givenName` properties. This is necessary because when using `Object.assign`, TypeScript cannot infer that these properties have been assigned to the object. To resolve this, we have 3 options:

- Use `!` for all properties that are mandatory;
- Manually set the value in the constructor (e.g., `this.surname = props.surname`);
- Or disable (not recommended!) null and undefined checks in `tsconfig.json`: `strictNullChecks: false`.

`strictNullChecks` is a TypeScript setting that promotes code safety and robustness by requiring developers to explicitly handle values that can be null or undefined. By making these situations more explicit, TypeScript helps prevent runtime errors, improves code readability and maintainability, and facilitates interoperability with existing JavaScript code. This approach promotes a more defensive programming practice, resulting in more reliable code less prone to errors.

## Creating the `ClassProps<T, U>` Type Alias

The magic of our example happens in the definition of `UserProps` through the `ClassProps` alias. It encapsulates the writable properties of the `User` class and allows for specific sets of properties to be defined for different entity creation scenarios.

`ClassProps` is an abstraction that leverages TypeScript's conditional inference capability to extract writable properties from a class. However, this is not a native alias and needs to be declared in your project.

```index.d.ts
declare global {
  type ExcludeMethods<T> = Pick<
    T,
    {
      [K in keyof T]: T[K] extends Function ? never : K;
    }[keyof T]
  >;
  type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X
    ? 1
    : 2) extends <T>() => T extends Y ? 1 : 2
    ? A
    : B;
  type WritableKeys<T> = {
    [P in keyof T]-?: IfEquals<
      { [Q in P]: T[P] },
      { -readonly [Q in P]: T[P] },
      P
    >;
  }[keyof T];
  type ExtractClassProps<T> = ExcludeMethods<Pick<T, WritableKeys<T>>>;
  type ClassProps<T, U = ExtractClassProps<T>> = Omit<
    ExtractClassProps<T>,
    keyof U
  > &
    U;
}

export {};
```

This TypeScript declaration file (`index.d.ts`) defines several type aliases meant to aid in type manipulation and inference. Let's break down what each alias does and why `declare global` and `export {}` are used:

1. `declare global`: This is used to declare global scope augmentation. It allows you to add declarations to the global scope from within a module. In this context, it's used to ensure that the type aliases declared within this file are available globally throughout your TypeScript project.
2. `export {}`: This is a TypeScript syntax used to ensure that the file is treated as a module. Even if the file doesn't export anything explicitly, it's still considered a module. This helps prevent potential conflicts with other modules and ensures proper encapsulation.

Now, let's examine each type alias:

- `ExcludeMethods<T>`: This alias is used to exclude any methods from a type `T`. It utilizes TypeScript's mapped types (`Pick` and key mapping) along with conditional types to achieve this. For each key `K` in `T`, it checks if the type of `T[K]` is a function. If it is, it excludes that key from the resulting type, otherwise includes it.
- `IfEquals<X, Y, A = X, B = never>`: This alias is a conditional type that checks whether two types `X` and `Y` are equal. If they are equal, it evaluates to type `A`, otherwise to type `B`. It's a complex type leveraging conditional type inference.
- `WritableKeys<T>`: This alias calculates the keys of a type `T` that are writable, i.e., not marked as `readonly`. It uses a mapped type to iterate through all keys of `T` and uses the `IfEquals` type to determine if the property is writable or not.
- `ExtractClassProps<T>`: This alias extracts all properties from a type `T` that are not methods and are writable. It combines `ExcludeMethods` and `WritableKeys` to achieve this.
- `ClassProps<T, U = ExtractClassProps<T>>`: This alias takes a type `T` and an optional type `U` (defaults to `ExtractClassProps<T>`), and returns a type that includes all properties from `T` that are not methods and are writable but excludes properties defined in `U`. It essentially provides a way to extend or modify the properties of a class type.

Overall, these type aliases are useful for working with TypeScript's type system to manipulate and extract properties from types in a generic and reusable manner. The combination of `declare global` and `export {}` ensures that these type aliases are globally available while maintaining proper encapsulation and module behavior.

## Benefits of the Approach

The type aliases approach offers several benefits compared to other approaches, such as stacking properties in a constructor or using static factory methods:

- **Enhanced Readability:** Clearer constructor with focused property assignments.
- **Greater Maintainability:** Easier to understand and modify entity creation logic.
- **Type Safety:** Type aliases ensure type correctness.
- **Flexibility:** Customizable construction using different sets of properties.
- **Alignment with TypeScript:** Leveraging TypeScript's strengths for clear type definitions.
- **No Code Duplication:** The type alias definition for `ClassProps` allows writable properties to be extracted generically, without the need to repeat the logic for each class.

## Conclusion

In the code, we've incorporated a set of type aliases in `index.d.ts` to simplify TypeScript type definitions. These aliases serve to exclude methods, extract writable keys, and provide utility functions for handling class properties. The `U` in `ClassProps<T, U>` allows for the replacement of specific properties of the class, offering flexibility in customizing entity instantiation.

In this exploration of simplifying Domain-Driven Design (DDD) with TypeScript type aliases, we've addressed the challenges posed by traditional static factory methods. By adopting a cleaner constructor pattern and leveraging powerful type aliases, we've enhanced the readability and maintainability of our code.

The alternative approach showcased in the `User.ts` file demonstrates how type aliases, such as `ClassProps`, can replace the need for static factory methods. This not only streamlines the code but also aligns with TypeScript's strengths in expressing complex domain models.

By embracing these techniques, developers can build more intuitive and expressive codebases, reducing the cognitive load associated with intricate DDD implementations. TypeScript's type system, coupled with thoughtful design choices, empowers developers to create robust and readable domain models, laying the foundation for scalable and maintainable applications.

### Additional Considerations

By adopting type aliases along with the constructor pattern, you can simplify the creation and restoration of DDD entities, resulting in more readable, maintainable, and type-safe code. This approach aligns well with TypeScript features and promotes better organization and understanding of the code.

- Consider incorporating error handling and validation in constructors or separate methods for greater robustness.
- Adapt the approach to your specific domain model and development preferences, striking a balance between clarity and complexity.

By embracing these refinements and carefully considering your domain requirements, you can safely employ type aliases to streamline DDD entity creation and enhance the overall quality of your codebase.

