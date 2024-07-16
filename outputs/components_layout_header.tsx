import ThemeToggle from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/layout/ThemeToggle/theme-toggle.tsx";
import { cn } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/lib/utils.ts";
import { MobileSidebar } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/layout/mobile-sidebar.tsx";
import { UserNav } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/layout/user-nav.tsx";
import Link from 'next/link';
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export default function Header() {
  return _jsx("div", {
    className: "supports-backdrop-blur:bg-background/60 fixed left-0 right-0 top-0 z-20 border-b bg-background/95 backdrop-blur",
    children: _jsxs("nav", {
      className: "flex h-14 items-center justify-between px-4",
      children: [_jsx("div", {
        className: "hidden lg:block",
        children: _jsx(Link, {
          href: 'https://github.com/Kiranism/next-shadcn-dashboard-starter',
          target: "_blank",
          children: _jsx("svg", {
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
          })
        })
      }), _jsx("div", {
        className: cn('block lg:!hidden'),
        children: _jsx(MobileSidebar, {})
      }), _jsxs("div", {
        className: "flex items-center gap-2",
        children: [_jsx(UserNav, {}), _jsx(ThemeToggle, {})]
      })]
    })
  });
}