---
topic: "Git"
title: "Tirei a IA do meu CLI de Git, e ele ficou melhor"
description: "O Sugar Git nasceu como meia dúzia de aliases em 2021, ganhou geração de commits com IA em 2024 e perdeu esse recurso em 2026. Depois disso vieram 44 releases em três meses. O que mudou, por quê, e o que o sgit faz hoje."
cover: "https://github.com/mkuchak/blog/assets/3791148/95e049f3-aad0-40d0-919d-878c81842db5"
tags: ["Git", "Conventional Commits", "Sugar Git", "CLI", "Bash", "Agentes de IA"]
---

Em fevereiro de 2024 eu escrevi aqui sobre o `sgit commit`. Você descrevia a mudança em qualquer língua, o comando mandava o texto para um modelo e devolvia quatro opções de mensagem no formato Conventional Commits. Você escolhia uma e pronto.

Em abril de 2026 eu apaguei esse recurso. Foram 72 linhas removidas, e o `sgit commit` virou um commit com mensagem livre, sem rede e sem menu. No mesmo dia saiu a versão 1.0.0. Nos três meses seguintes vieram mais 43 releases, chegando na 2.20.0.

Este texto substitui o original. O Sugar Git de hoje é outra ferramenta, e o motivo da mudança diz mais sobre como eu uso Git agora do que o recurso de IA dizia.

## De aliases a CLI

O projeto começou em 17 de abril de 2021 como um punhado de aliases no `.gitconfig`: `git ch`, `git rb`, `git st`, `git lg`. Eram atalhos para o que eu digitava vinte vezes por dia.

Em novembro de 2021 virou um CLI de verdade, o `sgit`, escrito em Bash com o [Bashly](https://bashly.dev). Cada comando é um arquivo `.sh` em `src/`, a interface inteira (comandos, flags, aliases, textos de ajuda) fica num `bashly.yml`, e o build gera um único arquivo executável. Sem runtime e sem dependência além de Bash 4, `curl` e `git`.

Em 2024 entrou a IA. Em 2026 ela saiu, e o resto do CLI cresceu mais em três meses do que tinha crescido em cinco anos.

## Por que a IA saiu

O `sgit commit` com IA dependia de uma chamada HTTP para um Worker meu no meio do caminho do commit. Sem internet, ou com o endpoint fora do ar, o commit não acontecia. Para uma ferramenta que existe para deixar o Git mais rápido, é uma dependência ruim de ter.

O formato também era o errado. O comando abria um menu interativo com quatro opções e esperava você escolher um número. Isso funciona para uma pessoa no terminal e não funciona para mais nada: script, hook, CI ou agente.

E o principal: hoje, na maior parte do tempo, quem escreve a mensagem de commit é o agente que escreveu o código. Ele tem o diff inteiro e o contexto da tarefa. O `sgit commit` tinha só a frase que eu digitava. Um modelo resumindo a minha frase perde para um agente descrevendo o próprio diff.

Então o comando voltou a ser só açúcar:

```bash
sgit feat "add google sign-in" -s auth -Ap
# git add --all
# git commit -m "feat(auth): add google sign-in"
# git push origin feature/login-com-google
```

Determinístico, sem rede, igual para mim e para um agente. O que ficou de inteligente no sgit é o que acontece depois do commit: sincronizar, reescrever histórico e recuperar trabalho sem perder nada.

## Commits

Os doze tipos do Conventional Commits viraram comandos: `feat`, `fix`, `chore`, `docs`, `build`, `ci`, `test`, `perf`, `refactor`, `revert`, `style` e `localize`. Todos aceitam as mesmas flags.

| Flag | O que faz |
|------|-----------|
| `-s auth` | escopo, vira `feat(auth): ...` |
| `-b` | breaking change, vira `feat!: ...` |
| `-A` / `-a <arquivo>` | adiciona tudo ou um arquivo antes do commit |
| `-p` | faz push depois do commit |
| `-e` | abre o editor para escrever o corpo |
| `-d` / `-t` | data e hora customizadas no commit |

Antes da 1.0 eram doze arquivos quase idênticos de 22 linhas cada. Viraram uma chamada de uma linha para uma função compartilhada, e 264 linhas de duplicação foram embora.

Três comandos cuidam do histórico enquanto você trabalha:

```bash
sgit temp -A        # chore: WIP auth.js
sgit temp -A        # rodar de novo emenda o anterior: chore: WIP(2) auth.js
sgit squash 2 "fix(auth): handle expired tokens with a single retry"
sgit edit 2593413 "feat(auth): add google sign-in"
```

O `temp` é o commit de "salvar progresso" que eu fazia à mão antes de trocar de branch. Rodar de novo não cria outro commit, emenda o anterior e incrementa o contador. O `squash` junta os últimos N commits (ou todos desde uma referência, com `--since main`). O `edit` reescreve a mensagem de um commit antigo sem abrir o editor do rebase interativo: o sgit injeta um `GIT_SEQUENCE_EDITOR` que marca o commit como `reword` e escreve a mensagem nova sozinho.

E `sgit undo` desfaz o último commit mantendo os arquivos.

## Branches e sincronização

```bash
sgit take -f "login com google"     # feature/login-com-google
sgit take -H "token leak" -F main   # hotfix/token-leak, criada a partir da main
sgit take                           # nome gerado com UUID, para quando o nome não importa
sgit ls                             # só a branch atual
sgit ll -v                          # todas, com ahead/behind e estado do upstream
sgit clean -r                       # apaga as já mergeadas na main, local e remoto
```

O comando de que eu mais dependo é o `sgit sync`: fetch e rebase em cima da `main` (ou de outra branch, se você passar). Na primeira versão ele era isso e só. Em maio ele ganhou três correções que nasceram de dor real em repositório com várias pessoas.

A primeira: quando alguém faz force push em qualquer branch, o `git fetch` pode falhar com `cannot lock ref 'refs/remotes/origin/...'`. A correção manual é um `git update-ref -d` que ninguém lembra. Agora o sgit lê a mensagem de erro, apaga as refs travadas e tenta de novo, sozinho. Isso fica num helper, o `fetch_with_recovery`, que `get`, `take`, `wipe`, `incoming` e `outgoing` também usam.

A segunda: se o fetch falhasse mesmo assim, o rebase rodava contra refs velhas e o resultado parecia certo sem estar. Agora o sync para.

A terceira: depois que o seu PR é mergeado com squash, os seus commits locais ficam redundantes com a `main`, e o `git rebase` para em cada um com "The previous cherry-pick is now empty". O sync agora usa `--empty=drop` e descarta esses commits em silêncio.

O `sgit wipe` seguiu a mesma lógica. Ele reseta a branch para o estado do remoto, e antes fazia isso contra o último fetch, que podia ter dias. Agora faz fetch primeiro e se recusa a resetar contra dados velhos. Com `--all`, também apaga arquivos não rastreados e ignorados, e mostra a lista antes de pedir confirmação.

## Force push que não apaga o trabalho de ninguém

`sgit put -f` usa `--force-with-lease`, não `--force`. Se alguém empurrou para a mesma branch depois do seu último fetch, o push é recusado:

```text
$ sgit put -f
 ! [rejected]        feature/login-com-google -> feature/login-com-google (stale info)
error: failed to push some refs to 'origin'
```

Quando você quer mesmo sobrescrever (a branch é só sua, ou o remoto está num estado que não importa), existe `--no-lease`. Ela não tem atalho de uma letra de propósito. Ter que digitar a flag inteira é um pequeno freio, proporcional ao estrago que ela pode fazer.

## Stash, shelf e history

`sgit stash` é o stash do Git com verbos mais claros: `put`, `get`, `ls`, `peek`, `keep`, `drop` e `move`, que guarda as mudanças, troca de branch e aplica do outro lado.

`sgit shelf` é a parte que eu sinto falta quando uso Git puro. O stash guarda mudanças do working tree. A shelf guarda commits inteiros, com hash, mensagem, autor e data:

```text
$ sgit shelf put 2 -m "token handling, revisitar"
Shelved 2 commit(s) as 20261012-182434-2c-3ee5
  f72c5d1 fix(auth): retry once on 401
  a69c744 fix(auth): handle expired token

$ sgit shelf ls
[0] 20261012-182434-2c-3ee5  (2026-10-12 18:24, 2 commit(s))
    Label: token handling, revisitar
    f72c5d1 fix(auth): retry once on 401
    a69c744 fix(auth): handle expired token
```

Os commits ficam em `refs/sgit/shelf/<id>`, então nada se perde e o reflog cobre até um `drop` por engano. `sgit shelf get` aplica a cadeia de volta com cherry-pick, e se der conflito a shelf não é apagada e o sgit diz exatamente o que rodar depois de resolver.

E para quando algo já deu errado, `sgit history` é o reflog legível:

```text
$ sgit history
[0]  9 seconds ago   commit     fix(auth): handle expired tokens with a single retry
[1]  19 seconds ago  reset      moving to HEAD~2
[2]  9 seconds ago   cherry     fix(auth): retry once on 401
```

`sgit history restore 1` volta o HEAD para aquele ponto, depois de pedir confirmação.

## Investigar código

`sgit who auth.js:42` é um `git blame` que, em vez de parar no hash, mostra a mensagem completa do commit que mexeu naquela linha. Se a mensagem foi bem escrita, ela responde o "por que isso está assim" sem você sair do terminal.

`sgit log "token"` busca no histórico com filtros de autor e período, e `sgit incoming` e `sgit outgoing` mostram o que está no remoto e não está aqui, e o contrário.

## Worktrees

`sgit wt add fix/rate-limit --from main` cria a branch, cria a worktree numa pasta irmã e prepara o ambiente:

```text
Preparing worktree (new branch 'fix/rate-limit')
Auto-linking .env files (no .sgitlinks found)...
  Linked .env

Worktree ready!
  Path:   ../fix-rate-limit
  Branch: fix/rate-limit
```

Ele procura arquivos `.env` no projeto e cria symlinks na worktree nova (pulando `node_modules`, `dist` e companhia), e instala as dependências. Se o projeto precisa de mais coisa, um arquivo `.sgitlinks` na raiz lista o que linkar. `sgit wt rm` rodado de dentro da worktree remove ela mesma.

É assim que eu rodo vários agentes em paralelo no mesmo repositório: uma worktree por tarefa, cada uma com o próprio `.env` funcionando desde o primeiro comando.

## Manutenção

`sgit init --type node` cria o repositório com `.gitignore` do ecossistema e com as configurações que todo time acaba ligando à mão: `pull.rebase`, `rerere.enabled`, `merge.conflictStyle zdiff3`, `diff.algorithm histogram`, `fetch.prune`, `branch.sort -committerdate`.

`sgit purge` apaga artefatos de build e caches de Node, Rust, Python, Java, Go, .NET, Ruby, Dart e mobile. Comece com `--dry-run`.

E `sgit update` compara a versão instalada com a última release do GitHub e se atualiza.

## Como o projeto é mantido

São 158 testes com [bats-core](https://github.com/bats-core/bats-core), divididos por área (commits, branches, sync, shelf, worktree, history). Cada correção de sync que descrevi acima entrou junto com o teste do cenário: remoto com force push, PR mergeado com squash, remoto inacessível.

Cada push na `main` compila o binário com Bashly, roda os testes, calcula a versão pelos Conventional Commits (`feat` sobe minor, `fix` sobe patch, `!` sobe major) e publica uma release no GitHub com o binário e o changelog. É o mesmo fluxo que publica este blog, e é o motivo de 44 releases em três meses não darem trabalho nenhum.

O binário compilado também saiu do repositório. Ele é reproduzível a partir do código, e mantê-lo versionado só gerava conflito de merge.

## Instalação

Precisa de Bash 4+ (`brew install bash` no Mac), `curl` e `git`.

```bash
curl -sL https://github.com/mkuchak/sugar-git/releases/latest/download/sgit | sudo tee /usr/local/bin/sgit > /dev/null && sudo chmod +x /usr/local/bin/sgit

# autocomplete, no ~/.bashrc ou ~/.zshrc
eval "$(sgit completions)"
```

`sgit -h` lista tudo, e `sgit <comando> -h` explica cada um com exemplos. O código está no [GitHub](https://github.com/mkuchak/sugar-git).
