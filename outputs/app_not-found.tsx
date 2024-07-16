'use client';

import { useRouter } from 'next/navigation';
import { Button } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export default function NotFound() {
  var router = useRouter();
  return _jsxs("div", {
    className: "absolute left-1/2 top-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center",
    children: [_jsx("span", {
      className: "bg-gradient-to-b from-foreground to-transparent bg-clip-text text-[10rem] font-extrabold leading-none text-transparent",
      children: "404"
    }), _jsx("h2", {
      className: "font-heading my-2 text-2xl font-bold",
      children: "Something's missing"
    }), _jsx("p", {
      children: "Sorry, the page you are looking for doesn't exist or has been moved."
    }), _jsxs("div", {
      className: "mt-8 flex justify-center gap-2",
      children: [_jsx(Button, {
        onClick: function onClick() {
          return router.back();
        },
        variant: "default",
        size: "lg",
        children: "Go back"
      }), _jsx(Button, {
        onClick: function onClick() {
          return router.push('/dashboard');
        },
        variant: "ghost",
        size: "lg",
        children: "Back to Home"
      })]
    })]
  });
}