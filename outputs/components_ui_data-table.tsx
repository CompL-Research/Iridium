'use client';

import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/table.tsx";
import { Input } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/input.tsx";
import { Button } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { ScrollArea, ScrollBar } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/scroll-area.tsx";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "true/jsx-runtime";
export function DataTable(_ref) {
  var _ref2, _table$getColumn, _table$getRowModel$ro;
  var columns = _ref.columns,
    data = _ref.data,
    searchKey = _ref.searchKey;
  var table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  /* this can be used to get the selectedrows 
  console.log("value", table.getFilteredSelectedRowModel()); */

  return _jsxs(_Fragment, {
    children: [_jsx(Input, {
      placeholder: "Search ".concat(searchKey, "..."),
      value: (_ref2 = (_table$getColumn = table.getColumn(searchKey)) === null || _table$getColumn === void 0 ? void 0 : _table$getColumn.getFilterValue()) !== null && _ref2 !== void 0 ? _ref2 : '',
      onChange: function onChange(event) {
        var _table$getColumn2;
        return (_table$getColumn2 = table.getColumn(searchKey)) === null || _table$getColumn2 === void 0 ? void 0 : _table$getColumn2.setFilterValue(event.target.value);
      },
      className: "w-full md:max-w-sm"
    }), _jsxs(ScrollArea, {
      className: "h-[calc(80vh-220px)] rounded-md border",
      children: [_jsxs(Table, {
        className: "relative",
        children: [_jsx(TableHeader, {
          children: table.getHeaderGroups().map(function (headerGroup) {
            return _jsx(TableRow, {
              children: headerGroup.headers.map(function (header) {
                return _jsx(TableHead, {
                  children: header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())
                }, header.id);
              })
            }, headerGroup.id);
          })
        }), _jsx(TableBody, {
          children: (_table$getRowModel$ro = table.getRowModel().rows) !== null && _table$getRowModel$ro !== void 0 && _table$getRowModel$ro.length ? table.getRowModel().rows.map(function (row) {
            return _jsx(TableRow, {
              "data-state": row.getIsSelected() && 'selected',
              children: row.getVisibleCells().map(function (cell) {
                return _jsx(TableCell, {
                  children: flexRender(cell.column.columnDef.cell, cell.getContext())
                }, cell.id);
              })
            }, row.id);
          }) : _jsx(TableRow, {
            children: _jsx(TableCell, {
              colSpan: columns.length,
              className: "h-24 text-center",
              children: "No results."
            })
          })
        })]
      }), _jsx(ScrollBar, {
        orientation: "horizontal"
      })]
    }), _jsxs("div", {
      className: "flex items-center justify-end space-x-2 py-4",
      children: [_jsxs("div", {
        className: "flex-1 text-sm text-muted-foreground",
        children: [table.getFilteredSelectedRowModel().rows.length, " of", ' ', table.getFilteredRowModel().rows.length, " row(s) selected."]
      }), _jsxs("div", {
        className: "space-x-2",
        children: [_jsx(Button, {
          variant: "outline",
          size: "sm",
          onClick: function onClick() {
            return table.previousPage();
          },
          disabled: !table.getCanPreviousPage(),
          children: "Previous"
        }), _jsx(Button, {
          variant: "outline",
          size: "sm",
          onClick: function onClick() {
            return table.nextPage();
          },
          disabled: !table.getCanNextPage(),
          children: "Next"
        })]
      })]
    })]
  });
}