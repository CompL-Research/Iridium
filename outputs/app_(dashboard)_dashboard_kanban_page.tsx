import { Breadcrumbs } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/breadcrumbs.tsx";
import { KanbanBoard } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/kanban/kanban-board.tsx";
import NewTaskDialog from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/kanban/new-task-dialog.tsx";
import { Heading } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/heading.tsx";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "true/jsx-runtime";
var breadcrumbItems = [{
  title: 'Dashboard',
  link: '/dashboard'
}, {
  title: 'Kanban',
  link: '/dashboard/kanban'
}];
export default function page() {
  return _jsx(_Fragment, {
    children: _jsxs("div", {
      className: "flex-1 space-y-4 p-4 pt-6 md:p-8",
      children: [_jsx(Breadcrumbs, {
        items: breadcrumbItems
      }), _jsxs("div", {
        className: "flex items-start justify-between",
        children: [_jsx(Heading, {
          title: "Kanban",
          description: "Manage tasks by dnd"
        }), _jsx(NewTaskDialog, {})]
      }), _jsx(KanbanBoard, {})]
    })
  });
}