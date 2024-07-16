'use client';

function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
var _excluded = ["className", "children"],
  _excluded2 = ["className", "children", "position"],
  _excluded3 = ["className"],
  _excluded4 = ["className", "children"],
  _excluded5 = ["className"];
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
function _toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _objectWithoutProperties(e, t) {
  if (null == e) return {};
  var o,
    r,
    i = _objectWithoutPropertiesLoose(e, t);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    for (r = 0; r < s.length; r++) o = s[r], t.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
  }
  return i;
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (e.includes(n)) continue;
    t[n] = r[n];
  }
  return t;
}
import * as React from 'react';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/lib/utils.ts";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
var Select = SelectPrimitive.Root;
var SelectGroup = SelectPrimitive.Group;
var SelectValue = SelectPrimitive.Value;
var SelectTrigger = /*#__PURE__*/React.forwardRef(function (_ref, ref) {
  var className = _ref.className,
    children = _ref.children,
    props = _objectWithoutProperties(_ref, _excluded);
  return _jsxs(SelectPrimitive.Trigger, _objectSpread(_objectSpread({
    ref: ref,
    className: cn('flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50', className)
  }, props), {}, {
    children: [children, _jsx(SelectPrimitive.Icon, {
      asChild: true,
      children: _jsx(CaretSortIcon, {
        className: "h-4 w-4 opacity-50"
      })
    })]
  }));
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
var SelectContent = /*#__PURE__*/React.forwardRef(function (_ref2, ref) {
  var className = _ref2.className,
    children = _ref2.children,
    _ref2$position = _ref2.position,
    position = _ref2$position === void 0 ? 'popper' : _ref2$position,
    props = _objectWithoutProperties(_ref2, _excluded2);
  return _jsx(SelectPrimitive.Portal, {
    children: _jsx(SelectPrimitive.Content, _objectSpread(_objectSpread({
      ref: ref,
      className: cn('relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2', position === 'popper' && 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1', className),
      position: position
    }, props), {}, {
      children: _jsx(SelectPrimitive.Viewport, {
        className: cn('p-1', position === 'popper' && 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'),
        children: children
      })
    }))
  });
});
SelectContent.displayName = SelectPrimitive.Content.displayName;
var SelectLabel = /*#__PURE__*/React.forwardRef(function (_ref3, ref) {
  var className = _ref3.className,
    props = _objectWithoutProperties(_ref3, _excluded3);
  return _jsx(SelectPrimitive.Label, _objectSpread({
    ref: ref,
    className: cn('px-2 py-1.5 text-sm font-semibold', className)
  }, props));
});
SelectLabel.displayName = SelectPrimitive.Label.displayName;
var SelectItem = /*#__PURE__*/React.forwardRef(function (_ref4, ref) {
  var className = _ref4.className,
    children = _ref4.children,
    props = _objectWithoutProperties(_ref4, _excluded4);
  return _jsxs(SelectPrimitive.Item, _objectSpread(_objectSpread({
    ref: ref,
    className: cn('relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', className)
  }, props), {}, {
    children: [_jsx("span", {
      className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
      children: _jsx(SelectPrimitive.ItemIndicator, {
        children: _jsx(CheckIcon, {
          className: "h-4 w-4"
        })
      })
    }), _jsx(SelectPrimitive.ItemText, {
      children: children
    })]
  }));
});
SelectItem.displayName = SelectPrimitive.Item.displayName;
var SelectSeparator = /*#__PURE__*/React.forwardRef(function (_ref5, ref) {
  var className = _ref5.className,
    props = _objectWithoutProperties(_ref5, _excluded5);
  return _jsx(SelectPrimitive.Separator, _objectSpread({
    ref: ref,
    className: cn('-mx-1 my-1 h-px bg-muted', className)
  }, props));
});
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator };