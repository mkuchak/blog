---
topic: "Domain-Driven Design"
title: "Entidades que o agente não consegue quebrar"
description: "Hoje quem escreve boa parte do código de domínio é um agente, e ele vai pelo caminho que o código deixa aberto. Como modelar a criação e a restauração de entidades em TypeScript, com classes, pra que o atalho errado nem compile."
cover: "https://github.com/mkuchak/blog/assets/3791148/3f04ab80-ccf4-46d9-8ce2-360c60b0fe31"
tags: ["Domain-Driven Design", "TypeScript", "Orientação a Objetos", "Agentes de IA"]
---

Você pede pro agente criar a entidade `User` e um endpoint pra trocar o e-mail. Em poucos segundos está tudo pronto, com teste passando. A dúvida que fica pra você já não é como escrever esse código. É se ele deixou alguma porta aberta.

O agente vai pelo caminho mais curto que compila e passa nos testes. Se a entidade deixa fazer `user.email = body.email`, é isso que vai aparecer no diff, porque funciona. Se o construtor aceita qualquer objeto, o body do request entra direto nele. Não é desleixo do modelo. É a classe deixando.

Então o que continua sendo trabalho seu é o formato: classes e tipos em que o atalho errado nem compila. Aí o compilador vira o revisor que lê cada linha gerada, inclusive as que você não vai ler. Neste texto eu mostro esse formato no caso mais comum de qualquer domínio, que é criar e restaurar uma entidade, em TypeScript puro e orientado a objetos.

## O jeito rápido que compila

Essa versão de `User` aparece direto por aí, escrita à mão ou gerada. É curta, fácil de ler e compila com `strict` ligado:

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

Testei o que ela deixa passar, no TypeScript 7 e no Node 24:

- `new User({})` compila e cria um usuário sem e-mail e sem senha. O `Partial` deixa tudo opcional.
- `new User({ id: row.id, ... })` com `row.id` vindo `undefined` apaga o UUID que o campo tinha acabado de gerar. A entidade fica sem id.
- Se o body do request vier com `isAdmin: true`, ele é copiado inteirinho pra dentro da entidade. O TypeScript só reclama de campo a mais em objeto literal, e o body é uma variável.
- Um JSON com a chave `__proto__` troca o protótipo do objeto. A entidade deixa de ser um `User` (o `instanceof` dá `false`), perde os métodos e herda o que veio no JSON.
- `user.email = "not an email"` compila. Qualquer parte do sistema muda qualquer campo sem passar por regra nenhuma.

Nenhum desses casos quebra um teste de caminho feliz. E todos chegam em produção.

## Criar não é restaurar

Antes de ir pro formato certo, tem uma diferença que esse construtor esconde. Um objeto de domínio nasce de dois jeitos, e cada um faz uma coisa.

| | Criar | Restaurar |
|---|---|---|
| De onde vem o dado | usuário, API, formulário | banco, fila, cache |
| Valida as regras | sim | não, já foi validado quando entrou |
| Gera id e data de criação | sim | não, vêm do banco |
| Senha | texto puro, vira hash | já é o hash |
| Emite evento de domínio | sim (`UserRegistered`) | não |

Validar de novo na restauração parece cuidado, mas é cilada. Se a regra de e-mail ficar mais rígida ano que vem, o sistema para de conseguir carregar usuário que está no banco há anos. Um hash de senha não tem nada a ver com a regra de "mínimo de 12 caracteres" de uma senha digitada. E se o `UserRegistered` for emitido toda vez que alguém carrega o usuário do banco, o e-mail de boas-vindas sai de novo.

São duas operações diferentes, então são dois métodos de fábrica. E isso vale da entidade até o menor value object.

## Value objects que não se misturam

Começa pelo menor pedaço, o e-mail:

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

Com o construtor privado, `new Email(...)` não compila fora da classe. Sobram dois caminhos: o `parse`, que valida e é pra dado que vem de fora, e o `restore`, que confia e é pra dado que já está no banco. É a mesma diferença da tabela, só que num valor.

E o `private readonly value` não está ali só pra encapsular. O TypeScript compara classes pela forma, não pelo nome. Se duas classes têm um campo público `readonly value: string`, pro compilador tanto faz uma ou outra. Testei: um `EmailVO` passa sem erro onde o código espera um `UserIdVO`. Com um membro `private` isso muda, porque o TypeScript só considera compatíveis duas classes com membros privados se esses membros vierem da mesma declaração. Daí `Email` e `UserId` viram tipos que não dá pra trocar um pelo outro.

O `UserId` segue o mesmo molde, só que com `generate` no lugar do `parse`:

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

O `PasswordHash` é igual, com um único `static fromDigest(digest: string)`, porque hash só existe depois que alguém calculou. E quem calcula fica fora do domínio, atrás de uma interface:

```password-hash.ts
export interface PasswordHasher {
  hash(plain: string): Promise<PasswordHash>;
}
```

## O estado vira um type alias

A entidade guarda o estado num type alias escrito à mão, que diz o que ela tem depois de válida:

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

Repara que o estado guarda `passwordHash`, e não `password`. A senha em texto puro é só entrada e nunca vai pro estado. E o `middleName` é `string | null`, que é o que o banco devolve, em vez de um campo opcional que às vezes está lá e às vezes não.

O tipo de entrada da criação sai do estado:

```user.ts
export type NewUser = Pick<UserState, "firstName" | "lastName"> & {
  email: string;
  password: string;
  middleName?: string | undefined;
};
```

O que é igual vem do estado, e o que muda de forma na entrada (o e-mail que ainda não foi validado, a senha em texto puro) fica declarado à parte. Usei `Pick` e não `Omit` de propósito, porque o `Pick` é uma lista do que entra. Se alguém (ou algum agente) adicionar um `lastLoginAt` no estado, ele não vira um campo que qualquer request consegue preencher. O compilador avisa que esse campo está faltando na criação, e alguém decide de onde ele vem.

Por último, os eventos que a entidade pode emitir, numa união discriminada:

```user.ts
export type UserEvent =
  | { type: "UserRegistered"; userId: UserId; at: Date }
  | { type: "EmailChanged"; userId: UserId; from: Email; to: Email; at: Date };
```

## A entidade

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

Como o construtor é privado, só existem dois jeitos de conseguir um `User`. O `register` valida, gera o que é do domínio, faz o hash e emite o evento. O `restore` só monta a entidade a partir de um estado que já é válido.

O estado fica num campo `private` e a leitura é por getter. Pra mudar alguma coisa, tem que passar por um método com nome de negócio, tipo o `changeEmail`, que é onde a regra fica e onde o evento nasce. Não tem `Object.assign`, então campo a mais e `__proto__` não têm por onde entrar. E não tem nenhum `!` calando o compilador.

Um detalhe que vale saber: o `private` do TypeScript só existe na compilação. Em runtime o campo está lá como qualquer outro, e isso tem um efeito chato. Sem o `toJSON`, um `JSON.stringify(user)` serializa o `state` inteiro, hash da senha incluído. Testei, e o digest aparece no JSON. Um agente que escreve `res.json(user)` num endpoint não tem como adivinhar isso. Com o `toJSON`, a representação pública da entidade fica definida num lugar só, e o hash nunca sai dali.

Pelo mesmo motivo, um `(user as any).state` chega no campo. Pro que este texto propõe, tudo bem: quem barra o atalho é o compilador, e um `as any` aparece no diff tanto quanto qualquer outro atalho.

## Deixa o compilador barrar

Agora as mesmas tentativas de atalho contra essas classes. As mensagens são as que o `tsc` cospe de verdade:

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

Cada mensagem já aponta o caminho certo. Construtor privado obriga a procurar os métodos de fábrica. Campo só de leitura obriga a procurar o método que muda aquele valor. Se o agente roda o `tsc` depois de editar, ele recebe essas mensagens junto com o resultado dos testes e corrige antes de você abrir o diff. Na prática, o formato das classes vira uma instrução que o agente não tem como ignorar, e que vale pra todo código gerado no projeto, não só pro prompt da vez.

## Quem restaura é o repositório

O repositório é a única classe que transforma linha do banco em entidade, e a única que chama `restore`:

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

Esses `restore` são a fronteira de confiança, explícita e num lugar só. O dado já foi validado quando entrou pelo `register`, então não precisa validar de novo aqui. Se tem dado antigo que precisa se adequar a uma regra nova, isso é migração, e não efeito colateral de carregar uma entidade.

Num review, um `restore` chamado fora do repositório é a coisa mais fácil de procurar: alguém, pessoa ou agente, está pulando a validação.

## Use case e controller

O use case junta as peças. Recebe as dependências no construtor e tem um método só:

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

Conferir o formato do que chega no request é papel do controller. Ele recebe `unknown` e só passa pro use case um `NewUser`, sem nenhuma lib:

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

O parâmetro é `unknown`, e não `any`, então o compilador obriga a provar o tipo de cada campo antes de usar. O `NewUser` é montado campo por campo, então só passa o que foi lido pelo nome. Testei com um JSON trazendo `isAdmin` e `__proto__`: os dois ficaram pelo caminho, e o usuário salvo e carregado de volta continuou sendo um `User`. E como o `parse` retorna `NewUser`, se esse tipo ganhar um campo obrigatório, o controller para de compilar até alguém tratar o campo novo.

O controller também não repete regra de domínio. Ele só confere se o `email` é uma string. Quem decide se essa string é um e-mail válido é o `Email.parse`, lá dentro do `register`.

## O tsconfig também ajuda

Além do `strict`, tem duas opções que fazem diferença aqui:

- `exactOptionalPropertyTypes` diferencia campo ausente de campo presente com valor `undefined`. No exemplo do começo, é ela que transforma o bug do `id` apagado em erro de compilação.
- `noUncheckedIndexedAccess` faz `array[0]` ser `T | undefined`, que é o que ele é de verdade. É por causa dela que o `findById` precisa tratar o caso em que a consulta não volta nenhuma linha.

Com o agente funciona do mesmo jeito: o que está no tsconfig vale pra todo código gerado, sem ninguém precisar lembrar de pedir.

## E você ainda precisa saber disso?

Menos do que antes. Mas não dá pra não saber.

Provavelmente você não vai digitar a maior parte dessas linhas. O agente escreve as classes, o repositório e o controller, e escreve bem quando o formato já está dado. O que continua sendo seu são três coisas:

- pedir esse formato (construtor privado, `register` e `restore`, estado como type alias, value objects com membro `private`);
- bater o olho no diff e reconhecer o atalho (`Partial<T>` no construtor, `Object.assign(this, ...)`, campo público mutável, `restore` fora do repositório);
- decidir onde fica a fronteira de confiança.

Saber modelar entidade era saber escrever essas classes. Hoje é saber montar o formato em que o agente não consegue escrever a classe errada, e deixar o compilador cobrar isso em cada linha.
