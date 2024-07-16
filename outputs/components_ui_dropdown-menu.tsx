'use client';

function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
var _excluded = ["className", "inset", "children"],
  _excluded2 = ["className"],
  _excluded3 = ["className", "sideOffset"],
  _excluded4 = ["className", "inset"],
  _excluded5 = ["className", "children", "checked"],
  _excluded6 = ["className", "children"],
  _excluded7 = ["className", "inset"],
  _excluded8 = ["className"],
  _excluded9 = ["className"];
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
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { CheckIcon, ChevronRightIcon, DotFilledIcon } from '@radix-ui/react-icons';
import { cn } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/lib/utils.ts";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
var DropdownMenu = DropdownMenuPrimitive.Root;
var DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
var DropdownMenuGroup = DropdownMenuPrimitive.Group;
var DropdownMenuPortal = DropdownMenuPrimitive.Portal;
var DropdownMenuSub = DropdownMenuPrimitive.Sub;
var DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
var DropdownMenuSubTrigger = /*#__PURE__*/React.forwardRef(function (_ref, ref) {
  var className = _ref.className,
    inset = _ref.inset,
    children = _ref.children,
    props = _objectWithoutProperties(_ref, _excluded);
  return _jsxs(DropdownMenuPrimitive.SubTrigger, _objectSpread(_objectSpread({
    ref: ref,
    className: cn('flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent', inset && 'pl-8', className)
  }, props), {}, {
    children: [children, _jsx(ChevronRightIcon, {
      className: "ml-auto h-4 w-4"
    })]
  }));
});
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
var DropdownMenuSubContent = /*#__PURE__*/React.forwardRef(function (_ref2, ref) {
  var className = _ref2.className,
    props = _objectWithoutProperties(_ref2, _excluded2);
  return _jsx(DropdownMenuPrimitive.SubContent, _objectSpread({
    ref: ref,
    className: cn('z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2', className)
  }, props));
});
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
var DropdownMenuContent = /*#__PURE__*/React.forwardRef(function (_ref3, ref) {
  var className = _ref3.className,
    _ref3$sideOffset = _ref3.sideOffset,
    sideOffset = _ref3$sideOffset === void 0 ? 4 : _ref3$sideOffset,
    props = _objectWithoutProperties(_ref3, _excluded3);
  return _jsx(DropdownMenuPrimitive.Portal, {
    children: _jsx(DropdownMenuPrimitive.Content, _objectSpread({
      ref: ref,
      sideOffset: sideOffset,
      className: cn('z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md', 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2', className)
    }, props))
  });
});
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
var DropdownMenuItem = /*#__PURE__*/React.forwardRef(function (_ref4, ref) {
  var className = _ref4.className,
    inset = _ref4.inset,
    props = _objectWithoutProperties(_ref4, _excluded4);
  return _jsx(DropdownMenuPrimitive.Item, _objectSpread({
    ref: ref,
    className: cn('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', inset && 'pl-8', className)
  }, props));
});
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
var DropdownMenuCheckboxItem = /*#__PURE__*/React.forwardRef(function (_ref5, ref) {
  var className = _ref5.className,
    children = _ref5.children,
    checked = _ref5.checked,
    props = _objectWithoutProperties(_ref5, _excluded5);
  return _jsxs(DropdownMenuPrimitive.CheckboxItem, _objectSpread(_objectSpread({
    ref: ref,
    className: cn('relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', className),
    checked: checked
  }, props), {}, {
    children: [_jsx("span", {
      className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
      children: _jsx(DropdownMenuPrimitive.ItemIndicator, {
        children: _jsx(CheckIcon, {
          className: "h-4 w-4"
        })
      })
    }), children]
  }));
});
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
var DropdownMenuRadioItem = /*#__PURE__*/React.forwardRef(function (_ref6, ref) {
  var className = _ref6.className,
    children = _ref6.children,
    props = _objectWithoutProperties(_ref6, _excluded6);
  return _jsxs(DropdownMenuPrimitive.RadioItem, _objectSpread(_objectSpread({
    ref: ref,
    className: cn('relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', className)
  }, props), {}, {
    children: [_jsx("span", {
      className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
      children: _jsx(DropdownMenuPrimitive.ItemIndicator, {
        children: _jsx(DotFilledIcon, {
          className: "h-4 w-4 fill-current"
        })
      })
    }), children]
  }));
});
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
var DropdownMenuLabel = /*#__PURE__*/React.forwardRef(function (_ref7, ref) {
  var className = _ref7.className,
    inset = _ref7.inset,
    props = _objectWithoutProperties(_ref7, _excluded7);
  return _jsx(DropdownMenuPrimitive.Label, _objectSpread({
    ref: ref,
    className: cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)
  }, props));
});
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
var DropdownMenuSeparator = /*#__PURE__*/React.forwardRef(function (_ref8, ref) {
  var className = _ref8.className,
    props = _objectWithoutProperties(_ref8, _excluded8);
  return _jsx(DropdownMenuPrimitive.Separator, _objectSpread({
    ref: ref,
    className: cn('-mx-1 my-1 h-px bg-muted', className)
  }, props));
});
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
var DropdownMenuShortcut = function DropdownMenuShortcut(_ref9) {
  var className = _ref9.className,
    props = _objectWithoutProperties(_ref9, _excluded9);
  return _jsx("span", _objectSpread({
    className: cn('ml-auto text-xs tracking-widest opacity-60', className)
  }, props));
};
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup };