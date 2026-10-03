---
topic: "Conventional Commits"
title: "Empower your commit messages with Sugar Git and AI"
description: "Discover how this tool changes the way you work with Git commits. Explore the benefits of adopting conventional commits, automation of commit messages with AI, and streamlining of workflows. Boost your productivity and keep your repositories organized with this powerful tool."
cover: "https://github.com/mkuchak/blog/assets/3791148/95e049f3-aad0-40d0-919d-878c81842db5"
date: 2024-02-16
tags: ["Git", "Conventional Commits", "Sugar Git", "AI", "Workflow", "Productivity"]
---

In the realm of version control systems, Git stands out as the de facto standard, offering powerful capabilities for tracking changes in software projects. However, effectively managing Git commits often involves adhering to conventions, maintaining semantic clarity, and ensuring meaningful documentation. This is where Sugar Git comes into play, providing syntactic sugar for Git while respecting modern semantics and conventions. Furthermore, with the integration of Artificial Intelligence (AI), Sugar Git brings an innovative approach to crafting precise and clear commit messages, thus optimizing workflow and increasing productivity.

## Understanding Conventional Commits

Before delving into the features of Sugar Git, it's essential to understand the concept of Conventional Commits. Conventional Commits is a specification that proposes a structured commit message format. The goal is to standardize the way developers write commit messages, making them more descriptive, consistent, and machine-readable. The format typically includes a prefix indicating the type of change (e.g., feat for new features, fix for bug fixes), followed by a succinct description and an optional body providing more details.

## Key Features of Sugar Git

### 1. Optimized Workflow
Sugar Git provides a comprehensive array of commands that streamline the Git workflow, encompassing tasks such as preparing changes, committing, resolving conflicts, and pushing to remote repositories. Each command within Sugar Git is meticulously crafted to bolster productivity and ensure consistency across the development cycle.

Here are some key commands offered by the tool:

1. **`sgit wipe`**: Undo all uncommitted changes according to the upstream remote branch.
2. **`sgit rollback`** (shortcut `sgit rb`): Roll back to the last commit.
3. **`sgit edit`**: Correct mistakes in the last commit message.
4. **`sgit amend`**: Add forgotten files to the last commit.
5. **`sgit log`** or **`sgit log <search_query>`** (shortcut `sgit l`): View and find commits.
6. **`sgit status`** (shortcut `sgit s`): View the staging area.
7. **`sgit <type> <description>`**: Create a commit message according to the Conventional Commits specification, where `<type>` is the type of change (e.g., feat, fix, chore) and `<description>` is a brief description of the change.
8. **`sgit --help`**: Browse the full documentation.

<details>
<summary>Click to see more commands</summary>
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

These commands are augmented with Sugar Git's alignment with the Conventional Commits specification, simplifying the creation of conventional commit messages. This alignment fosters a clearer and more organized commit history, enabling developers to effectively communicate the nature of changes and automate the generation of release notes and changelogs.

### 2. Semantic Branch Management
Sugar Git simplifies branch management with its user-friendly commands, adhering to a convention-based approach that allows developers to categorize branches according to their purpose, such as feature branches, bug fix branches, hotfixes, and experiments.

Here are some essential commands provided by Sugar Git for branch management:

1. **`sgit ls`**: List branches.
2. **`sgit take <branch_name>`**: Create a new branch.
3. **`sgit cd <branch_name>`**: Switch to a specified branch.
4. **`sgit mv <old_branch_name> <new_branch_name>`**: Rename a branch.
5. **`sgit rm <branch_name>`**: Delete a branch.

<details>
<summary>Click to see more commands</summary>
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

These commands enable developers to easily perform various operations on branches, including creation, deletion, renaming, and switching. Additionally, developers can learn how to create semantic branches with flags by referring to the documentation with `sgit take --help`.

### 3. AI-powered Commit Messages
One of the standout features of Sugar Git is its AI integration for commit message generation. The command `sgit commit <description_in_any_language>` (shortcut `sgit c`) helps create a commit message with AI assistance. It will analyze the description of the changes and automatically suggest a precise and clear commit message. This significantly reduces the cognitive load on developers, allowing them to focus more on coding and less on composing commit messages.

## Using Sugar Git

### Installation
To start using Sugar Git, make sure you have Bash 4.0 or higher, `curl`, and `git` installed on your system. You can install Sugar Git using the provided setup script or manually, by downloading the `sgit` script and making it executable. Additionally, consider configuring your default Git editor and other settings for a smoother experience.

```bash
# Installation via setup script (switch to bash to install)
bash <(curl -Ls raw.githubusercontent.com/mkuchak/sugar-git/main/setup)
```

### Quick Start
Once Sugar Git is installed, it seamlessly facilitates Git repository management, simplifying every aspect of the Git workflow, from initialization to commit and pushing changes to remote repositories.

Here's how to get started:

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

Now, let's make our first commit with `sgit commit`:

```bash
sgit c "my first commit, starting the project... added a main file named index.js with a simple print to screen saying hello to the world" -A
```

Results to choose from:
1. **feat: create main file index.js with print 'Hello World'**
   
2. **feat: add initial main file index.js with simple print statement**
   
3. **chore: initialize project with main file index.js and basic 'Hello World' print**
   
4. **Generate more commit messages**
   - Allows generating additional commit messages or (CTRL+C to exit).

Practical results of the command when **choosing option 1**:
- `git add --all`
- `git commit -m "feat: create main file index.js with print 'Hello World'"`

Or, if your commit description is substantial, the commit body is suggested:

```bash
sgit c "I did a major refactoring on buttons, refactored all buttons to aggregate into just one single component that has a variants and size property... this was because it was very confusing, the product team asked to speed up the development of the dashboards, so it was necessary to have everything centralized into just one component with variations because it was better than copying styles from other dashboards and instead centralizing the content, especially since we use quite a lot of similar buttons, there's rarely a new one, and this made everything messy with slightly different buttons that should be identical to each other" -Aep
```

The `-Aep` flag is a combination of `-A` (or `--add-all`) to stage all changes, `-e` (or `--edit`) to open the editor to edit the commit message, and `-p` (or `--put`) to push the changes to the remote repository after the commit is made. Edit before committing is useful when the commit message is substantial and requires a more detailed explanation or review.

Results to choose from:
1. **refactor: join buttons into single component with variants and sizes**
   - Refactored all buttons into a single reusable component that accepts variant and size props. The previous structure was confusing and hindered development speed for dashboards. Centralizing the button styles eliminates inconsistencies and streamlines maintenance as the team frequently uses identical buttons.

2. **refactor: implement button component with variants and sizes**
   - Introduced a new feature by implementing a button component that supports variants and sizes. This component streamlines the development of dashboards as per the product team's request, ensuring uniformity and ease of maintenance for different button styles.

3. **refactor: consolidate buttons into single component with variants and sizes**
   - Consolidated all buttons into a single component with variant and size properties. The decision to centralize button styles in response to the product team's request for faster dashboard development. This enhancement reduces confusion by standardizing button appearance.

4. **Generate more commit messages**
   - Allows generating additional commit messages or (CTRL+C to exit).

Practical results of the command when **choosing option 3**:

- `git add --all`
- `git commit -m "refactor: consolidate buttons into single component with variants and sizes\n\nConsolidated all buttons into a single component with variant and size properties. The decision to centralize button styles in response to the product team's request for faster dashboard development. This enhancement reduces confusion by standardizing button appearance." --edit`
- \* Opens the editor to edit the commit message *
- After saving and closing the editor, the commit will be made with: `git push origin main`

## Conclusion

Sugar Git bridges the gap between Git's power and ease of use, providing developers with a more intuitive and productive experience. By embracing semantic conventions, offering AI-assisted commit message generation, and optimizing Git workflows, Sugar Git empowers developers to focus on writing high-quality code while maintaining clear and informative commit histories.

Whether you're a seasoned Git user or just starting out, Sugar Git is a valuable tool for enhancing your version control workflow.

To get started with Sugar Git, visit the [GitHub repository](https://github.com/mkuchak/sugar-git) for installation instructions and documentation.
