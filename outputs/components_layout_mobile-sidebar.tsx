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
import { DashboardNav } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/dashboard-nav.tsx";
import { Sheet, SheetContent, SheetTrigger } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/sheet.tsx";
import { navItems } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/constants/data.ts";
import { MenuIcon } from 'lucide-react';
import { useState } from 'react';

// import { Playlist } from "../data/playlists";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "true/jsx-runtime";
export function MobileSidebar(_ref) {
  var className = _ref.className;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    open = _useState2[0],
    setOpen = _useState2[1];
  return _jsx(_Fragment, {
    children: _jsxs(Sheet, {
      open: open,
      onOpenChange: setOpen,
      children: [_jsx(SheetTrigger, {
        asChild: true,
        children: _jsx(MenuIcon, {})
      }), _jsx(SheetContent, {
        side: "left",
        className: "!px-0",
        children: _jsx("div", {
          className: "space-y-4 py-4",
          children: _jsxs("div", {
            className: "px-3 py-2",
            children: [_jsx("h2", {
              className: "mb-2 px-4 text-lg font-semibold tracking-tight",
              children: "Overview"
            }), _jsx("div", {
              className: "space-y-1",
              children: _jsx(DashboardNav, {
                items: navItems,
                isMobileNav: true,
                setOpen: setOpen
              })
            })]
          })
        })
      })]
    })
  });
}