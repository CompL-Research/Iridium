import { AreaGraph } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/charts/area-graph.tsx";
import { BarGraph } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/charts/bar-graph.tsx";
import { PieGraph } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/charts/pie-graph.tsx";
import { CalendarDateRangePicker } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/date-range-picker.tsx";
import { RecentSales } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/recent-sales.tsx";
import { Button } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/card.tsx";
import { ScrollArea } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/scroll-area.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/tabs.tsx";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export default function page() {
  return _jsx(ScrollArea, {
    className: "h-full",
    children: _jsxs("div", {
      className: "flex-1 space-y-4 p-4 pt-6 md:p-8",
      children: [_jsxs("div", {
        className: "flex items-center justify-between space-y-2",
        children: [_jsx("h2", {
          className: "text-3xl font-bold tracking-tight",
          children: "Hi, Welcome back \uD83D\uDC4B"
        }), _jsxs("div", {
          className: "hidden items-center space-x-2 md:flex",
          children: [_jsx(CalendarDateRangePicker, {}), _jsx(Button, {
            children: "Download"
          })]
        })]
      }), _jsxs(Tabs, {
        defaultValue: "overview",
        className: "space-y-4",
        children: [_jsxs(TabsList, {
          children: [_jsx(TabsTrigger, {
            value: "overview",
            children: "Overview"
          }), _jsx(TabsTrigger, {
            value: "analytics",
            disabled: true,
            children: "Analytics"
          })]
        }), _jsxs(TabsContent, {
          value: "overview",
          className: "space-y-4",
          children: [_jsxs("div", {
            className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
            children: [_jsxs(Card, {
              children: [_jsxs(CardHeader, {
                className: "flex flex-row items-center justify-between space-y-0 pb-2",
                children: [_jsx(CardTitle, {
                  className: "text-sm font-medium",
                  children: "Total Revenue"
                }), _jsx("svg", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: "2",
                  className: "h-4 w-4 text-muted-foreground",
                  children: _jsx("path", {
                    d: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                  })
                })]
              }), _jsxs(CardContent, {
                children: [_jsx("div", {
                  className: "text-2xl font-bold",
                  children: "$45,231.89"
                }), _jsx("p", {
                  className: "text-xs text-muted-foreground",
                  children: "+20.1% from last month"
                })]
              })]
            }), _jsxs(Card, {
              children: [_jsxs(CardHeader, {
                className: "flex flex-row items-center justify-between space-y-0 pb-2",
                children: [_jsx(CardTitle, {
                  className: "text-sm font-medium",
                  children: "Subscriptions"
                }), _jsxs("svg", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: "2",
                  className: "h-4 w-4 text-muted-foreground",
                  children: [_jsx("path", {
                    d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                  }), _jsx("circle", {
                    cx: "9",
                    cy: "7",
                    r: "4"
                  }), _jsx("path", {
                    d: "M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                  })]
                })]
              }), _jsxs(CardContent, {
                children: [_jsx("div", {
                  className: "text-2xl font-bold",
                  children: "+2350"
                }), _jsx("p", {
                  className: "text-xs text-muted-foreground",
                  children: "+180.1% from last month"
                })]
              })]
            }), _jsxs(Card, {
              children: [_jsxs(CardHeader, {
                className: "flex flex-row items-center justify-between space-y-0 pb-2",
                children: [_jsx(CardTitle, {
                  className: "text-sm font-medium",
                  children: "Sales"
                }), _jsxs("svg", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: "2",
                  className: "h-4 w-4 text-muted-foreground",
                  children: [_jsx("rect", {
                    width: "20",
                    height: "14",
                    x: "2",
                    y: "5",
                    rx: "2"
                  }), _jsx("path", {
                    d: "M2 10h20"
                  })]
                })]
              }), _jsxs(CardContent, {
                children: [_jsx("div", {
                  className: "text-2xl font-bold",
                  children: "+12,234"
                }), _jsx("p", {
                  className: "text-xs text-muted-foreground",
                  children: "+19% from last month"
                })]
              })]
            }), _jsxs(Card, {
              children: [_jsxs(CardHeader, {
                className: "flex flex-row items-center justify-between space-y-0 pb-2",
                children: [_jsx(CardTitle, {
                  className: "text-sm font-medium",
                  children: "Active Now"
                }), _jsx("svg", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: "2",
                  className: "h-4 w-4 text-muted-foreground",
                  children: _jsx("path", {
                    d: "M22 12h-4l-3 9L9 3l-3 9H2"
                  })
                })]
              }), _jsxs(CardContent, {
                children: [_jsx("div", {
                  className: "text-2xl font-bold",
                  children: "+573"
                }), _jsx("p", {
                  className: "text-xs text-muted-foreground",
                  children: "+201 since last hour"
                })]
              })]
            })]
          }), _jsxs("div", {
            className: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7",
            children: [_jsx("div", {
              className: "col-span-4",
              children: _jsx(BarGraph, {})
            }), _jsxs(Card, {
              className: "col-span-4 md:col-span-3",
              children: [_jsxs(CardHeader, {
                children: [_jsx(CardTitle, {
                  children: "Recent Sales"
                }), _jsx(CardDescription, {
                  children: "You made 265 sales this month."
                })]
              }), _jsx(CardContent, {
                children: _jsx(RecentSales, {})
              })]
            }), _jsx("div", {
              className: "col-span-4",
              children: _jsx(AreaGraph, {})
            }), _jsx("div", {
              className: "col-span-4 md:col-span-3",
              children: _jsx(PieGraph, {})
            })]
          })]
        })]
      })]
    })
  });
}