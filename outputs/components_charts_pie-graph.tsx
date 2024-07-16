'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/card.tsx";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/chart.tsx";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
var chartData = [{
  browser: 'chrome',
  visitors: 275,
  fill: 'var(--color-chrome)'
}, {
  browser: 'safari',
  visitors: 200,
  fill: 'var(--color-safari)'
}, {
  browser: 'firefox',
  visitors: 287,
  fill: 'var(--color-firefox)'
}, {
  browser: 'edge',
  visitors: 173,
  fill: 'var(--color-edge)'
}, {
  browser: 'other',
  visitors: 190,
  fill: 'var(--color-other)'
}];
var chartConfig = {
  visitors: {
    label: 'Visitors'
  },
  chrome: {
    label: 'Chrome',
    color: 'hsl(var(--chart-1))'
  },
  safari: {
    label: 'Safari',
    color: 'hsl(var(--chart-2))'
  },
  firefox: {
    label: 'Firefox',
    color: 'hsl(var(--chart-3))'
  },
  edge: {
    label: 'Edge',
    color: 'hsl(var(--chart-4))'
  },
  other: {
    label: 'Other',
    color: 'hsl(var(--chart-5))'
  }
};
export function PieGraph() {
  var totalVisitors = React.useMemo(function () {
    return chartData.reduce(function (acc, curr) {
      return acc + curr.visitors;
    }, 0);
  }, []);
  return _jsxs(Card, {
    className: "flex flex-col",
    children: [_jsxs(CardHeader, {
      className: "items-center pb-0",
      children: [_jsx(CardTitle, {
        children: "Pie Chart - Donut with Text"
      }), _jsx(CardDescription, {
        children: "January - June 2024"
      })]
    }), _jsx(CardContent, {
      className: "flex-1 pb-0",
      children: _jsx(ChartContainer, {
        config: chartConfig,
        className: "mx-auto aspect-square max-h-[360px]",
        children: _jsxs(PieChart, {
          children: [_jsx(ChartTooltip, {
            cursor: false,
            content: _jsx(ChartTooltipContent, {
              hideLabel: true
            })
          }), _jsx(Pie, {
            data: chartData,
            dataKey: "visitors",
            nameKey: "browser",
            innerRadius: 60,
            strokeWidth: 5,
            children: _jsx(Label, {
              content: function content(_ref) {
                var viewBox = _ref.viewBox;
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return _jsxs("text", {
                    x: viewBox.cx,
                    y: viewBox.cy,
                    textAnchor: "middle",
                    dominantBaseline: "middle",
                    children: [_jsx("tspan", {
                      x: viewBox.cx,
                      y: viewBox.cy,
                      className: "fill-foreground text-3xl font-bold",
                      children: totalVisitors.toLocaleString()
                    }), _jsx("tspan", {
                      x: viewBox.cx,
                      y: (viewBox.cy || 0) + 24,
                      className: "fill-muted-foreground",
                      children: "Visitors"
                    })]
                  });
                }
              }
            })
          })]
        })
      })
    }), _jsxs(CardFooter, {
      className: "flex-col gap-2 text-sm",
      children: [_jsxs("div", {
        className: "flex items-center gap-2 font-medium leading-none",
        children: ["Trending up by 5.2% this month ", _jsx(TrendingUp, {
          className: "h-4 w-4"
        })]
      }), _jsx("div", {
        className: "leading-none text-muted-foreground",
        children: "Showing total visitors for the last 6 months"
      })]
    })]
  });
}