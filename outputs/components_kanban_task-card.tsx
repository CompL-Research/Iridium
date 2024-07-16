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
import { Button } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { Card, CardContent, CardHeader } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/card.tsx";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';
import { GripVertical } from 'lucide-react';
import { Badge } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/badge.tsx";

// export interface Task {
//   id: UniqueIdentifier;
//   columnId: ColumnId;
//   content: string;
// }
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export function TaskCard(_ref) {
  var task = _ref.task,
    isOverlay = _ref.isOverlay;
  var _useSortable = useSortable({
      id: task.id,
      data: {
        type: 'Task',
        task: task
      },
      attributes: {
        roleDescription: 'Task'
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
  var variants = cva('', {
    variants: {
      dragging: {
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
      className: "space-between relative flex flex-row border-b-2 border-secondary px-3 py-3",
      children: [_jsxs(Button, _objectSpread(_objectSpread(_objectSpread({
        variant: 'ghost'
      }, attributes), listeners), {}, {
        className: "-ml-2 h-auto cursor-grab p-1 text-secondary-foreground/50",
        children: [_jsx("span", {
          className: "sr-only",
          children: "Move task"
        }), _jsx(GripVertical, {})]
      })), _jsx(Badge, {
        variant: 'outline',
        className: "ml-auto font-semibold",
        children: "Task"
      })]
    }), _jsx(CardContent, {
      className: "whitespace-pre-wrap px-3 pb-6 pt-3 text-left",
      children: task.title
    })]
  });
}