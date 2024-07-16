'use client';

function _objectDestructuringEmpty(t) {
  if (null == t) throw new TypeError("Cannot destructure " + t);
}
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import { Button } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/dropdown-menu.tsx";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export default function ThemeToggle(_ref) {
  _objectDestructuringEmpty(_ref);
  var _useTheme = useTheme(),
    setTheme = _useTheme.setTheme;
  return _jsxs(DropdownMenu, {
    children: [_jsx(DropdownMenuTrigger, {
      asChild: true,
      children: _jsxs(Button, {
        variant: "outline",
        size: "icon",
        children: [_jsx(SunIcon, {
          className: "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        }), _jsx(MoonIcon, {
          className: "absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        }), _jsx("span", {
          className: "sr-only",
          children: "Toggle theme"
        })]
      })
    }), _jsxs(DropdownMenuContent, {
      align: "end",
      children: [_jsx(DropdownMenuItem, {
        onClick: function onClick() {
          return setTheme('light');
        },
        children: "Light"
      }), _jsx(DropdownMenuItem, {
        onClick: function onClick() {
          return setTheme('dark');
        },
        children: "Dark"
      }), _jsx(DropdownMenuItem, {
        onClick: function onClick() {
          return setTheme('system');
        },
        children: "System"
      })]
    })]
  });
}