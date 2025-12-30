This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Responsive Design Guidelines

This project enforces Tailwind CSS best practices using [eslint-plugin-tailwindcss](https://github.com/francoismassart/eslint-plugin-tailwindcss) (beta version with Tailwind v4 support).

**Key principles:**

- Use single values for spacing and typography (e.g., `p-4`, `text-lg`)
- Rely on Tailwind's rem-based scaling instead of multiple breakpoints
- Add breakpoints only for major layout changes (e.g., `grid-cols-2 lg:grid-cols-4`)
- Avoid chains like `p-2 sm:p-4 md:p-6 lg:p-8`

See [TAILWIND_RESPONSIVE_GUIDELINES.md](./TAILWIND_RESPONSIVE_GUIDELINES.md) for full details.

## Linting

Check your code for issues:

```bash
npm run lint
```

The linter includes:

- Tailwind class ordering enforcement
- Detection of contradicting classes
- Warnings about non-standard class names
- Enforcement of Tailwind best practices

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
