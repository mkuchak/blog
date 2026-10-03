---
topic: "Domain-Driven Design"
title: "Gerenciamento de entidades sem esforço: type aliases para criação e restauração"
description: "Veja como os type aliases do TypeScript simplificam a criação e a restauração de entidades no Domain-Driven Design (DDD), com um padrão de constructor mais limpo do que os tradicionais static factory methods. Descubra a elegância e a facilidade de manutenção que essa abordagem traz para o seu código."
cover: "https://github.com/mkuchak/blog/assets/3791148/3f04ab80-ccf4-46d9-8ce2-360c60b0fe31"
date: 2024-02-08
tags: ["Domain-Driven Design", "TypeScript", "Padrões de Projeto", "Type Aliases"]
---

### TL;DR

Neste artigo, vamos ver como usar type aliases do TypeScript para simplificar a criação e a restauração de entidades no Domain-Driven Design (DDD). Com type aliases, chegamos a um padrão de constructor mais limpo, que melhora a legibilidade e a manutenibilidade. 

Essa abordagem é uma solução mais elegante e flexível do que os tradicionais static factory methods e combina com os pontos fortes do TypeScript na hora de expressar modelos de domínio complexos.

Se quiser ir direto ao código e aos exemplos, pule para as seções [A abordagem de type aliases](#a-abordagem-de-type-aliases) e [Criando o type alias `ClassProps<T, U>`](#criando-o-type-alias-classpropst-u).

---

Quando mergulhamos no mundo complexo do Domain-Driven Design (DDD), surge a necessidade de soluções elegantes que reduzam a complexidade do código e facilitem a manutenção e a evolução. Hoje, convido você a conhecer uma nova abordagem com type aliases do TypeScript, um método perfeito para criar e restaurar entidades dentro do DDD. Diga adeus à confusão de empilhar propriedades no constructor ou de criar static factory methods para instanciar suas entidades.

## As implicações de empilhar propriedades no constructor

Ao criar uma entidade, é comum empilhar as propriedades no constructor. Isso pode dar problema, principalmente quando há muitas propriedades. Afinal, a ordem das propriedades importa, e se você esquecer de passar um argumento, o TypeScript pode não detectar o erro. Além disso, se você adicionar uma nova propriedade, dependendo da posição dela, vai ter que atualizar todos os lugares onde a entidade é instanciada. Vamos ver um exemplo:

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

Ao instanciar a entidade `User`, você precisa passar todos os argumentos na ordem correta.

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

Aqui, além de a criação da entidade ficar menos elegante, já que temos que passar `undefined` para o `id`, também precisamos passar todos os argumentos na ordem correta. Se esquecermos um argumento, o TypeScript pode não detectar o erro caso a propriedade seguinte seja opcional.

## E os value objects?

A situação fica ainda mais complicada quando temos value objects. Por exemplo, suponha que temos dois value objects, `Email` e `Password`, usados no aggregate root `User`.

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

Agora, a entidade `User` usa esses value objects.

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

Aqui temos um problema. O TypeScript não consegue inferir que `user.email` é do tipo `Email`, já que o constructor da entidade `User` aceita tanto `string` quanto `Email`. Isso é ruim, porque não queremos que `user.email` seja do tipo `string`. Além disso, precisamos verificar se `email` e `password` são do tipo `string` e, se forem, instanciar os value objects `Email` e `Password`. É código repetitivo e propenso a erros.

## A abordagem de static factory methods

Uma forma comum de resolver esses problemas é usar static factory methods. Assim, criamos métodos que instanciam a entidade e que podem ter um nome mais descritivo. Além disso, podemos usar os value objects como argumentos apenas no constructor privado, sem precisar verificar o tipo dos argumentos.

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

Os static factory methods resolvem o problema. Mas essa abordagem também tem suas desvantagens. Por exemplo, se você adicionar uma nova propriedade, vai ter que atualizar todos os static factory methods. Além disso, vai precisar criar um static factory method para cada combinação de propriedades que quiser permitir.

## A abordagem de type aliases

Uma forma mais elegante de resolver esses problemas é usar type aliases. Com eles, criamos um objeto que representa todas as propriedades da entidade e o passamos direto no constructor. Esse objeto pode ser tipado com um type alias `ClassProps<T, U>` (veremos como criar esse alias mais adiante), que infere todas as propriedades do aggregate root, onde `T` é a entidade e `U` é uma tipagem opcional que representa as propriedades da entidade que podem ser substituídas. Essa substituição é necessária quando temos value objects e queremos que o constructor aceite tipos primitivos para depois instanciar os value objects.

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

Veja como o código ficou mais enxuto. Passamos a usar um objeto `props` que representa todas as propriedades da entidade e o passamos direto para o constructor. Além disso, usamos `Object.assign` para atribuir todas as propriedades ao objeto de uma só vez. É uma abordagem mais segura, porque dispensa passar todos os argumentos na ordem correta e também dispensa verificar o tipo dos argumentos.

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

Talvez você tenha reparado que precisamos usar o non-null assertion operator (`!`) nas propriedades `surname` e `givenName`. Isso é necessário porque, ao usar `Object.assign`, o TypeScript não consegue inferir que essas propriedades foram atribuídas ao objeto. Para resolver isso, temos 3 opções:

- Usar `!` em todas as propriedades obrigatórias;
- Definir o valor manualmente no constructor (por exemplo, `this.surname = props.surname`);
- Ou desativar (não recomendado!) as verificações de null e undefined no `tsconfig.json`: `strictNullChecks: false`.

`strictNullChecks` é uma configuração do TypeScript que deixa o código mais seguro e robusto ao exigir que o desenvolvedor trate explicitamente os valores que podem ser null ou undefined. Ao tornar essas situações mais explícitas, o TypeScript ajuda a evitar erros em tempo de execução, melhora a legibilidade e a manutenibilidade do código e facilita a interoperabilidade com código JavaScript existente. Essa abordagem favorece uma programação mais defensiva, o que resulta em código mais confiável e menos propenso a erros.

## Criando o type alias `ClassProps<T, U>`

A mágica do nosso exemplo acontece na definição de `UserProps` por meio do alias `ClassProps`. Ele encapsula as propriedades graváveis da classe `User` e permite definir conjuntos específicos de propriedades para diferentes cenários de criação da entidade.

`ClassProps` é uma abstração que usa a capacidade de inferência condicional do TypeScript para extrair as propriedades graváveis de uma classe. Só que esse alias não é nativo e precisa ser declarado no seu projeto.

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

Esse arquivo de declaração do TypeScript (`index.d.ts`) define vários type aliases que ajudam na manipulação e na inferência de tipos. Vamos destrinchar o que cada alias faz e por que usamos `declare global` e `export {}`:

1. `declare global`: serve para declarar uma extensão do escopo global. Permite adicionar declarações ao escopo global a partir de um módulo. Neste contexto, garante que os type aliases declarados neste arquivo fiquem disponíveis globalmente em todo o projeto TypeScript.
2. `export {}`: é uma sintaxe do TypeScript usada para garantir que o arquivo seja tratado como um módulo. Mesmo que o arquivo não exporte nada explicitamente, ele continua sendo considerado um módulo. Isso ajuda a evitar possíveis conflitos com outros módulos e garante o encapsulamento adequado.

Agora, vamos analisar cada type alias:

- `ExcludeMethods<T>`: este alias exclui todos os métodos de um tipo `T`. Para isso, ele usa os mapped types do TypeScript (`Pick` e mapeamento de chaves) junto com conditional types. Para cada chave `K` em `T`, ele verifica se o tipo de `T[K]` é uma função. Se for, exclui essa chave do tipo resultante; caso contrário, a inclui.
- `IfEquals<X, Y, A = X, B = never>`: este alias é um conditional type que verifica se dois tipos `X` e `Y` são iguais. Se forem, resulta no tipo `A`; caso contrário, no tipo `B`. É um tipo complexo que se apoia na inferência de conditional types.
- `WritableKeys<T>`: este alias calcula as chaves de um tipo `T` que são graváveis, ou seja, que não estão marcadas como `readonly`. Ele usa um mapped type para percorrer todas as chaves de `T` e usa o tipo `IfEquals` para determinar se a propriedade é gravável ou não.
- `ExtractClassProps<T>`: este alias extrai todas as propriedades de um tipo `T` que não são métodos e são graváveis. Para isso, ele combina `ExcludeMethods` e `WritableKeys`.
- `ClassProps<T, U = ExtractClassProps<T>>`: este alias recebe um tipo `T` e um tipo opcional `U` (que por padrão é `ExtractClassProps<T>`) e retorna um tipo que inclui todas as propriedades de `T` que não são métodos e são graváveis, mas exclui as propriedades definidas em `U`. Na prática, ele oferece uma forma de estender ou modificar as propriedades de um tipo de classe.

No geral, esses type aliases são úteis para trabalhar com o sistema de tipos do TypeScript, manipulando e extraindo propriedades de tipos de forma genérica e reutilizável. A combinação de `declare global` e `export {}` garante que esses type aliases fiquem disponíveis globalmente, mantendo o encapsulamento e o comportamento de módulo adequados.

## Benefícios da abordagem

A abordagem de type aliases traz vários benefícios em comparação com outras abordagens, como empilhar propriedades no constructor ou usar static factory methods:

- **Mais legibilidade:** constructor mais claro, com atribuições de propriedades bem focadas.
- **Mais manutenibilidade:** a lógica de criação de entidades fica mais fácil de entender e modificar.
- **Type safety:** os type aliases garantem a correção dos tipos.
- **Flexibilidade:** construção personalizável com diferentes conjuntos de propriedades.
- **Alinhamento com o TypeScript:** aproveita os pontos fortes do TypeScript para definições de tipo claras.
- **Sem duplicação de código:** a definição do type alias `ClassProps` permite extrair as propriedades graváveis de forma genérica, sem precisar repetir a lógica em cada classe.

## Conclusão

No código, incorporamos um conjunto de type aliases em `index.d.ts` para simplificar as definições de tipo do TypeScript. Esses aliases servem para excluir métodos, extrair chaves graváveis e oferecer utilitários para lidar com as propriedades de classes. O `U` em `ClassProps<T, U>` permite substituir propriedades específicas da classe, o que dá flexibilidade para personalizar a instanciação das entidades.

Nesta exploração de como simplificar o Domain-Driven Design (DDD) com type aliases do TypeScript, tratamos dos desafios trazidos pelos tradicionais static factory methods. Ao adotar um padrão de constructor mais limpo e usar type aliases poderosos, melhoramos a legibilidade e a manutenibilidade do nosso código.

A abordagem alternativa mostrada no arquivo `User.ts` demonstra como type aliases, como o `ClassProps`, podem substituir a necessidade de static factory methods. Isso não só deixa o código mais enxuto, como também se alinha aos pontos fortes do TypeScript na hora de expressar modelos de domínio complexos.

Ao adotar essas técnicas, desenvolvedores conseguem construir bases de código mais intuitivas e expressivas, reduzindo a carga cognitiva das implementações de DDD mais complexas. O sistema de tipos do TypeScript, aliado a decisões de design bem pensadas, permite criar modelos de domínio robustos e legíveis, o que estabelece a base para aplicações escaláveis e fáceis de manter.

### Considerações adicionais

Ao adotar type aliases junto com o padrão de constructor, você simplifica a criação e a restauração de entidades DDD e chega a um código mais legível, mais fácil de manter e com type safety. Essa abordagem combina bem com os recursos do TypeScript e favorece uma melhor organização e compreensão do código.

- Considere incorporar tratamento de erros e validação nos constructors ou em métodos separados, para ganhar mais robustez.
- Adapte a abordagem ao seu modelo de domínio e às suas preferências de desenvolvimento, buscando um equilíbrio entre clareza e complexidade.

Com esses refinamentos e uma análise cuidadosa dos requisitos do seu domínio, você pode usar type aliases com segurança para simplificar a criação de entidades DDD e melhorar a qualidade geral da sua base de código.

