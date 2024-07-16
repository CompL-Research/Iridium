import Link from 'next/link';
import UserAuthForm from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/forms/user-auth-form.tsx";
import { buttonVariants } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { cn } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/lib/utils.ts";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export var metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};
export default function AuthenticationPage() {
  return _jsxs("div", {
    className: "relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0",
    children: [_jsx(Link, {
      href: "/examples/authentication",
      className: cn(buttonVariants({
        variant: 'ghost'
      }), 'absolute right-4 top-4 hidden md:right-8 md:top-8'),
      children: "Login"
    }), _jsxs("div", {
      className: "relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r",
      children: [_jsx("div", {
        className: "absolute inset-0 bg-zinc-900"
      }), _jsxs("div", {
        className: "relative z-20 flex items-center text-lg font-medium",
        children: [_jsx("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          className: "mr-2 h-6 w-6",
          children: _jsx("path", {
            d: "M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"
          })
        }), "Logo"]
      }), _jsx("div", {
        className: "relative z-20 mt-auto",
        children: _jsxs("blockquote", {
          className: "space-y-2",
          children: [_jsx("p", {
            className: "text-lg",
            children: "\u201CThis library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before.\u201D"
          }), _jsx("footer", {
            className: "text-sm",
            children: "Sofia Davis"
          })]
        })
      })]
    }), _jsx("div", {
      className: "flex h-full items-center p-4 lg:p-8",
      children: _jsxs("div", {
        className: "mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]",
        children: [_jsxs("div", {
          className: "flex flex-col space-y-2 text-center",
          children: [_jsx("h1", {
            className: "text-2xl font-semibold tracking-tight",
            children: "Create an account"
          }), _jsx("p", {
            className: "text-sm text-muted-foreground",
            children: "Enter your email below to create your account"
          })]
        }), _jsx(UserAuthForm, {}), _jsxs("p", {
          className: "px-8 text-center text-sm text-muted-foreground",
          children: ["By clicking continue, you agree to our", ' ', _jsx(Link, {
            href: "/terms",
            className: "underline underline-offset-4 hover:text-primary",
            children: "Terms of Service"
          }), ' ', "and", ' ', _jsx(Link, {
            href: "/privacy",
            className: "underline underline-offset-4 hover:text-primary",
            children: "Privacy Policy"
          }), "."]
        })]
      })
    })]
  });
}