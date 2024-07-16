'use client';

import { Button } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/dialog.tsx";
import { Input } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/input.tsx";
import { useTaskStore } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/lib/store.ts";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export default function NewSectionDialog() {
  var addCol = useTaskStore(function (state) {
    return state.addCol;
  });
  var handleSubmit = function handleSubmit(e) {
    e.preventDefault();
    var form = e.currentTarget;
    var formData = new FormData(form);
    var _Object$fromEntries = Object.fromEntries(formData),
      title = _Object$fromEntries.title;
    if (typeof title !== 'string') return;
    addCol(title);
  };
  return _jsxs(Dialog, {
    children: [_jsx(DialogTrigger, {
      asChild: true,
      children: _jsx(Button, {
        variant: "secondary",
        size: "lg",
        className: "w-full",
        children: "\uFF0B Add New Section"
      })
    }), _jsxs(DialogContent, {
      className: "sm:max-w-[425px]",
      children: [_jsxs(DialogHeader, {
        children: [_jsx(DialogTitle, {
          children: "Add New Section"
        }), _jsx(DialogDescription, {
          children: "What section you want to add today?"
        })]
      }), _jsx("form", {
        id: "todo-form",
        className: "grid gap-4 py-4",
        onSubmit: handleSubmit,
        children: _jsx("div", {
          className: "grid grid-cols-4 items-center gap-4",
          children: _jsx(Input, {
            id: "title",
            name: "title",
            placeholder: "Section title...",
            className: "col-span-4"
          })
        })
      }), _jsx(DialogFooter, {
        children: _jsx(DialogTrigger, {
          asChild: true,
          children: _jsx(Button, {
            type: "submit",
            size: "sm",
            form: "todo-form",
            children: "Add Section"
          })
        })
      })]
    })]
  });
}