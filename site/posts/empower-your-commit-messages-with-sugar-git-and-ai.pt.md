---
topic: "Conventional Commits"
title: "Turbine suas mensagens de commit com Sugar Git e IA"
description: "Descubra como esta ferramenta muda a forma como você trabalha com commits no Git. Conheça os benefícios de adotar conventional commits, a automação de mensagens de commit com IA e a simplificação dos fluxos de trabalho. Aumente sua produtividade e mantenha seus repositórios organizados com esta ferramenta poderosa."
cover: "https://github.com/mkuchak/blog/assets/3791148/95e049f3-aad0-40d0-919d-878c81842db5"
date: 2024-02-16
tags: ["Git", "Conventional Commits", "Sugar Git", "IA", "Workflow", "Produtividade"]
---

No universo dos sistemas de controle de versão, o Git se destaca como o padrão de fato, oferecendo recursos poderosos para rastrear mudanças em projetos de software. Porém, gerenciar commits no Git de forma eficaz muitas vezes envolve seguir convenções, manter a clareza semântica e garantir uma documentação significativa. É aí que entra o Sugar Git, que oferece açúcar sintático para o Git respeitando a semântica e as convenções modernas. Além disso, com a integração de Inteligência Artificial (IA), o Sugar Git traz uma abordagem inovadora para escrever mensagens de commit precisas e claras, otimizando o fluxo de trabalho e aumentando a produtividade.

## Entendendo os Conventional Commits

Antes de mergulhar nos recursos do Sugar Git, é essencial entender o conceito de Conventional Commits. Conventional Commits é uma especificação que propõe um formato estruturado para mensagens de commit. O objetivo é padronizar a forma como os desenvolvedores escrevem mensagens de commit, tornando-as mais descritivas, consistentes e legíveis por máquinas. O formato normalmente inclui um prefixo que indica o tipo de mudança (por exemplo, feat para novas funcionalidades, fix para correções de bugs), seguido de uma descrição sucinta e de um corpo opcional com mais detalhes.

## Principais recursos do Sugar Git

### 1. Fluxo de trabalho otimizado
O Sugar Git oferece um conjunto abrangente de comandos que simplificam o fluxo de trabalho com Git, cobrindo tarefas como preparar mudanças, fazer commit, resolver conflitos e fazer push para repositórios remotos. Cada comando do Sugar Git foi cuidadosamente pensado para aumentar a produtividade e garantir consistência ao longo de todo o ciclo de desenvolvimento.

Aqui estão alguns dos principais comandos oferecidos pela ferramenta:

1. **`sgit wipe`**: Desfaz todas as mudanças sem commit de acordo com a branch remota upstream.
2. **`sgit rollback`** (atalho `sgit rb`): Volta para o último commit.
3. **`sgit edit`**: Corrige erros na mensagem do último commit.
4. **`sgit amend`**: Adiciona arquivos esquecidos ao último commit.
5. **`sgit log`** ou **`sgit log <search_query>`** (atalho `sgit l`)`: Visualiza e encontra commits.
6. **`sgit status`** (atalho `sgit s`): Visualiza a staging area.
7. **`sgit <type> <description>`**: Cria uma mensagem de commit de acordo com a especificação Conventional Commits, onde `<type>` é o tipo de mudança (por exemplo, feat, fix, chore) e `<description>` é uma breve descrição da mudança.
8. **`sgit --help`**: Navega pela documentação completa.

<details>
<summary>Clique para ver mais comandos</summary>
```bash
$ sgit -h
sgit - Syntactic sugar for Git, respecting semantics and modern conventions

Usage:
  sgit COMMAND
  sgit [COMMAND] --help | -h
  sgit --version | -v

Branches Commands:
  ls            List all branches, only remote or only local
  take          Create new branch
  cd            Change the current working branch
  mv            Rename some branch
  rm            Delete some branch

State Commands:
  save          Save credentials storage in git repository
  remote        Show the current remote repository
  wipe          Wipe the working branch as per the remote branch
  rollback      Back the commit history, but it preserves the file contents
  edit          Edit some commit message
  get           Fetch and merge changes from remote branch to working branch (pull shortcut)
  put           Send committed changes from working branch to the respective remote branch (push shortcut)

Consult Commands:
  log           Search in the history commit by applying some filters
  status        Show the current state of git working directory and staging area
  incoming      Show the incoming commits from remote branch that is not in the working branch
  outgoing      Show the outgoing commits from working branch that is not in the remote branch
  committers    Show the committers of the current branch

Staging Commands:
  add           Add files or directories to staging area
  sub           Remove files or directories from staging area
  amend         Add all untracked, modified and deleted files to the last commit without edit the message
  resolve       Resolve conflicts in the working branch
  tag           Add an annotated tag with the description same as the message

Commit Commands:
  commit        Use AI to generate a commit message according the description in any language
  build         Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
  chore         Code change that external user won\'t see (eg: change to .gitignore file or .prettierrc file)
  ci            Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
  docs          Documentation only changes
  feat          New feature
  fix           Bug fix
  localize      Translations update
  perf          Code change that improves performance
  refactor      Code change that neither fixes a bug nor adds a feature; refactoring production code, eg. renaming a variable
  revert        Reverts a previous commit
  style         Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
  test          Adding missing tests or correcting existing tests

Completions Commands:
  completions   Generate bash completions

Options:
  --help, -h
    Show this help

  --version, -v
    Show version number
```
</details>

Esses comandos ganham ainda mais força com o alinhamento do Sugar Git à especificação Conventional Commits, o que simplifica a criação de mensagens de commit convencionais. Esse alinhamento resulta em um histórico de commits mais claro e organizado, permitindo que os desenvolvedores comuniquem com eficácia a natureza das mudanças e automatizem a geração de release notes e changelogs.

### 2. Gerenciamento semântico de branches
O Sugar Git simplifica o gerenciamento de branches com comandos fáceis de usar, seguindo uma abordagem baseada em convenções que permite categorizar as branches de acordo com o seu propósito, como branches de feature, de correção de bugs, hotfixes e experimentos.

Aqui estão alguns comandos essenciais que o Sugar Git oferece para o gerenciamento de branches:

1. **`sgit ls`**: Lista as branches.
2. **`sgit take <branch_name>`**: Cria uma nova branch.
3. **`sgit cd <branch_name>`**: Muda para a branch especificada.
4. **`sgit mv <old_branch_name> <new_branch_name>`**: Renomeia uma branch.
5. **`sgit rm <branch_name>`**: Remove uma branch.

<details>
<summary>Clique para ver mais comandos</summary>
```bash
$ sgit take -h
sgit take - Create new branch

Alias: mkdir

Usage:
  sgit take [DESCRIPTION] [OPTIONS]
  sgit take --help | -h

Options:
  --origin, -o
    Defines if the branch should also be created in the origin

  --only-origin, -O
    Defines if the branch should be only created in the origin

  --main
    The production branch

  --staging, -s
    Demo branch and decisions about release features

  --test, -t
    Contains all codes ready for QA testing

  --dev, -d
    All new features and bug fixes; codes conflicts should be done here

  --feature, -f DESCRIPTION
    Any code changes for a new module or use case; should be created based on
    the current development branch

  --bugfix, -b DESCRIPTION
    If the code changes made from the feature branch were rejected after a
    release, sprint or demo

  --hotfix, -H DESCRIPTION
    If there is a need to fix something that should be handled immediately;
    could be merged directly to the production branch

  --experimental, -e DESCRIPTION
    Any new feature or idea that is not part of a release or a sprint; a branch
    for playing around

  --build, -u DESCRIPTION
    A branch specifically for creating specific build artifacts or for doing
    code coverage runs

  --release, -r DESCRIPTION
    A branch for tagging a specific release version

  --merge, -m DESCRIPTION
    Resolving merge conflicts, usually between the latest development and a
    feature or hotfix branch; also to merge two branches of one feature

  --help, -h
    Show this help

Arguments:
  DESCRIPTION
    The description is a brief explanation about the branch purpose

Examples:
  [Command]
  - sgit take -f "my really awesome feature" -o
  [Result]
  - git checkout -b "feature/my-really-awesome-feature"
  - git push origin "feature/my-really-awesome-feature"
```
</details>

Esses comandos permitem que os desenvolvedores realizem com facilidade diversas operações com branches, incluindo criação, remoção, renomeação e troca. Além disso, é possível aprender a criar branches semânticas com flags consultando a documentação com `sgit take --help`.

### 3. Mensagens de commit com IA
Um dos recursos de maior destaque do Sugar Git é a integração com IA para gerar mensagens de commit. O comando `sgit commit <description_in_any_language>` (atalho `sgit c`) ajuda a criar uma mensagem de commit com o auxílio da IA. Ele analisa a descrição das mudanças e sugere automaticamente uma mensagem de commit precisa e clara. Isso reduz bastante a carga cognitiva dos desenvolvedores, permitindo que eles foquem mais em programar e menos em redigir mensagens de commit.

## Usando o Sugar Git

### Instalação
Para começar a usar o Sugar Git, certifique-se de ter o Bash 4.0 ou superior, o `curl` e o `git` instalados no seu sistema. Você pode instalar o Sugar Git usando o script de setup fornecido ou manualmente, baixando o script `sgit` e tornando-o executável. Vale também configurar o editor padrão do Git e outras opções para ter uma experiência mais fluida.

```bash
# Installation via setup script (switch to bash to install)
bash <(curl -Ls raw.githubusercontent.com/mkuchak/sugar-git/main/setup)
```

### Primeiros passos
Depois de instalado, o Sugar Git facilita de forma natural o gerenciamento de repositórios Git, simplificando cada etapa do fluxo de trabalho, da inicialização ao commit e ao push das mudanças para repositórios remotos.

Veja como começar:

```bash
# Create a project and enter the directory
mkdir my-project
cd my-project

# Initialize a Git repository and rename the branch to `main`
git init
sgit mv master main

# Create files
npm init -y
echo "console.log('Hello, world! 🌎')" > index.js
```

Agora, vamos fazer nosso primeiro commit com `sgit commit`:

```bash
sgit c "my first commit, starting the project... added a main file named index.js with a simple print to screen saying hello to the world" -A
```

Opções para escolher:
1. **feat: create main file index.js with print 'Hello World'**
   
2. **feat: add initial main file index.js with simple print statement**
   
3. **chore: initialize project with main file index.js and basic 'Hello World' print**
   
4. **Generate more commit messages**
   - Permite gerar mensagens de commit adicionais ou (CTRL+C para sair).

Resultado prático do comando ao **escolher a opção 1**:
- `git add --all`
- `git commit -m "feat: create main file index.js with print 'Hello World'"`

Ou, se a descrição do commit for mais extensa, o corpo do commit também é sugerido:

```bash
sgit c "I did a major refactoring on buttons, refactored all buttons to aggregate into just one single component that has a variants and size property... this was because it was very confusing, the product team asked to speed up the development of the dashboards, so it was necessary to have everything centralized into just one component with variations because it was better than copying styles from other dashboards and instead centralizing the content, especially since we use quite a lot of similar buttons, there's rarely a new one, and this made everything messy with slightly different buttons that should be identical to each other" -Aep
```

A flag `-Aep` é uma combinação de `-A` (ou `--add-all`) para adicionar todas as mudanças à staging area, `-e` (ou `--edit`) para abrir o editor e editar a mensagem de commit, e `-p` (ou `--put`) para fazer push das mudanças para o repositório remoto depois que o commit for feito. Editar antes de fazer o commit é útil quando a mensagem é extensa e exige uma explicação mais detalhada ou uma revisão.

Opções para escolher:
1. **refactor: join buttons into single component with variants and sizes**
   - Refactored all buttons into a single reusable component that accepts variant and size props. The previous structure was confusing and hindered development speed for dashboards. Centralizing the button styles eliminates inconsistencies and streamlines maintenance as the team frequently uses identical buttons.

2. **refactor: implement button component with variants and sizes**
   - Introduced a new feature by implementing a button component that supports variants and sizes. This component streamlines the development of dashboards as per the product team's request, ensuring uniformity and ease of maintenance for different button styles.

3. **refactor: consolidate buttons into single component with variants and sizes**
   - Consolidated all buttons into a single component with variant and size properties. The decision to centralize button styles in response to the product team's request for faster dashboard development. This enhancement reduces confusion by standardizing button appearance.

4. **Generate more commit messages**
   - Permite gerar mensagens de commit adicionais ou (CTRL+C para sair).

Resultado prático do comando ao **escolher a opção 3**:

- `git add --all`
- `git commit -m "refactor: consolidate buttons into single component with variants and sizes\n\nConsolidated all buttons into a single component with variant and size properties. The decision to centralize button styles in response to the product team's request for faster dashboard development. This enhancement reduces confusion by standardizing button appearance." --edit`
- \* Abre o editor para editar a mensagem de commit *
- Depois de salvar e fechar o editor, o commit é feito e em seguida: `git push origin main`

## Conclusão

O Sugar Git aproxima o poder do Git da facilidade de uso, oferecendo aos desenvolvedores uma experiência mais intuitiva e produtiva. Ao adotar convenções semânticas, oferecer geração de mensagens de commit assistida por IA e otimizar os fluxos de trabalho com Git, o Sugar Git permite que os desenvolvedores foquem em escrever código de alta qualidade enquanto mantêm históricos de commits claros e informativos.

Seja você um usuário experiente de Git ou alguém que está começando agora, o Sugar Git é uma ferramenta valiosa para melhorar o seu fluxo de trabalho com controle de versão.

Para começar a usar o Sugar Git, acesse o [repositório no GitHub](https://github.com/mkuchak/sugar-git) para ver as instruções de instalação e a documentação.
