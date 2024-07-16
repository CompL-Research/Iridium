'use client';

import { CellAction } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/tables/user-tables/cell-action.tsx";
import { Checkbox } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/checkbox.tsx";
import { jsx as _jsx } from "true/jsx-runtime";
export var columns = [{
  id: 'select',
  header: function header(_ref) {
    var table = _ref.table;
    return _jsx(Checkbox, {
      checked: table.getIsAllPageRowsSelected(),
      onCheckedChange: function onCheckedChange(value) {
        return table.toggleAllPageRowsSelected(!!value);
      },
      "aria-label": "Select all"
    });
  },
  cell: function cell(_ref2) {
    var row = _ref2.row;
    return _jsx(Checkbox, {
      checked: row.getIsSelected(),
      onCheckedChange: function onCheckedChange(value) {
        return row.toggleSelected(!!value);
      },
      "aria-label": "Select row"
    });
  },
  enableSorting: false,
  enableHiding: false
}, {
  accessorKey: 'name',
  header: 'NAME'
}, {
  accessorKey: 'company',
  header: 'COMPANY'
}, {
  accessorKey: 'role',
  header: 'ROLE'
}, {
  accessorKey: 'status',
  header: 'STATUS'
}, {
  id: 'actions',
  cell: function cell(_ref3) {
    var row = _ref3.row;
    return _jsx(CellAction, {
      data: row.original
    });
  }
}];