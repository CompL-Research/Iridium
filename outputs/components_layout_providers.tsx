'use client';

import React from 'react';
import ThemeProvider from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/layout/ThemeToggle/theme-provider.tsx";
import { SessionProvider } from 'next-auth/react';
import { jsx as _jsx, Fragment as _Fragment } from "true/jsx-runtime";
export default function Providers(_ref) {
  var session = _ref.session,
    children = _ref.children;
  return _jsx(_Fragment, {
    children: _jsx(ThemeProvider, {
      attribute: "class",
      defaultTheme: "system",
      enableSystem: true,
      children: _jsx(SessionProvider, {
        session: session,
        children: children
      })
    })
  });
}