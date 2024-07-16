import { Breadcrumbs } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/breadcrumbs.tsx";
import { CreateProfileOne } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/forms/user-profile-stepper/create-profile.tsx";
import { ScrollArea } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/scroll-area.tsx";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
var breadcrumbItems = [{
  title: 'Dashboard',
  link: '/dashboard'
}, {
  title: 'Profile',
  link: '/dashboard/profile'
}];
export default function page() {
  return _jsx(ScrollArea, {
    className: "h-full",
    children: _jsxs("div", {
      className: "flex-1 space-y-4 p-4 pt-6 md:p-8",
      children: [_jsx(Breadcrumbs, {
        items: breadcrumbItems
      }), _jsx(CreateProfileOne, {
        categories: [],
        initialData: null
      })]
    })
  });
}