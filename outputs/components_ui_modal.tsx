'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/dialog.tsx";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export var Modal = function Modal(_ref) {
  var title = _ref.title,
    description = _ref.description,
    isOpen = _ref.isOpen,
    onClose = _ref.onClose,
    children = _ref.children;
  var onChange = function onChange(open) {
    if (!open) {
      onClose();
    }
  };
  return _jsx(Dialog, {
    open: isOpen,
    onOpenChange: onChange,
    children: _jsxs(DialogContent, {
      children: [_jsxs(DialogHeader, {
        children: [_jsx(DialogTitle, {
          children: title
        }), _jsx(DialogDescription, {
          children: description
        })]
      }), _jsx("div", {
        children: children
      })]
    })
  });
};