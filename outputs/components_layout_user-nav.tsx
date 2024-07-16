'use client';

import { Avatar, AvatarFallback, AvatarImage } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/avatar.tsx";
import { Button } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/dropdown-menu.tsx";
import { signOut, useSession } from 'next-auth/react';
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export function UserNav() {
  var _useSession = useSession(),
    session = _useSession.data;
  if (session) {
    var _session$user$image, _session$user, _session$user$name, _session$user2, _session$user3, _session$user4, _session$user5;
    return _jsxs(DropdownMenu, {
      children: [_jsx(DropdownMenuTrigger, {
        asChild: true,
        children: _jsx(Button, {
          variant: "ghost",
          className: "relative h-8 w-8 rounded-full",
          children: _jsxs(Avatar, {
            className: "h-8 w-8",
            children: [_jsx(AvatarImage, {
              src: (_session$user$image = (_session$user = session.user) === null || _session$user === void 0 ? void 0 : _session$user.image) !== null && _session$user$image !== void 0 ? _session$user$image : '',
              alt: (_session$user$name = (_session$user2 = session.user) === null || _session$user2 === void 0 ? void 0 : _session$user2.name) !== null && _session$user$name !== void 0 ? _session$user$name : ''
            }), _jsx(AvatarFallback, {
              children: (_session$user3 = session.user) === null || _session$user3 === void 0 || (_session$user3 = _session$user3.name) === null || _session$user3 === void 0 ? void 0 : _session$user3[0]
            })]
          })
        })
      }), _jsxs(DropdownMenuContent, {
        className: "w-56",
        align: "end",
        forceMount: true,
        children: [_jsx(DropdownMenuLabel, {
          className: "font-normal",
          children: _jsxs("div", {
            className: "flex flex-col space-y-1",
            children: [_jsx("p", {
              className: "text-sm font-medium leading-none",
              children: (_session$user4 = session.user) === null || _session$user4 === void 0 ? void 0 : _session$user4.name
            }), _jsx("p", {
              className: "text-xs leading-none text-muted-foreground",
              children: (_session$user5 = session.user) === null || _session$user5 === void 0 ? void 0 : _session$user5.email
            })]
          })
        }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuGroup, {
          children: [_jsxs(DropdownMenuItem, {
            children: ["Profile", _jsx(DropdownMenuShortcut, {
              children: "\u21E7\u2318P"
            })]
          }), _jsxs(DropdownMenuItem, {
            children: ["Billing", _jsx(DropdownMenuShortcut, {
              children: "\u2318B"
            })]
          }), _jsxs(DropdownMenuItem, {
            children: ["Settings", _jsx(DropdownMenuShortcut, {
              children: "\u2318S"
            })]
          }), _jsx(DropdownMenuItem, {
            children: "New Team"
          })]
        }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, {
          onClick: function onClick() {
            return signOut();
          },
          children: ["Log out", _jsx(DropdownMenuShortcut, {
            children: "\u21E7\u2318Q"
          })]
        })]
      })]
    });
  }
}