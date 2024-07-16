'use client';

import { Button } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { DataTable } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/data-table.tsx";
import { Heading } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/heading.tsx";
import { Separator } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/separator.tsx";
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { columns } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/tables/user-tables/columns.tsx";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "true/jsx-runtime";
export var UserClient = function UserClient(_ref) {
  var data = _ref.data;
  var router = useRouter();
  return _jsxs(_Fragment, {
    children: [_jsxs("div", {
      className: "flex items-start justify-between",
      children: [_jsx(Heading, {
        title: "Users (".concat(data.length, ")"),
        description: "Manage users (Client side table functionalities.)"
      }), _jsxs(Button, {
        className: "text-xs md:text-sm",
        onClick: function onClick() {
          return router.push("/dashboard/user/new");
        },
        children: [_jsx(Plus, {
          className: "mr-2 h-4 w-4"
        }), " Add New"]
      })]
    }), _jsx(Separator, {}), _jsx(DataTable, {
      searchKey: "name",
      columns: columns,
      data: data
    })]
  });
};