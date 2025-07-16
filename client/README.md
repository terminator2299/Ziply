This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

---

## ✨ FAQ Bot Feature

A beautiful, modern FAQ chatbot is available on every page:

- 💬 **Floating Chat Button:** Bottom-right corner, always accessible.
- 🪟 **Auto-Popup:** The chat window opens automatically on the user's first visit each session.
- ❓ **Suggested Questions:** Users can click on common questions like "What's special in Ziply?", "Who developed Ziply?", and "What are the tech stacks of this website?"
- 💡 **Instant Answers:** Clicking a question shows a friendly, instant answer.
- 🎨 **Modern UI:** Glassmorphic design, gradients, smooth animations, and dark mode support.
- 🌓 **Theme Aware:** Looks great in both light and dark themes.
- 🖱️ **User Control:** Users can close the chat and reopen it anytime with the button.

This feature is implemented in `components/ChatBot.tsx` and `components/ChatBot.module.css`.

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
