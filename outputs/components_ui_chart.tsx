'use client';

var _excluded = ["id", "className", "children", "config"];
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
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
function _objectWithoutProperties(e, t) {
  if (null == e) return {};
  var o,
    r,
    i = _objectWithoutPropertiesLoose(e, t);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    for (r = 0; r < s.length; r++) o = s[r], t.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
  }
  return i;
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (e.includes(n)) continue;
    t[n] = r[n];
  }
  return t;
}
import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { cn } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/lib/utils.ts";

// Format: { THEME_NAME: CSS_SELECTOR }
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "true/jsx-runtime";
var THEMES = {
  light: '',
  dark: '.dark'
};
var ChartContext = /*#__PURE__*/React.createContext(null);
function useChart() {
  var context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}
var ChartContainer = /*#__PURE__*/React.forwardRef(function (_ref, ref) {
  var id = _ref.id,
    className = _ref.className,
    children = _ref.children,
    config = _ref.config,
    props = _objectWithoutProperties(_ref, _excluded);
  var uniqueId = React.useId();
  var chartId = "chart-".concat(id || uniqueId.replace(/:/g, ''));
  return _jsx(ChartContext.Provider, {
    value: {
      config: config
    },
    children: _jsxs("div", _objectSpread(_objectSpread({
      "data-chart": chartId,
      ref: ref,
      className: cn("flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line-line]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none", className)
    }, props), {}, {
      children: [_jsx(ChartStyle, {
        id: chartId,
        config: config
      }), _jsx(RechartsPrimitive.ResponsiveContainer, {
        children: children
      })]
    }))
  });
});
ChartContainer.displayName = 'Chart';
var ChartStyle = function ChartStyle(_ref2) {
  var id = _ref2.id,
    config = _ref2.config;
  var colorConfig = Object.entries(config).filter(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
      _ = _ref4[0],
      config = _ref4[1];
    return config.theme || config.color;
  });
  if (!colorConfig.length) {
    return null;
  }
  return _jsx("style", {
    dangerouslySetInnerHTML: {
      __html: Object.entries(THEMES).map(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
          theme = _ref6[0],
          prefix = _ref6[1];
        return "\n".concat(prefix, " [data-chart=").concat(id, "] {\n").concat(colorConfig.map(function (_ref7) {
          var _itemConfig$theme;
          var _ref8 = _slicedToArray(_ref7, 2),
            key = _ref8[0],
            itemConfig = _ref8[1];
          var color = ((_itemConfig$theme = itemConfig.theme) === null || _itemConfig$theme === void 0 ? void 0 : _itemConfig$theme[theme]) || itemConfig.color;
          return color ? "  --color-".concat(key, ": ").concat(color, ";") : null;
        }).join('\n'), "\n}\n");
      })
    }
  });
};
var ChartTooltip = RechartsPrimitive.Tooltip;
var ChartTooltipContent = /*#__PURE__*/React.forwardRef(function (_ref9, ref) {
  var active = _ref9.active,
    payload = _ref9.payload,
    className = _ref9.className,
    _ref9$indicator = _ref9.indicator,
    indicator = _ref9$indicator === void 0 ? 'dot' : _ref9$indicator,
    _ref9$hideLabel = _ref9.hideLabel,
    hideLabel = _ref9$hideLabel === void 0 ? false : _ref9$hideLabel,
    _ref9$hideIndicator = _ref9.hideIndicator,
    hideIndicator = _ref9$hideIndicator === void 0 ? false : _ref9$hideIndicator,
    label = _ref9.label,
    labelFormatter = _ref9.labelFormatter,
    labelClassName = _ref9.labelClassName,
    formatter = _ref9.formatter,
    color = _ref9.color,
    nameKey = _ref9.nameKey,
    labelKey = _ref9.labelKey;
  var _useChart = useChart(),
    config = _useChart.config;
  var tooltipLabel = React.useMemo(function () {
    var _config;
    if (hideLabel || !(payload !== null && payload !== void 0 && payload.length)) {
      return null;
    }
    var _payload = _slicedToArray(payload, 1),
      item = _payload[0];
    var key = "".concat(labelKey || item.dataKey || item.name || 'value');
    var itemConfig = getPayloadConfigFromPayload(config, item, key);
    var value = !labelKey && typeof label === 'string' ? ((_config = config[label]) === null || _config === void 0 ? void 0 : _config.label) || label : itemConfig === null || itemConfig === void 0 ? void 0 : itemConfig.label;
    if (labelFormatter) {
      return _jsx("div", {
        className: cn('font-medium', labelClassName),
        children: labelFormatter(value, payload)
      });
    }
    if (!value) {
      return null;
    }
    return _jsx("div", {
      className: cn('font-medium', labelClassName),
      children: value
    });
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);
  if (!active || !(payload !== null && payload !== void 0 && payload.length)) {
    return null;
  }
  var nestLabel = payload.length === 1 && indicator !== 'dot';
  return _jsxs("div", {
    ref: ref,
    className: cn('grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl', className),
    children: [!nestLabel ? tooltipLabel : null, _jsx("div", {
      className: "grid gap-1.5",
      children: payload.map(function (item, index) {
        var key = "".concat(nameKey || item.name || item.dataKey || 'value');
        var itemConfig = getPayloadConfigFromPayload(config, item, key);
        var indicatorColor = color || item.payload.fill || item.color;
        return _jsx("div", {
          className: cn('flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground', indicator === 'dot' && 'items-center'),
          children: formatter && item.value && item.name ? formatter(item.value, item.name, item, index, item.payload) : _jsxs(_Fragment, {
            children: [itemConfig !== null && itemConfig !== void 0 && itemConfig.icon ? _jsx(itemConfig.icon, {}) : !hideIndicator && _jsx("div", {
              className: cn('shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]', {
                'h-2.5 w-2.5': indicator === 'dot',
                'w-1': indicator === 'line',
                'w-0 border-[1.5px] border-dashed bg-transparent': indicator === 'dashed',
                'my-0.5': nestLabel && indicator === 'dashed'
              }),
              style: {
                '--color-bg': indicatorColor,
                '--color-border': indicatorColor
              }
            }), _jsxs("div", {
              className: cn('flex flex-1 justify-between leading-none', nestLabel ? 'items-end' : 'items-center'),
              children: [_jsxs("div", {
                className: "grid gap-1.5",
                children: [nestLabel ? tooltipLabel : null, _jsx("span", {
                  className: "text-muted-foreground",
                  children: (itemConfig === null || itemConfig === void 0 ? void 0 : itemConfig.label) || item.name
                })]
              }), item.value && _jsx("span", {
                className: "font-mono font-medium tabular-nums text-foreground",
                children: item.value.toLocaleString()
              })]
            })]
          })
        }, item.dataKey);
      })
    })]
  });
});
ChartTooltipContent.displayName = 'ChartTooltip';
var ChartLegend = RechartsPrimitive.Legend;
var ChartLegendContent = /*#__PURE__*/React.forwardRef(function (_ref10, ref) {
  var className = _ref10.className,
    _ref10$hideIcon = _ref10.hideIcon,
    hideIcon = _ref10$hideIcon === void 0 ? false : _ref10$hideIcon,
    payload = _ref10.payload,
    _ref10$verticalAlign = _ref10.verticalAlign,
    verticalAlign = _ref10$verticalAlign === void 0 ? 'bottom' : _ref10$verticalAlign,
    nameKey = _ref10.nameKey;
  var _useChart2 = useChart(),
    config = _useChart2.config;
  if (!(payload !== null && payload !== void 0 && payload.length)) {
    return null;
  }
  return _jsx("div", {
    ref: ref,
    className: cn('flex items-center justify-center gap-4', verticalAlign === 'top' ? 'pb-3' : 'pt-3', className),
    children: payload.map(function (item) {
      var key = "".concat(nameKey || item.dataKey || 'value');
      var itemConfig = getPayloadConfigFromPayload(config, item, key);
      return _jsxs("div", {
        className: cn('flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground'),
        children: [itemConfig !== null && itemConfig !== void 0 && itemConfig.icon && !hideIcon ? _jsx(itemConfig.icon, {}) : _jsx("div", {
          className: "h-2 w-2 shrink-0 rounded-[2px]",
          style: {
            backgroundColor: item.color
          }
        }), itemConfig === null || itemConfig === void 0 ? void 0 : itemConfig.label]
      }, item.value);
    })
  });
});
ChartLegendContent.displayName = 'ChartLegend';

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config, payload, key) {
  if (_typeof(payload) !== 'object' || payload === null) {
    return undefined;
  }
  var payloadPayload = 'payload' in payload && _typeof(payload.payload) === 'object' && payload.payload !== null ? payload.payload : undefined;
  var configLabelKey = key;
  if (key in payload && typeof payload[key] === 'string') {
    configLabelKey = payload[key];
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key] === 'string') {
    configLabelKey = payloadPayload[key];
  }
  return configLabelKey in config ? config[configLabelKey] : config[key];
}
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };