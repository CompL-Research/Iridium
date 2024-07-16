'use client';

function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
function _toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
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
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import React from 'react';
import { Button } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { Input } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/select.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/table.tsx";
import { DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ScrollArea, ScrollBar } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/scroll-area.tsx";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "true/jsx-runtime";
export function EmployeeTable(_ref) {
  var _searchParams$get, _searchParams$get2, _table$getColumn, _ref2, _table$getColumn2, _table$getRowModel$ro;
  var columns = _ref.columns,
    data = _ref.data,
    pageNo = _ref.pageNo,
    searchKey = _ref.searchKey,
    totalUsers = _ref.totalUsers,
    pageCount = _ref.pageCount,
    _ref$pageSizeOptions = _ref.pageSizeOptions,
    pageSizeOptions = _ref$pageSizeOptions === void 0 ? [10, 20, 30, 40, 50] : _ref$pageSizeOptions;
  var router = useRouter();
  var pathname = usePathname();
  var searchParams = useSearchParams();
  // Search params
  var page = (_searchParams$get = searchParams === null || searchParams === void 0 ? void 0 : searchParams.get('page')) !== null && _searchParams$get !== void 0 ? _searchParams$get : '1';
  var pageAsNumber = Number(page);
  var fallbackPage = isNaN(pageAsNumber) || pageAsNumber < 1 ? 1 : pageAsNumber;
  var per_page = (_searchParams$get2 = searchParams === null || searchParams === void 0 ? void 0 : searchParams.get('limit')) !== null && _searchParams$get2 !== void 0 ? _searchParams$get2 : '10';
  var perPageAsNumber = Number(per_page);
  var fallbackPerPage = isNaN(perPageAsNumber) ? 10 : perPageAsNumber;

  /* this can be used to get the selectedrows 
  console.log("value", table.getFilteredSelectedRowModel()); */

  // Create query string
  var createQueryString = React.useCallback(function (params) {
    var newSearchParams = new URLSearchParams(searchParams === null || searchParams === void 0 ? void 0 : searchParams.toString());
    for (var _i = 0, _Object$entries = Object.entries(params); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        key = _Object$entries$_i[0],
        value = _Object$entries$_i[1];
      if (value === null) {
        newSearchParams["delete"](key);
      } else {
        newSearchParams.set(key, String(value));
      }
    }
    return newSearchParams.toString();
  }, [searchParams]);

  // Handle server-side pagination
  var _React$useState = React.useState({
      pageIndex: fallbackPage - 1,
      pageSize: fallbackPerPage
    }),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    _React$useState2$ = _React$useState2[0],
    pageIndex = _React$useState2$.pageIndex,
    pageSize = _React$useState2$.pageSize,
    setPagination = _React$useState2[1];
  React.useEffect(function () {
    router.push("".concat(pathname, "?").concat(createQueryString({
      page: pageIndex + 1,
      limit: pageSize
    })), {
      scroll: false
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize]);
  var table = useReactTable({
    data: data,
    columns: columns,
    pageCount: pageCount !== null && pageCount !== void 0 ? pageCount : -1,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination: {
        pageIndex: pageIndex,
        pageSize: pageSize
      }
    },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true
  });
  var searchValue = (_table$getColumn = table.getColumn(searchKey)) === null || _table$getColumn === void 0 ? void 0 : _table$getColumn.getFilterValue();

  // React.useEffect(() => {
  //   if (debounceValue.length > 0) {
  //     router.push(
  //       `${pathname}?${createQueryString({
  //         [selectedOption.value]: `${debounceValue}${
  //           debounceValue.length > 0 ? `.${filterVariety}` : ""
  //         }`,
  //       })}`,
  //       {
  //         scroll: false,
  //       }
  //     )
  //   }

  //   if (debounceValue.length === 0) {
  //     router.push(
  //       `${pathname}?${createQueryString({
  //         [selectedOption.value]: null,
  //       })}`,
  //       {
  //         scroll: false,
  //       }
  //     )
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [debounceValue, filterVariety, selectedOption.value])

  React.useEffect(function () {
    if ((searchValue === null || searchValue === void 0 ? void 0 : searchValue.length) > 0) {
      router.push("".concat(pathname, "?").concat(createQueryString({
        page: null,
        limit: null,
        search: searchValue
      })), {
        scroll: false
      });
    }
    if ((searchValue === null || searchValue === void 0 ? void 0 : searchValue.length) === 0 || searchValue === undefined) {
      router.push("".concat(pathname, "?").concat(createQueryString({
        page: null,
        limit: null,
        search: null
      })), {
        scroll: false
      });
    }
    setPagination(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        pageIndex: 0
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);
  return _jsxs(_Fragment, {
    children: [_jsx(Input, {
      placeholder: "Search ".concat(searchKey, "..."),
      value: (_ref2 = (_table$getColumn2 = table.getColumn(searchKey)) === null || _table$getColumn2 === void 0 ? void 0 : _table$getColumn2.getFilterValue()) !== null && _ref2 !== void 0 ? _ref2 : '',
      onChange: function onChange(event) {
        var _table$getColumn3;
        return (_table$getColumn3 = table.getColumn(searchKey)) === null || _table$getColumn3 === void 0 ? void 0 : _table$getColumn3.setFilterValue(event.target.value);
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
      className: "flex flex-col items-center justify-end gap-2 space-x-2 py-4 sm:flex-row",
      children: [_jsxs("div", {
        className: "flex w-full items-center justify-between",
        children: [_jsxs("div", {
          className: "flex-1 text-sm text-muted-foreground",
          children: [table.getFilteredSelectedRowModel().rows.length, " of", ' ', table.getFilteredRowModel().rows.length, " row(s) selected."]
        }), _jsx("div", {
          className: "flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8",
          children: _jsxs("div", {
            className: "flex items-center space-x-2",
            children: [_jsx("p", {
              className: "whitespace-nowrap text-sm font-medium",
              children: "Rows per page"
            }), _jsxs(Select, {
              value: "".concat(table.getState().pagination.pageSize),
              onValueChange: function onValueChange(value) {
                table.setPageSize(Number(value));
              },
              children: [_jsx(SelectTrigger, {
                className: "h-8 w-[70px]",
                children: _jsx(SelectValue, {
                  placeholder: table.getState().pagination.pageSize
                })
              }), _jsx(SelectContent, {
                side: "top",
                children: pageSizeOptions.map(function (pageSize) {
                  return _jsx(SelectItem, {
                    value: "".concat(pageSize),
                    children: pageSize
                  }, pageSize);
                })
              })]
            })]
          })
        })]
      }), _jsxs("div", {
        className: "flex w-full items-center justify-between gap-2 sm:justify-end",
        children: [_jsxs("div", {
          className: "flex w-[100px] items-center justify-center text-sm font-medium",
          children: ["Page ", table.getState().pagination.pageIndex + 1, " of", ' ', table.getPageCount()]
        }), _jsxs("div", {
          className: "flex items-center space-x-2",
          children: [_jsx(Button, {
            "aria-label": "Go to first page",
            variant: "outline",
            className: "hidden h-8 w-8 p-0 lg:flex",
            onClick: function onClick() {
              return table.setPageIndex(0);
            },
            disabled: !table.getCanPreviousPage(),
            children: _jsx(DoubleArrowLeftIcon, {
              className: "h-4 w-4",
              "aria-hidden": "true"
            })
          }), _jsx(Button, {
            "aria-label": "Go to previous page",
            variant: "outline",
            className: "h-8 w-8 p-0",
            onClick: function onClick() {
              return table.previousPage();
            },
            disabled: !table.getCanPreviousPage(),
            children: _jsx(ChevronLeftIcon, {
              className: "h-4 w-4",
              "aria-hidden": "true"
            })
          }), _jsx(Button, {
            "aria-label": "Go to next page",
            variant: "outline",
            className: "h-8 w-8 p-0",
            onClick: function onClick() {
              return table.nextPage();
            },
            disabled: !table.getCanNextPage(),
            children: _jsx(ChevronRightIcon, {
              className: "h-4 w-4",
              "aria-hidden": "true"
            })
          }), _jsx(Button, {
            "aria-label": "Go to last page",
            variant: "outline",
            className: "hidden h-8 w-8 p-0 lg:flex",
            onClick: function onClick() {
              return table.setPageIndex(table.getPageCount() - 1);
            },
            disabled: !table.getCanNextPage(),
            children: _jsx(DoubleArrowRightIcon, {
              className: "h-4 w-4",
              "aria-hidden": "true"
            })
          })]
        })]
      })]
    })]
  });
}