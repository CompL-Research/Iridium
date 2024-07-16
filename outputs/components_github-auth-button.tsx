'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { Icons } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/icons.tsx";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export default function GoogleSignInButton() {
  var searchParams = useSearchParams();
  var callbackUrl = searchParams.get('callbackUrl');
  return _jsxs(Button, {
    className: "w-full",
    variant: "outline",
    type: "button",
    onClick: function onClick() {
      return signIn('github', {
        callbackUrl: callbackUrl !== null && callbackUrl !== void 0 ? callbackUrl : '/dashboard'
      });
    },
    children: [_jsx(Icons.gitHub, {
      className: "mr-2 h-4 w-4"
    }), "Continue with Github"]
  });
}