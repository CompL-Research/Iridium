import { Slash } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/breadcrumb.tsx";
import { Fragment } from 'react';
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export function Breadcrumbs(_ref) {
  var items = _ref.items;
  return _jsx(Breadcrumb, {
    children: _jsx(BreadcrumbList, {
      children: items.map(function (item, index) {
        return _jsxs(Fragment, {
          children: [index !== items.length - 1 && _jsx(BreadcrumbItem, {
            children: _jsx(BreadcrumbLink, {
              href: item.link,
              children: item.title
            })
          }), index < items.length - 1 && _jsx(BreadcrumbSeparator, {
            children: _jsx(Slash, {})
          }), index === items.length - 1 && _jsx(BreadcrumbPage, {
            children: item.title
          })]
        }, item.title);
      })
    })
  });
}