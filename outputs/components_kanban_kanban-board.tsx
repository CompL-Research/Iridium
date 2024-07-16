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
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTaskStore } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/lib/store.ts";
import { hasDraggableData } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/lib/utils.ts";
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { BoardColumn, BoardContainer } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/kanban/board-column.tsx";
import NewSectionDialog from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/kanban/new-section-dialog.tsx";
import { TaskCard } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/kanban/task-card.tsx";
// import { coordinateGetter } from "./multipleContainersKeyboardPreset";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
var defaultCols = [{
  id: 'TODO',
  title: 'Todo'
}, {
  id: 'IN_PROGRESS',
  title: 'In progress'
}, {
  id: 'DONE',
  title: 'Done'
}];
var initialTasks = [{
  id: 'task1',
  status: 'DONE',
  title: 'Project initiation and planning'
}, {
  id: 'task2',
  status: 'DONE',
  title: 'Gather requirements from stakeholders'
}];
export function KanbanBoard() {
  // const [columns, setColumns] = useState<Column[]>(defaultCols);
  var columns = useTaskStore(function (state) {
    return state.columns;
  });
  var setColumns = useTaskStore(function (state) {
    return state.setCols;
  });
  var pickedUpTaskColumn = useRef(null);
  var columnsId = useMemo(function () {
    return columns.map(function (col) {
      return col.id;
    });
  }, [columns]);

  // const [tasks, setTasks] = useState<Task[]>(initialTasks);
  var tasks = useTaskStore(function (state) {
    return state.tasks;
  });
  var setTasks = useTaskStore(function (state) {
    return state.setTasks;
  });
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    activeColumn = _useState2[0],
    setActiveColumn = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isMounted = _useState4[0],
    setIsMounted = _useState4[1];
  var _useState5 = useState(null),
    _useState6 = _slicedToArray(_useState5, 2),
    activeTask = _useState6[0],
    setActiveTask = _useState6[1];
  var sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor)
  // useSensor(KeyboardSensor, {
  //   coordinateGetter: coordinateGetter,
  // }),
  );
  useEffect(function () {
    setIsMounted(true);
  }, [isMounted]);
  useEffect(function () {
    useTaskStore.persist.rehydrate();
  }, []);
  if (!isMounted) return;
  function getDraggingTaskData(taskId, columnId) {
    var tasksInColumn = tasks.filter(function (task) {
      return task.status === columnId;
    });
    var taskPosition = tasksInColumn.findIndex(function (task) {
      return task.id === taskId;
    });
    var column = columns.find(function (col) {
      return col.id === columnId;
    });
    return {
      tasksInColumn: tasksInColumn,
      taskPosition: taskPosition,
      column: column
    };
  }
  var announcements = {
    onDragStart: function onDragStart(_ref) {
      var _active$data$current, _active$data$current2;
      var active = _ref.active;
      if (!hasDraggableData(active)) return;
      if (((_active$data$current = active.data.current) === null || _active$data$current === void 0 ? void 0 : _active$data$current.type) === 'Column') {
        var startColumnIdx = columnsId.findIndex(function (id) {
          return id === active.id;
        });
        var startColumn = columns[startColumnIdx];
        return "Picked up Column ".concat(startColumn === null || startColumn === void 0 ? void 0 : startColumn.title, " at position: ").concat(startColumnIdx + 1, " of ").concat(columnsId.length);
      } else if (((_active$data$current2 = active.data.current) === null || _active$data$current2 === void 0 ? void 0 : _active$data$current2.type) === 'Task') {
        pickedUpTaskColumn.current = active.data.current.task.status;
        var _getDraggingTaskData = getDraggingTaskData(active.id, pickedUpTaskColumn.current),
          tasksInColumn = _getDraggingTaskData.tasksInColumn,
          taskPosition = _getDraggingTaskData.taskPosition,
          column = _getDraggingTaskData.column;
        return "Picked up Task ".concat(active.data.current.task.title, " at position: ").concat(taskPosition + 1, " of ").concat(tasksInColumn.length, " in column ").concat(column === null || column === void 0 ? void 0 : column.title);
      }
    },
    onDragOver: function onDragOver(_ref2) {
      var _active$data$current3, _over$data$current, _active$data$current4, _over$data$current2;
      var active = _ref2.active,
        over = _ref2.over;
      if (!hasDraggableData(active) || !hasDraggableData(over)) return;
      if (((_active$data$current3 = active.data.current) === null || _active$data$current3 === void 0 ? void 0 : _active$data$current3.type) === 'Column' && ((_over$data$current = over.data.current) === null || _over$data$current === void 0 ? void 0 : _over$data$current.type) === 'Column') {
        var overColumnIdx = columnsId.findIndex(function (id) {
          return id === over.id;
        });
        return "Column ".concat(active.data.current.column.title, " was moved over ").concat(over.data.current.column.title, " at position ").concat(overColumnIdx + 1, " of ").concat(columnsId.length);
      } else if (((_active$data$current4 = active.data.current) === null || _active$data$current4 === void 0 ? void 0 : _active$data$current4.type) === 'Task' && ((_over$data$current2 = over.data.current) === null || _over$data$current2 === void 0 ? void 0 : _over$data$current2.type) === 'Task') {
        var _getDraggingTaskData2 = getDraggingTaskData(over.id, over.data.current.task.status),
          tasksInColumn = _getDraggingTaskData2.tasksInColumn,
          taskPosition = _getDraggingTaskData2.taskPosition,
          column = _getDraggingTaskData2.column;
        if (over.data.current.task.status !== pickedUpTaskColumn.current) {
          return "Task ".concat(active.data.current.task.title, " was moved over column ").concat(column === null || column === void 0 ? void 0 : column.title, " in position ").concat(taskPosition + 1, " of ").concat(tasksInColumn.length);
        }
        return "Task was moved over position ".concat(taskPosition + 1, " of ").concat(tasksInColumn.length, " in column ").concat(column === null || column === void 0 ? void 0 : column.title);
      }
    },
    onDragEnd: function onDragEnd(_ref3) {
      var _active$data$current5, _over$data$current3, _active$data$current6, _over$data$current4;
      var active = _ref3.active,
        over = _ref3.over;
      if (!hasDraggableData(active) || !hasDraggableData(over)) {
        pickedUpTaskColumn.current = null;
        return;
      }
      if (((_active$data$current5 = active.data.current) === null || _active$data$current5 === void 0 ? void 0 : _active$data$current5.type) === 'Column' && ((_over$data$current3 = over.data.current) === null || _over$data$current3 === void 0 ? void 0 : _over$data$current3.type) === 'Column') {
        var overColumnPosition = columnsId.findIndex(function (id) {
          return id === over.id;
        });
        return "Column ".concat(active.data.current.column.title, " was dropped into position ").concat(overColumnPosition + 1, " of ").concat(columnsId.length);
      } else if (((_active$data$current6 = active.data.current) === null || _active$data$current6 === void 0 ? void 0 : _active$data$current6.type) === 'Task' && ((_over$data$current4 = over.data.current) === null || _over$data$current4 === void 0 ? void 0 : _over$data$current4.type) === 'Task') {
        var _getDraggingTaskData3 = getDraggingTaskData(over.id, over.data.current.task.status),
          tasksInColumn = _getDraggingTaskData3.tasksInColumn,
          taskPosition = _getDraggingTaskData3.taskPosition,
          column = _getDraggingTaskData3.column;
        if (over.data.current.task.status !== pickedUpTaskColumn.current) {
          return "Task was dropped into column ".concat(column === null || column === void 0 ? void 0 : column.title, " in position ").concat(taskPosition + 1, " of ").concat(tasksInColumn.length);
        }
        return "Task was dropped into position ".concat(taskPosition + 1, " of ").concat(tasksInColumn.length, " in column ").concat(column === null || column === void 0 ? void 0 : column.title);
      }
      pickedUpTaskColumn.current = null;
    },
    onDragCancel: function onDragCancel(_ref4) {
      var _active$data$current7;
      var active = _ref4.active;
      pickedUpTaskColumn.current = null;
      if (!hasDraggableData(active)) return;
      return "Dragging ".concat((_active$data$current7 = active.data.current) === null || _active$data$current7 === void 0 ? void 0 : _active$data$current7.type, " cancelled.");
    }
  };
  return _jsxs(DndContext, {
    accessibility: {
      announcements: announcements
    },
    sensors: sensors,
    onDragStart: onDragStart,
    onDragEnd: onDragEnd,
    onDragOver: onDragOver,
    children: [_jsx(BoardContainer, {
      children: _jsxs(SortableContext, {
        items: columnsId,
        children: [columns === null || columns === void 0 ? void 0 : columns.map(function (col, index) {
          return _jsxs(Fragment, {
            children: [_jsx(BoardColumn, {
              column: col,
              tasks: tasks.filter(function (task) {
                return task.status === col.id;
              })
            }), index === (columns === null || columns === void 0 ? void 0 : columns.length) - 1 && _jsx("div", {
              className: "w-[300px]",
              children: _jsx(NewSectionDialog, {})
            })]
          }, col.id);
        }), !columns.length && _jsx(NewSectionDialog, {})]
      })
    }), 'document' in window && /*#__PURE__*/createPortal(_jsxs(DragOverlay, {
      children: [activeColumn && _jsx(BoardColumn, {
        isOverlay: true,
        column: activeColumn,
        tasks: tasks.filter(function (task) {
          return task.status === activeColumn.id;
        })
      }), activeTask && _jsx(TaskCard, {
        task: activeTask,
        isOverlay: true
      })]
    }), document.body)]
  });
  function onDragStart(event) {
    if (!hasDraggableData(event.active)) return;
    var data = event.active.data.current;
    if ((data === null || data === void 0 ? void 0 : data.type) === 'Column') {
      setActiveColumn(data.column);
      return;
    }
    if ((data === null || data === void 0 ? void 0 : data.type) === 'Task') {
      setActiveTask(data.task);
      return;
    }
  }
  function onDragEnd(event) {
    setActiveColumn(null);
    setActiveTask(null);
    var active = event.active,
      over = event.over;
    if (!over) return;
    var activeId = active.id;
    var overId = over.id;
    if (!hasDraggableData(active)) return;
    var activeData = active.data.current;
    if (activeId === overId) return;
    var isActiveAColumn = (activeData === null || activeData === void 0 ? void 0 : activeData.type) === 'Column';
    if (!isActiveAColumn) return;
    var activeColumnIndex = columns.findIndex(function (col) {
      return col.id === activeId;
    });
    var overColumnIndex = columns.findIndex(function (col) {
      return col.id === overId;
    });
    setColumns(arrayMove(columns, activeColumnIndex, overColumnIndex));
  }
  function onDragOver(event) {
    var active = event.active,
      over = event.over;
    if (!over) return;
    var activeId = active.id;
    var overId = over.id;
    if (activeId === overId) return;
    if (!hasDraggableData(active) || !hasDraggableData(over)) return;
    var activeData = active.data.current;
    var overData = over.data.current;
    var isActiveATask = (activeData === null || activeData === void 0 ? void 0 : activeData.type) === 'Task';
    var isOverATask = (activeData === null || activeData === void 0 ? void 0 : activeData.type) === 'Task';
    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      var activeIndex = tasks.findIndex(function (t) {
        return t.id === activeId;
      });
      var overIndex = tasks.findIndex(function (t) {
        return t.id === overId;
      });
      var _activeTask = tasks[activeIndex];
      var overTask = tasks[overIndex];
      if (_activeTask && overTask && _activeTask.status !== overTask.status) {
        _activeTask.status = overTask.status;
        setTasks(arrayMove(tasks, activeIndex, overIndex - 1));
      }
      setTasks(arrayMove(tasks, activeIndex, overIndex));
    }
    var isOverAColumn = (overData === null || overData === void 0 ? void 0 : overData.type) === 'Column';

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      var _activeIndex = tasks.findIndex(function (t) {
        return t.id === activeId;
      });
      var _activeTask2 = tasks[_activeIndex];
      if (_activeTask2) {
        _activeTask2.status = overId;
        setTasks(arrayMove(tasks, _activeIndex, _activeIndex));
      }
    }
  }
}