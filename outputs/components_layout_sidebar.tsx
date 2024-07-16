'use client';

function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
import React, { useState } from 'react';
import { DashboardNav } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/dashboard-nav.tsx";
import { navItems } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/constants/data.ts";
import { cn } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/lib/utils.ts";
import { ChevronLeft } from 'lucide-react';
import { useSidebar } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/hooks/useSidebar.tsx";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export default function Sidebar(_ref) {
  var className = _ref.className;
  var _useSidebar = useSidebar(),
    isMinimized = _useSidebar.isMinimized,
    toggle = _useSidebar.toggle;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    status = _useState2[0],
    setStatus = _useState2[1];
  var handleToggle = function handleToggle() {
    setStatus(true);
    toggle();
    setTimeout(function () {
      return setStatus(false);
    }, 500);
  };
  return _jsxs("nav", {
    className: cn("relative hidden h-screen flex-none border-r z-10 pt-20 md:block", status && 'duration-500', !isMinimized ? 'w-72' : 'w-[72px]', className),
    children: [_jsx(ChevronLeft, {
      className: cn('absolute -right-3 top-20 cursor-pointer rounded-full border bg-background text-3xl text-foreground', isMinimized && 'rotate-180'),
      onClick: handleToggle
    }), _jsx("div", {
      className: "space-y-4 py-4",
      children: _jsx("div", {
        className: "px-3 py-2",
        children: _jsx("div", {
          className: "mt-3 space-y-1",
          children: _jsx(DashboardNav, {
            items: navItems
          })
        })
      })
    })]
  });
}