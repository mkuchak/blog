---
topic: "Email transacional"
title: "Usend: envie emails de graça com JavaScript"
description: "Conheça um serviço gratuito que oferece uma integração simples para enviar emails em aplicações Node.js. Com integração descomplicada, flexibilidade, segurança com DKIM e suporte a diferentes vendors, o Usend é uma solução de baixo custo para desenvolvedores. Veja como começar e melhore a comunicação por email sem esforço."
cover: "https://github.com/mkuchak/blog/assets/3791148/a397a18a-29f0-46af-a4f5-a041c204e96c"
date: 2024-02-08
tags: ["Email", "Node.js", "Usend", "Biblioteca"]
---

Na era digital, a comunicação é essencial em todas as plataformas online, e o email continua sendo a espinha dorsal da interação entre empresas e seus usuários. Como desenvolvedor, talvez você já tenha passado por situações em que precisava de um jeito simples e barato de enviar emails a partir das suas aplicações Node.js, sem a complexidade de configurar um serviço de email completo. Se for o seu caso, uma alternativa gratuita pode ser a biblioteca Usend, que oferece simplicidade, flexibilidade e robustez.

## 🤔 Por que usar o Usend?

O Usend nasceu da necessidade de uma solução de email fácil de usar e que coubesse no orçamento de projetos pequenos. Inspirado no sucesso do Resend, o Usend oferece uma API parecida, mas com as opções essenciais para atender a diferentes necessidades de envio de email. O objetivo principal não é substituir o excelente trabalho feito pelo Resend, e sim oferecer uma opção complementar para quem prefere uma alternativa gratuita e menos complexa.

## 🔍 Funcionalidades do Usend

1. **Integração simples:** o Usend se integra aos seus projetos Node.js sem atrito, garantindo uma experiência de integração tranquila e rápida.

2. **Muita flexibilidade:** seja para enviar emails em texto puro ou emails personalizados com HTML ou React, o Usend oferece várias opções para criar layouts bonitos e elegantes.

3. **Personalização sem esforço:** personalize seus emails facilmente, com uma abordagem direta para adicionar conteúdo customizado e campos dinâmicos.

4. **Suporte a diferentes vendors:** o Usend dá a liberdade de escolher o vendor de email que você preferir. Se a implementação padrão não atender às suas necessidades, você pode criar a sua própria para cobrir requisitos específicos.

5. **Segurança com DKIM:** proteja seus emails com assinaturas DKIM (DomainKeys Identified Mail), garantindo a autenticidade e impedindo que pessoas não autorizadas se passem pelo seu domínio.

## 🚀 Primeiros passos com o Usend

Usar o Usend no seu projeto Node.js é simples. Aqui vai um passo a passo para você começar:

### 1. Instale o Usend com um único comando:

Com npm ou yarn, você instala o Usend rapidinho.

```bash
npm install usend-email
# or
yarn add usend-email
```

### 2. Adicione os registros SPF e Domain Lockdown™:

Para ativar o seu domínio, adicione o seguinte registro TXT nas configurações de DNS do seu registrador de domínio:

| Nome        | Tipo | Conteúdo                                    |
| ----------- | ---- | ------------------------------------------- |
| example.com | TXT  | v=spf1 a mx include:relay.mailchannels.net ~all |

Além disso, adicione este registro:

| Nome                   | Tipo | Conteúdo                |
| ---------------------- | ---- | ----------------------- |
| _mailchannels.example.com | TXT  | v=mc1 cfid=usend.email |

Substitua `example.com` pelo seu domínio.

### 3. Envie emails com poucas linhas de código:

Enviar emails com o Usend é extremamente simples.

```ts
import { Usend } from "usend-email";

const usend = new Usend();

(async () => {
   await usend.sendEmail({
     from: "sender@example.com",
     to: "recipient@example.com",
     subject: "Hello from Usend",
     text: "It works!",
     html: "<p>It works!</p>",
     // or import a React component: `react: WelcomeTemplate({ firstName: "John" })`
   });
})();
```

## 🔒 Proteção de domínio com DKIM

Para impedir que terceiros não autorizados enviem emails a partir do seu domínio, você pode usar criptografia RSA com o protocolo DKIM (DomainKeys Identified Mail). A implementação padrão do Usend procura uma chave pública DKIM no seu domínio e só envia o email quando você fornece a chave privada no momento do envio. Para saber como configurar essa opção, confira a [documentação](https://usend.email/domain-protection.html).

---

O Usend oferece um jeito gratuito e eficiente de enviar emails em Node.js, pensado para projetos pequenos e para desenvolvedores que preferem simplicidade sem abrir mão de flexibilidade e segurança. A biblioteca se destaca como uma opção viável para quem busca uma solução de email descomplicada e de baixo custo. Então, experimente o Usend e veja como ele simplifica a comunicação por email nas suas aplicações Node.js.

## ℹ️ Onde encontrar o Usend

- [Pacote no NPM](https://www.npmjs.com/package/usend-email)
- [Documentação](https://usend.email)
- [Repositório no GitHub](https://github.com/mkuchak/usend)

Fique à vontade para entrar em contato ou abrir uma issue no GitHub. Melhor ainda, mande um pull request com a sua contribuição. Espero que o Usend seja uma ferramenta útil para você! 😉

