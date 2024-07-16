'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/icons.tsx";
import { cn } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/lib/utils.ts";
import { useSidebar } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/hooks/useSidebar.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/tooltip.tsx";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export function DashboardNav(_ref) {
  var items = _ref.items,
    setOpen = _ref.setOpen,
    _ref$isMobileNav = _ref.isMobileNav,
    isMobileNav = _ref$isMobileNav === void 0 ? false : _ref$isMobileNav;
  var path = usePathname();
  var _useSidebar = useSidebar(),
    isMinimized = _useSidebar.isMinimized;
  if (!(items !== null && items !== void 0 && items.length)) {
    return null;
  }
  console.log('isActive', isMobileNav, isMinimized);
  return _jsx("nav", {
    className: "grid items-start gap-2",
    children: _jsx(TooltipProvider, {
      children: items.map(function (item, index) {
        var Icon = Icons[item.icon || 'arrowRight'];
        return item.href && _jsxs(Tooltip, {
          children: [_jsx(TooltipTrigger, {
            asChild: true,
            children: _jsxs(Link, {
              href: item.disabled ? '/' : item.href,
              className: cn('flex items-center gap-2 overflow-hidden rounded-md py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground', path === item.href ? 'bg-accent' : 'transparent', item.disabled && 'cursor-not-allowed opacity-80'),
              onClick: function onClick() {
                if (setOpen) setOpen(false);
              },
              children: [_jsx(Icon, {
                className: "ml-3 size-5"
              }), isMobileNav || !isMinimized && !isMobileNav ? _jsx("span", {
                className: "mr-2 truncate",
                children: item.title
              }) : '']
            })
          }), _jsx(TooltipContent, {
            align: "center",
            side: "right",
            sideOffset: 8,
            className: !isMinimized ? 'hidden' : 'inline-block',
            children: item.title
          })]
        }, index);
      })
    })
  });
}