import Header from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/layout/header.tsx";
import Sidebar from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/layout/sidebar.tsx";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "true/jsx-runtime";
export var metadata = {
  title: 'Next Shadcn Dashboard Starter',
  description: 'Basic dashboard with Next.js and Shadcn'
};
export default function DashboardLayout(_ref) {
  var children = _ref.children;
  return _jsxs(_Fragment, {
    children: [_jsx(Header, {}), _jsxs("div", {
      className: "flex h-screen overflow-hidden",
      children: [_jsx(Sidebar, {}), _jsx("main", {
        className: "flex-1 overflow-hidden pt-16",
        children: children
      })]
    })]
  });
}