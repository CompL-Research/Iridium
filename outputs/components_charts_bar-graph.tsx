'use client';

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
import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/card.tsx";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/chart.tsx";
import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export var description = 'An interactive bar chart';
var chartData = [{
  date: '2024-04-01',
  desktop: 222,
  mobile: 150
}, {
  date: '2024-04-02',
  desktop: 97,
  mobile: 180
}, {
  date: '2024-04-03',
  desktop: 167,
  mobile: 120
}, {
  date: '2024-04-04',
  desktop: 242,
  mobile: 260
}, {
  date: '2024-04-05',
  desktop: 373,
  mobile: 290
}, {
  date: '2024-04-06',
  desktop: 301,
  mobile: 340
}, {
  date: '2024-04-07',
  desktop: 245,
  mobile: 180
}, {
  date: '2024-04-08',
  desktop: 409,
  mobile: 320
}, {
  date: '2024-04-09',
  desktop: 59,
  mobile: 110
}, {
  date: '2024-04-10',
  desktop: 261,
  mobile: 190
}, {
  date: '2024-04-11',
  desktop: 327,
  mobile: 350
}, {
  date: '2024-04-12',
  desktop: 292,
  mobile: 210
}, {
  date: '2024-04-13',
  desktop: 342,
  mobile: 380
}, {
  date: '2024-04-14',
  desktop: 137,
  mobile: 220
}, {
  date: '2024-04-15',
  desktop: 120,
  mobile: 170
}, {
  date: '2024-04-16',
  desktop: 138,
  mobile: 190
}, {
  date: '2024-04-17',
  desktop: 446,
  mobile: 360
}, {
  date: '2024-04-18',
  desktop: 364,
  mobile: 410
}, {
  date: '2024-04-19',
  desktop: 243,
  mobile: 180
}, {
  date: '2024-04-20',
  desktop: 89,
  mobile: 150
}, {
  date: '2024-04-21',
  desktop: 137,
  mobile: 200
}, {
  date: '2024-04-22',
  desktop: 224,
  mobile: 170
}, {
  date: '2024-04-23',
  desktop: 138,
  mobile: 230
}, {
  date: '2024-04-24',
  desktop: 387,
  mobile: 290
}, {
  date: '2024-04-25',
  desktop: 215,
  mobile: 250
}, {
  date: '2024-04-26',
  desktop: 75,
  mobile: 130
}, {
  date: '2024-04-27',
  desktop: 383,
  mobile: 420
}, {
  date: '2024-04-28',
  desktop: 122,
  mobile: 180
}, {
  date: '2024-04-29',
  desktop: 315,
  mobile: 240
}, {
  date: '2024-04-30',
  desktop: 454,
  mobile: 380
}, {
  date: '2024-05-01',
  desktop: 165,
  mobile: 220
}, {
  date: '2024-05-02',
  desktop: 293,
  mobile: 310
}, {
  date: '2024-05-03',
  desktop: 247,
  mobile: 190
}, {
  date: '2024-05-04',
  desktop: 385,
  mobile: 420
}, {
  date: '2024-05-05',
  desktop: 481,
  mobile: 390
}, {
  date: '2024-05-06',
  desktop: 498,
  mobile: 520
}, {
  date: '2024-05-07',
  desktop: 388,
  mobile: 300
}, {
  date: '2024-05-08',
  desktop: 149,
  mobile: 210
}, {
  date: '2024-05-09',
  desktop: 227,
  mobile: 180
}, {
  date: '2024-05-10',
  desktop: 293,
  mobile: 330
}, {
  date: '2024-05-11',
  desktop: 335,
  mobile: 270
}, {
  date: '2024-05-12',
  desktop: 197,
  mobile: 240
}, {
  date: '2024-05-13',
  desktop: 197,
  mobile: 160
}, {
  date: '2024-05-14',
  desktop: 448,
  mobile: 490
}, {
  date: '2024-05-15',
  desktop: 473,
  mobile: 380
}, {
  date: '2024-05-16',
  desktop: 338,
  mobile: 400
}, {
  date: '2024-05-17',
  desktop: 499,
  mobile: 420
}, {
  date: '2024-05-18',
  desktop: 315,
  mobile: 350
}, {
  date: '2024-05-19',
  desktop: 235,
  mobile: 180
}, {
  date: '2024-05-20',
  desktop: 177,
  mobile: 230
}, {
  date: '2024-05-21',
  desktop: 82,
  mobile: 140
}, {
  date: '2024-05-22',
  desktop: 81,
  mobile: 120
}, {
  date: '2024-05-23',
  desktop: 252,
  mobile: 290
}, {
  date: '2024-05-24',
  desktop: 294,
  mobile: 220
}, {
  date: '2024-05-25',
  desktop: 201,
  mobile: 250
}, {
  date: '2024-05-26',
  desktop: 213,
  mobile: 170
}, {
  date: '2024-05-27',
  desktop: 420,
  mobile: 460
}, {
  date: '2024-05-28',
  desktop: 233,
  mobile: 190
}, {
  date: '2024-05-29',
  desktop: 78,
  mobile: 130
}, {
  date: '2024-05-30',
  desktop: 340,
  mobile: 280
}, {
  date: '2024-05-31',
  desktop: 178,
  mobile: 230
}, {
  date: '2024-06-01',
  desktop: 178,
  mobile: 200
}, {
  date: '2024-06-02',
  desktop: 470,
  mobile: 410
}, {
  date: '2024-06-03',
  desktop: 103,
  mobile: 160
}, {
  date: '2024-06-04',
  desktop: 439,
  mobile: 380
}, {
  date: '2024-06-05',
  desktop: 88,
  mobile: 140
}, {
  date: '2024-06-06',
  desktop: 294,
  mobile: 250
}, {
  date: '2024-06-07',
  desktop: 323,
  mobile: 370
}, {
  date: '2024-06-08',
  desktop: 385,
  mobile: 320
}, {
  date: '2024-06-09',
  desktop: 438,
  mobile: 480
}, {
  date: '2024-06-10',
  desktop: 155,
  mobile: 200
}, {
  date: '2024-06-11',
  desktop: 92,
  mobile: 150
}, {
  date: '2024-06-12',
  desktop: 492,
  mobile: 420
}, {
  date: '2024-06-13',
  desktop: 81,
  mobile: 130
}, {
  date: '2024-06-14',
  desktop: 426,
  mobile: 380
}, {
  date: '2024-06-15',
  desktop: 307,
  mobile: 350
}, {
  date: '2024-06-16',
  desktop: 371,
  mobile: 310
}, {
  date: '2024-06-17',
  desktop: 475,
  mobile: 520
}, {
  date: '2024-06-18',
  desktop: 107,
  mobile: 170
}, {
  date: '2024-06-19',
  desktop: 341,
  mobile: 290
}, {
  date: '2024-06-20',
  desktop: 408,
  mobile: 450
}, {
  date: '2024-06-21',
  desktop: 169,
  mobile: 210
}, {
  date: '2024-06-22',
  desktop: 317,
  mobile: 270
}, {
  date: '2024-06-23',
  desktop: 480,
  mobile: 530
}, {
  date: '2024-06-24',
  desktop: 132,
  mobile: 180
}, {
  date: '2024-06-25',
  desktop: 141,
  mobile: 190
}, {
  date: '2024-06-26',
  desktop: 434,
  mobile: 380
}, {
  date: '2024-06-27',
  desktop: 448,
  mobile: 490
}, {
  date: '2024-06-28',
  desktop: 149,
  mobile: 200
}, {
  date: '2024-06-29',
  desktop: 103,
  mobile: 160
}, {
  date: '2024-06-30',
  desktop: 446,
  mobile: 400
}];
var chartConfig = {
  views: {
    label: 'Page Views'
  },
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))'
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))'
  }
};
export function BarGraph() {
  var _React$useState = React.useState('desktop'),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    activeChart = _React$useState2[0],
    setActiveChart = _React$useState2[1];
  var total = React.useMemo(function () {
    return {
      desktop: chartData.reduce(function (acc, curr) {
        return acc + curr.desktop;
      }, 0),
      mobile: chartData.reduce(function (acc, curr) {
        return acc + curr.mobile;
      }, 0)
    };
  }, []);
  return _jsxs(Card, {
    children: [_jsxs(CardHeader, {
      className: "flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row",
      children: [_jsxs("div", {
        className: "flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6",
        children: [_jsx(CardTitle, {
          children: "Bar Chart - Interactive"
        }), _jsx(CardDescription, {
          children: "Showing total visitors for the last 3 months"
        })]
      }), _jsx("div", {
        className: "flex",
        children: ['desktop', 'mobile'].map(function (key) {
          var chart = key;
          return _jsxs("button", {
            "data-active": activeChart === chart,
            className: "relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6",
            onClick: function onClick() {
              return setActiveChart(chart);
            },
            children: [_jsx("span", {
              className: "text-xs text-muted-foreground",
              children: chartConfig[chart].label
            }), _jsx("span", {
              className: "text-lg font-bold leading-none sm:text-3xl",
              children: total[key].toLocaleString()
            })]
          }, chart);
        })
      })]
    }), _jsx(CardContent, {
      className: "px-2 sm:p-6",
      children: _jsx(ChartContainer, {
        config: chartConfig,
        className: "aspect-auto h-[280px] w-full",
        children: _jsxs(BarChart, {
          accessibilityLayer: true,
          data: chartData,
          margin: {
            left: 12,
            right: 12
          },
          children: [_jsx(CartesianGrid, {
            vertical: false
          }), _jsx(XAxis, {
            dataKey: "date",
            tickLine: false,
            axisLine: false,
            tickMargin: 8,
            minTickGap: 32,
            tickFormatter: function tickFormatter(value) {
              var date = new Date(value);
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });
            }
          }), _jsx(ChartTooltip, {
            content: _jsx(ChartTooltipContent, {
              className: "w-[150px]",
              nameKey: "views",
              labelFormatter: function labelFormatter(value) {
                return new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
              }
            })
          }), _jsx(Bar, {
            dataKey: activeChart,
            fill: "var(--color-".concat(activeChart, ")")
          })]
        })
      })
    })]
  });
}