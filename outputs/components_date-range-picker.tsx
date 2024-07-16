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
import { Button } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { Calendar } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/calendar.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/popover.tsx";
import { cn } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/lib/utils.ts";
import { CalendarIcon } from '@radix-ui/react-icons';
import { addDays, format } from 'date-fns';
import * as React from 'react';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "true/jsx-runtime";
export function CalendarDateRangePicker(_ref) {
  var className = _ref.className;
  var _React$useState = React.useState({
      from: new Date(2023, 0, 20),
      to: addDays(new Date(2023, 0, 20), 20)
    }),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    date = _React$useState2[0],
    setDate = _React$useState2[1];
  return _jsx("div", {
    className: cn('grid gap-2', className),
    children: _jsxs(Popover, {
      children: [_jsx(PopoverTrigger, {
        asChild: true,
        children: _jsxs(Button, {
          id: "date",
          variant: 'outline',
          className: cn('w-[260px] justify-start text-left font-normal', !date && 'text-muted-foreground'),
          children: [_jsx(CalendarIcon, {
            className: "mr-2 h-4 w-4"
          }), date !== null && date !== void 0 && date.from ? date.to ? _jsxs(_Fragment, {
            children: [format(date.from, 'LLL dd, y'), " -", ' ', format(date.to, 'LLL dd, y')]
          }) : format(date.from, 'LLL dd, y') : _jsx("span", {
            children: "Pick a date"
          })]
        })
      }), _jsx(PopoverContent, {
        className: "w-auto p-0",
        align: "end",
        children: _jsx(Calendar, {
          initialFocus: true,
          mode: "range",
          defaultMonth: date === null || date === void 0 ? void 0 : date.from,
          selected: date,
          onSelect: setDate,
          numberOfMonths: 2
        })
      })]
    })
  });
}