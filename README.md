# Modern Calculator

A calculator built with React, TypeScript, and Vite, with a twist: every result
gets locked behind a mock "pay to reveal" paywall before you can see it.

## Features

- Standard operations: add, subtract, multiply, divide
- Chained calculations, percentages, sign toggle, and decimals
- Keyboard support (digits, `+ - * /`, `Enter`/`=`, `Backspace`, `Escape`)
- Divide-by-zero and overflow handled as `Error`
- A visual-only paywall flow: results are hidden until a simulated payment completes

## Running locally

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build    # type-check and build for production
npm run lint      # run ESLint
npm run preview   # preview the production build
```

## Tech stack

React 19, TypeScript, Vite, plain CSS.
