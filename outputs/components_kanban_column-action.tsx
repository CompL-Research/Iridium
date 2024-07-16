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
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import * as React from 'react';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/alert-dialog.tsx";
import { Button } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/dropdown-menu.tsx";
import { useToast } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/use-toast.ts";
import { useTaskStore } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/lib/store.ts";
import { Input } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/input.tsx";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "true/jsx-runtime";
export function ColumnActions(_ref) {
  var title = _ref.title,
    id = _ref.id;
  var _React$useState = React.useState(false),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    open = _React$useState2[0],
    setIsOpen = _React$useState2[1];
  var _React$useState3 = React.useState(title),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    name = _React$useState4[0],
    setName = _React$useState4[1];
  var updateCol = useTaskStore(function (state) {
    return state.updateCol;
  });
  var removeCol = useTaskStore(function (state) {
    return state.removeCol;
  });
  var _React$useState5 = React.useState(true),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    editDisable = _React$useState6[0],
    setIsEditDisable = _React$useState6[1];
  var _React$useState7 = React.useState(false),
    _React$useState8 = _slicedToArray(_React$useState7, 2),
    showDeleteDialog = _React$useState8[0],
    setShowDeleteDialog = _React$useState8[1];
  var inputRef = React.useRef(null);
  var _useToast = useToast(),
    toast = _useToast.toast;
  return _jsxs(_Fragment, {
    children: [_jsx("form", {
      onSubmit: function onSubmit(e) {
        e.preventDefault();
        setIsEditDisable(!editDisable);
        updateCol(id, name);
        toast({
          title: 'Name Updated',
          variant: 'default',
          description: "".concat(title, " updated to ").concat(name)
        });
      },
      children: _jsx(Input, {
        value: name,
        onChange: function onChange(e) {
          return setName(e.target.value);
        },
        className: "!mt-0 mr-auto text-base disabled:cursor-pointer disabled:border-none disabled:opacity-100",
        disabled: editDisable,
        ref: inputRef
      })
    }), _jsxs(DropdownMenu, {
      modal: false,
      children: [_jsx(DropdownMenuTrigger, {
        asChild: true,
        children: _jsxs(Button, {
          variant: "secondary",
          className: "ml-1",
          children: [_jsx("span", {
            className: "sr-only",
            children: "Actions"
          }), _jsx(DotsHorizontalIcon, {
            className: "h-4 w-4"
          })]
        })
      }), _jsxs(DropdownMenuContent, {
        align: "end",
        children: [_jsx(DropdownMenuItem, {
          onSelect: function onSelect() {
            setIsEditDisable(!editDisable);
            setTimeout(function () {
              var _inputRef$current;
              inputRef.current && ((_inputRef$current = inputRef.current) === null || _inputRef$current === void 0 ? void 0 : _inputRef$current.focus());
            }, 500);
          },
          children: "Rename"
        }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuItem, {
          onSelect: function onSelect() {
            return setShowDeleteDialog(true);
          },
          className: "text-red-600",
          children: "Delete Section"
        })]
      })]
    }), _jsx(AlertDialog, {
      open: showDeleteDialog,
      onOpenChange: setShowDeleteDialog,
      children: _jsxs(AlertDialogContent, {
        children: [_jsxs(AlertDialogHeader, {
          children: [_jsx(AlertDialogTitle, {
            children: "Are you sure want to delete column?"
          }), _jsx(AlertDialogDescription, {
            children: "NOTE: All tasks related to this category will also be deleted."
          })]
        }), _jsxs(AlertDialogFooter, {
          children: [_jsx(AlertDialogCancel, {
            children: "Cancel"
          }), _jsx(Button, {
            variant: "destructive",
            onClick: function onClick() {
              // yes, you have to set a timeout
              setTimeout(function () {
                return document.body.style.pointerEvents = '';
              }, 100);
              setShowDeleteDialog(false);
              removeCol(id);
              toast({
                description: 'This column has been deleted.'
              });
            },
            children: "Delete"
          })]
        })]
      })
    })]
  });
}