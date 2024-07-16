import { Breadcrumbs } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/breadcrumbs.tsx";
import { UserClient } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/tables/user-tables/client.tsx";
import { users } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/constants/data.ts";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "true/jsx-runtime";
var breadcrumbItems = [{
  title: 'Dashboard',
  link: '/dashboard'
}, {
  title: 'User',
  link: '/dashboard/user'
}];
export default function page() {
  return _jsx(_Fragment, {
    children: _jsxs("div", {
      className: "flex-1 space-y-4  p-4 pt-6 md:p-8",
      children: [_jsx(Breadcrumbs, {
        items: breadcrumbItems
      }), _jsx(UserClient, {
        data: users
      })]
    })
  });
}