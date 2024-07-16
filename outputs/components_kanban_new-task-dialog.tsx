'use client';

import { Button } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/dialog.tsx";
import { Input } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/input.tsx";
import { Textarea } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/textarea.tsx";
import { useTaskStore } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/lib/store.ts";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export default function NewTaskDialog() {
  var addTask = useTaskStore(function (state) {
    return state.addTask;
  });
  var handleSubmit = function handleSubmit(e) {
    e.preventDefault();
    var form = e.currentTarget;
    var formData = new FormData(form);
    var _Object$fromEntries = Object.fromEntries(formData),
      title = _Object$fromEntries.title,
      description = _Object$fromEntries.description;
    if (typeof title !== 'string' || typeof description !== 'string') return;
    addTask(title, description);
  };
  return _jsxs(Dialog, {
    children: [_jsx(DialogTrigger, {
      asChild: true,
      children: _jsx(Button, {
        variant: "secondary",
        size: "sm",
        children: "\uFF0B Add New Todo"
      })
    }), _jsxs(DialogContent, {
      className: "sm:max-w-[425px]",
      children: [_jsxs(DialogHeader, {
        children: [_jsx(DialogTitle, {
          children: "Add New Todo"
        }), _jsx(DialogDescription, {
          children: "What do you want to get done today?"
        })]
      }), _jsxs("form", {
        id: "todo-form",
        className: "grid gap-4 py-4",
        onSubmit: handleSubmit,
        children: [_jsx("div", {
          className: "grid grid-cols-4 items-center gap-4",
          children: _jsx(Input, {
            id: "title",
            name: "title",
            placeholder: "Todo title...",
            className: "col-span-4"
          })
        }), _jsx("div", {
          className: "grid grid-cols-4 items-center gap-4",
          children: _jsx(Textarea, {
            id: "description",
            name: "description",
            placeholder: "Description...",
            className: "col-span-4"
          })
        })]
      }), _jsx(DialogFooter, {
        children: _jsx(DialogTrigger, {
          asChild: true,
          children: _jsx(Button, {
            type: "submit",
            size: "sm",
            form: "todo-form",
            children: "Add Todo"
          })
        })
      })]
    })]
  });
}