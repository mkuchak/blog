---
topic: "Git"
title: "I took the AI out of my Git CLI, and it got better"
description: "Sugar Git started as a handful of aliases in 2021, gained AI commit messages in 2024 and lost them in 2026. Then came 44 releases in three months. What changed, why, and what sgit does today."
cover: "https://github.com/mkuchak/blog/assets/3791148/95e049f3-aad0-40d0-919d-878c81842db5"
date: 2026-10-12
tags: ["Git", "Conventional Commits", "Sugar Git", "CLI", "Bash", "AI Agents"]
---

In February 2024 I wrote here about `sgit commit`. You described your change in any language, the command sent the text to a model and came back with four commit messages in Conventional Commits format. You picked one and that was it.

In April 2026 I deleted that feature. It was 72 lines, and `sgit commit` became a plain commit with a free-form message, no network and no menu. Version 1.0.0 shipped the same day. Over the next three months came 43 more releases, up to 2.20.0.

This post replaces the original. Today's Sugar Git is a different tool, and the reason for the change says more about how I use Git now than the AI feature ever did.

## From aliases to a CLI

The project started on April 17, 2021 as a few aliases in `.gitconfig`: `git ch`, `git rb`, `git st`, `git lg`. Shortcuts for the things I typed twenty times a day.

In November 2021 it became a real CLI, `sgit`, written in Bash with [Bashly](https://bashly.dev). Each command is a `.sh` file in `src/`, the whole interface (commands, flags, aliases, help text) lives in one `bashly.yml`, and the build produces a single executable file. No runtime and no dependencies beyond Bash 4, `curl` and `git`.

AI came in 2024. It left in 2026, and the rest of the CLI grew more in three months than it had in five years.

## Why the AI left

The AI version of `sgit commit` made an HTTP call to a Worker of mine in the middle of the commit. No internet, or the endpoint down, and there was no commit. For a tool whose whole point is making Git faster, that's a bad dependency to carry.

The shape was wrong too. The command opened an interactive menu with four options and waited for you to pick a number. That works for a person at a terminal and for nothing else: not a script, not a hook, not CI, not an agent.

And the main reason: most of the time now, the commit message is written by the agent that wrote the code. It has the whole diff and the context of the task. `sgit commit` only had the sentence I typed. A model summarizing my sentence loses to an agent describing its own diff.

So the command went back to being just sugar:

```bash
sgit feat "add google sign-in" -s auth -Ap
# git add --all
# git commit -m "feat(auth): add google sign-in"
# git push origin feature/login-com-google
```

Deterministic, offline, the same for me and for an agent. What's clever about sgit now is what happens after the commit: syncing, rewriting history and getting work back without losing anything.

## Commits

The twelve Conventional Commits types are commands: `feat`, `fix`, `chore`, `docs`, `build`, `ci`, `test`, `perf`, `refactor`, `revert`, `style` and `localize`. They all take the same flags.

| Flag | What it does |
|------|--------------|
| `-s auth` | scope, becomes `feat(auth): ...` |
| `-b` | breaking change, becomes `feat!: ...` |
| `-A` / `-a <file>` | stage everything, or one file, before committing |
| `-p` | push after the commit |
| `-e` | open the editor to write the body |
| `-d` / `-t` | custom date and time on the commit |

Before 1.0 these were twelve nearly identical files of 22 lines each. They became one-line calls to a shared function, and 264 lines of duplication went away.

Three commands look after history while you work:

```bash
sgit temp -A        # chore: WIP auth.js
sgit temp -A        # running it again amends the last one: chore: WIP(2) auth.js
sgit squash 2 "fix(auth): handle expired tokens with a single retry"
sgit edit 2593413 "feat(auth): add google sign-in"
```

`temp` is the "save progress" commit I used to make by hand before switching branches. Running it again doesn't add a commit. It amends the previous one and bumps the counter. `squash` folds the last N commits into one (or everything since a ref, with `--since main`). `edit` rewrites the message of an old commit without opening the interactive rebase editor: sgit injects a `GIT_SEQUENCE_EDITOR` that marks the commit as `reword` and writes the new message itself.

And `sgit undo` takes back the last commit and keeps the files.

## Branches and syncing

```bash
sgit take -f "login com google"     # feature/login-com-google
sgit take -H "token leak" -F main   # hotfix/token-leak, branched from main
sgit take                           # UUID name, for when the name doesn't matter
sgit ls                             # just the current branch
sgit ll -v                          # every branch, with ahead/behind and upstream state
sgit clean -r                       # delete branches already merged into main, local and remote
```

The command I lean on most is `sgit sync`: fetch, then rebase on top of `main` (or another branch, if you pass one). The first version did exactly that and nothing more. In May it got three fixes, all born from real pain in repositories with several people pushing.

First: when someone force-pushes any branch, `git fetch` can fail with `cannot lock ref 'refs/remotes/origin/...'`. The manual fix is a `git update-ref -d` that nobody remembers. Now sgit reads the error, deletes the stuck refs and retries on its own. That lives in a helper, `fetch_with_recovery`, which `get`, `take`, `wipe`, `incoming` and `outgoing` also use.

Second: if the fetch still failed, the rebase ran against stale refs and the result looked right without being right. Now sync stops.

Third: after your PR is squash-merged, your local commits are redundant with `main`, and `git rebase` stops on each one with "The previous cherry-pick is now empty". Sync now uses `--empty=drop` and drops those commits quietly.

`sgit wipe` got the same treatment. It resets the branch to the remote's state, and it used to do that against the last fetch, which could be days old. Now it fetches first and refuses to reset against stale data. With `--all` it also removes untracked and ignored files, and lists them before asking for confirmation.

## Force pushes that don't erase anyone's work

`sgit put -f` uses `--force-with-lease`, not `--force`. If someone pushed to the same branch after your last fetch, the push is refused:

```text
$ sgit put -f
 ! [rejected]        feature/login-com-google -> feature/login-com-google (stale info)
error: failed to push some refs to 'origin'
```

When you really do want to overwrite (the branch is yours alone, or the remote is in a state you don't care about), there's `--no-lease`. It has no one-letter shortcut on purpose. Typing the whole flag is a small speed bump, sized to the damage it can do.

## Stash, shelf and history

`sgit stash` is Git's stash with clearer verbs: `put`, `get`, `ls`, `peek`, `keep`, `drop`, and `move`, which stashes, switches branch and pops on the other side.

`sgit shelf` is the part I miss when I use plain Git. Stash keeps working-tree changes. The shelf keeps whole commits, with their hash, message, author and date:

```text
$ sgit shelf put 2 -m "token handling, revisit"
Shelved 2 commit(s) as 20261012-182434-2c-3ee5
  f72c5d1 fix(auth): retry once on 401
  a69c744 fix(auth): handle expired token

$ sgit shelf ls
[0] 20261012-182434-2c-3ee5  (2026-10-12 18:24, 2 commit(s))
    Label: token handling, revisit
    f72c5d1 fix(auth): retry once on 401
    a69c744 fix(auth): handle expired token
```

The commits live under `refs/sgit/shelf/<id>`, so nothing is lost and the reflog covers even an accidental `drop`. `sgit shelf get` cherry-picks the chain back, and on a conflict it keeps the shelf and tells you exactly what to run once you've resolved it.

For when something has already gone wrong, `sgit history` is the reflog made readable:

```text
$ sgit history
[0]  9 seconds ago   commit     fix(auth): handle expired tokens with a single retry
[1]  19 seconds ago  reset      moving to HEAD~2
[2]  9 seconds ago   cherry     fix(auth): retry once on 401
```

`sgit history restore 1` moves HEAD back to that point, after asking for confirmation.

## Reading code

`sgit who auth.js:42` is a `git blame` that doesn't stop at the hash. It shows the full message of the commit that touched that line. If the message was written well, it answers "why is this like this" without leaving the terminal.

`sgit log "token"` searches history with author and date filters, and `sgit incoming` and `sgit outgoing` show what's on the remote and not here, and the other way around.

## Worktrees

`sgit wt add fix/rate-limit --from main` creates the branch, creates the worktree in a sibling folder and sets up the environment:

```text
Preparing worktree (new branch 'fix/rate-limit')
Auto-linking .env files (no .sgitlinks found)...
  Linked .env

Worktree ready!
  Path:   ../fix-rate-limit
  Branch: fix/rate-limit
```

It looks for `.env` files in the project and symlinks them into the new worktree (skipping `node_modules`, `dist` and friends), then installs dependencies. If the project needs more than that, a `.sgitlinks` file at the root lists what to link. `sgit wt rm` run from inside a worktree removes that worktree.

This is how I run several agents in parallel on the same repository: one worktree per task, each with a working `.env` from the first command.

## Housekeeping

`sgit init --type node` creates the repository with a `.gitignore` for the ecosystem and the settings every team ends up turning on by hand: `pull.rebase`, `rerere.enabled`, `merge.conflictStyle zdiff3`, `diff.algorithm histogram`, `fetch.prune`, `branch.sort -committerdate`.

`sgit purge` deletes build artifacts and caches for Node, Rust, Python, Java, Go, .NET, Ruby, Dart and mobile. Start with `--dry-run`.

And `sgit update` checks the installed version against the latest GitHub release and updates itself.

## How it's maintained

There are 158 tests with [bats-core](https://github.com/bats-core/bats-core), split by area (commits, branches, sync, shelf, worktree, history). Each sync fix above went in together with a test for its scenario: a force-pushed remote, a squash-merged PR, an unreachable remote.

Every push to `main` compiles the binary with Bashly, runs the tests, works out the version from the Conventional Commits (`feat` bumps minor, `fix` bumps patch, `!` bumps major) and publishes a GitHub release with the binary and the changelog. It's the same flow that publishes this blog, and it's why 44 releases in three months took no effort at all.

The compiled binary also left the repository. It's reproducible from the source, and keeping it under version control only produced merge conflicts.

## Install

You need Bash 4+ (`brew install bash` on a Mac), `curl` and `git`.

```bash
curl -sL https://github.com/mkuchak/sugar-git/releases/latest/download/sgit | sudo tee /usr/local/bin/sgit > /dev/null && sudo chmod +x /usr/local/bin/sgit

# completions, in ~/.bashrc or ~/.zshrc
eval "$(sgit completions)"
```

`sgit -h` lists everything, and `sgit <command> -h` explains each one with examples. The code is on [GitHub](https://github.com/mkuchak/sugar-git).
