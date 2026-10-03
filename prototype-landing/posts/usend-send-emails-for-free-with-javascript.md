---
topic: "Transactional Email"
title: "Usend: Send Emails for Free with JavaScript"
description: "Explore a free service that offers seamless integration for sending emails in Node.js applications. With features like simple integration, flexibility, DKIM security, and vendor support, Usend provides a cost-effective solution for developers. Learn how to get started and enhance your email communication effortlessly."
cover: "https://github.com/mkuchak/blog/assets/3791148/a397a18a-29f0-46af-a4f5-a041c204e96c"
date: 2024-02-08
tags: ["Email", "Node.js", "Usend", "Library"]
---

In this digital era, communication is essential across all online platforms, and email remains the backbone for interactions between companies and their users. As a developer, you may have encountered situations where you needed a straightforward and cost-effective way to send emails from your Node.js applications without the complexity of setting up a full-fledged email service. If that's the case, a free alternative might be the Usend library: offering simplicity, flexibility, and robustness.

## 🤔 Why Use Usend?

Usend was born out of the need for an easy-to-use and budget-friendly email solution for small projects. Inspired by the success of Resend, Usend provides a similar API but with essential options to cater to various email sending requirements. The primary goal is not to replace the excellent work done by Resend but to offer a complementary option for those who prefer a cost-free and less complex alternative.

## 🔍 Usend Features

1. **Simple Integration:** Usend seamlessly integrates with your Node.js projects, ensuring a smooth and swift integration experience.

2. **Abundant Flexibility:** Whether you need to send plain text emails or custom emails with HTML or React, Usend offers a wide range of options to create visually appealing and elegant layouts.

3. **Effortless Customization:** Easily personalize your emails using a straightforward approach to add custom content and dynamic fields.

4. **Support for Different Vendors:** Usend provides the freedom to choose your preferred email vendor. If the default implementation doesn't meet your needs, you can deploy your own to fulfill specific requirements.

5. **Security with DKIM:** Safeguard your emails with DKIM (DomainKeys Identified Mail) signatures, ensuring authenticity and preventing unauthorized individuals from impersonating your domain.

## 🚀 Getting Started with Usend

Using Usend in your Node.js project is straightforward. Here's a step-by-step guide to get you started:

### 1. Install Usend with a Single Command:

Using npm or yarn, you can quickly install Usend.

```bash
npm install usend-email
# or
yarn add usend-email
```

### 2. Add SPF and Domain Lockdown™ Records:

To activate your domain, add the following TXT record in your domain registrar's DNS settings:

| Name        | Type | Content                                     |
| ----------- | ---- | ------------------------------------------- |
| example.com | TXT  | v=spf1 a mx include:relay.mailchannels.net ~all |

Additionally, add this record:

| Name                   | Type | Content                 |
| ---------------------- | ---- | ----------------------- |
| _mailchannels.example.com | TXT  | v=mc1 cfid=usend.email |

Replace `example.com` with your domain name.

### 3. Send Emails with Just a Few Lines of Code:

Using Usend to send emails is incredibly simple.

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

## 🔒 Domain Protection with DKIM

To prevent unauthorized third parties from sending emails from your domain, you can utilize RSA encryption with the DKIM (DomainKeys Identified Mail) protocol. Usend's default implementation will look for a DKIM public key on your domain and only send the email when you provide the private key during the sending process. For instructions on how to set up this option, check the [documentation](https://usend.email/domain-protection.html).

---

Usend offers a free and efficient way to send emails in Node.js, catering to small projects and developers who prefer simplicity without sacrificing flexibility and security. The library stands out as a viable option for those seeking an uncomplicated and cost-effective email solution. So, give Usend a try, and see how it streamlines email communication in your Node.js applications.

## ℹ️ Where to Find Usend

- [NPM Package](https://www.npmjs.com/package/usend-email)
- [Documentation](https://usend.email)
- [GitHub Repository](https://github.com/mkuchak/usend)

Feel free to reach out or create an issue on GitHub. Even better, submit a pull request with your contribution. I hope Usend is a useful tool for you! 😉

