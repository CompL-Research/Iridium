import { Breadcrumbs } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/breadcrumbs.tsx";
import { ProductForm } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/forms/product-form.tsx";
import { ScrollArea } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/scroll-area.tsx";
import React from 'react';
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
var breadcrumbItems = [{
  title: 'Dashboard',
  link: '/dashboard'
}, {
  title: 'Employee',
  link: '/dashboard/employee'
}, {
  title: 'Create',
  link: '/dashboard/employee/create'
}];
export default function Page() {
  return _jsx(ScrollArea, {
    className: "h-full",
    children: _jsxs("div", {
      className: "flex-1 space-y-4 p-8",
      children: [_jsx(Breadcrumbs, {
        items: breadcrumbItems
      }), _jsx(ProductForm, {
        categories: [{
          _id: 'shirts',
          name: 'shirts'
        }, {
          _id: 'pants',
          name: 'pants'
        }],
        initialData: null
      }, null)]
    })
  });
}