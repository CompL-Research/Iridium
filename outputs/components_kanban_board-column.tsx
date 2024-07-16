function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
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
import { useDndContext } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';
import { GripVertical } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { Card, CardContent, CardHeader } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/card.tsx";
import { ColumnActions } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/kanban/column-action.tsx";
import { TaskCard } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/kanban/task-card.tsx";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export function BoardColumn(_ref) {
  var column = _ref.column,
    tasks = _ref.tasks,
    isOverlay = _ref.isOverlay;
  var tasksIds = useMemo(function () {
    return tasks.map(function (task) {
      return task.id;
    });
  }, [tasks]);
  var _useSortable = useSortable({
      id: column.id,
      data: {
        type: 'Column',
        column: column
      },
      attributes: {
        roleDescription: "Column: ".concat(column.title)
      }
    }),
    setNodeRef = _useSortable.setNodeRef,
    attributes = _useSortable.attributes,
    listeners = _useSortable.listeners,
    transform = _useSortable.transform,
    transition = _useSortable.transition,
    isDragging = _useSortable.isDragging;
  var style = {
    transition: transition,
    transform: CSS.Translate.toString(transform)
  };
  var variants = cva('h-[70vh] max-h-[70vh] w-[350px] max-w-full bg-secondary flex flex-col flex-shrink-0 snap-center', {
    variants: {
      dragging: {
        "default": 'border-2 border-transparent',
        over: 'ring-2 opacity-30',
        overlay: 'ring-2 ring-primary'
      }
    }
  });
  return _jsxs(Card, {
    ref: setNodeRef,
    style: style,
    className: variants({
      dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined
    }),
    children: [_jsxs(CardHeader, {
      className: "space-between flex flex-row items-center border-b-2 p-4 text-left font-semibold",
      children: [_jsxs(Button, _objectSpread(_objectSpread(_objectSpread({
        variant: 'ghost'
      }, attributes), listeners), {}, {
        className: " relative -ml-2 h-auto cursor-grab p-1 text-primary/50",
        children: [_jsx("span", {
          className: "sr-only",
          children: "Move column: ".concat(column.title)
        }), _jsx(GripVertical, {})]
      })), _jsx(ColumnActions, {
        id: column.id,
        title: column.title
      })]
    }), _jsx(CardContent, {
      className: "flex flex-grow flex-col gap-4 overflow-y-auto overflow-x-hidden p-2",
      children: _jsx(SortableContext, {
        items: tasksIds,
        children: tasks.map(function (task) {
          return _jsx(TaskCard, {
            task: task
          }, task.id);
        })
      })
    })]
  });
}
export function BoardContainer(_ref2) {
  var children = _ref2.children;
  var dndContext = useDndContext();
  var variations = cva('overflow-x-auto px-2  pb-4 md:px-0 flex lg:justify-start', {
    variants: {
      dragging: {
        "default": '',
        active: 'snap-none'
      }
    }
  });
  return _jsx("div", {
    className: variations({
      dragging: dndContext.active ? 'active' : 'default'
    }),
    children: _jsx("div", {
      className: "flex flex-row items-start justify-center gap-4",
      children: children
    })
  });
}