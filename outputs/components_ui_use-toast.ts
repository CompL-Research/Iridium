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
function _objectDestructuringEmpty(t) {
  if (null == t) throw new TypeError("Cannot destructure " + t);
}
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
}
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
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
// Inspired by react-hot-toast library
import * as React from 'react';
var TOAST_LIMIT = 1;
var TOAST_REMOVE_DELAY = 1000000;
var actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST'
};
var count = 0;
function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}
var toastTimeouts = new Map();
var addToRemoveQueue = function addToRemoveQueue(toastId) {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  var timeout = setTimeout(function () {
    toastTimeouts["delete"](toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
export var reducer = function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TOAST':
      return _objectSpread(_objectSpread({}, state), {}, {
        toasts: [action.toast].concat(_toConsumableArray(state.toasts)).slice(0, TOAST_LIMIT)
      });
    case 'UPDATE_TOAST':
      return _objectSpread(_objectSpread({}, state), {}, {
        toasts: state.toasts.map(function (t) {
          return t.id === action.toast.id ? _objectSpread(_objectSpread({}, t), action.toast) : t;
        })
      });
    case 'DISMISS_TOAST':
      {
        var toastId = action.toastId;

        // ! Side effects ! - This could be extracted into a dismissToast() action,
        // but I'll keep it here for simplicity
        if (toastId) {
          addToRemoveQueue(toastId);
        } else {
          state.toasts.forEach(function (toast) {
            addToRemoveQueue(toast.id);
          });
        }
        return _objectSpread(_objectSpread({}, state), {}, {
          toasts: state.toasts.map(function (t) {
            return t.id === toastId || toastId === undefined ? _objectSpread(_objectSpread({}, t), {}, {
              open: false
            }) : t;
          })
        });
      }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return _objectSpread(_objectSpread({}, state), {}, {
          toasts: []
        });
      }
      return _objectSpread(_objectSpread({}, state), {}, {
        toasts: state.toasts.filter(function (t) {
          return t.id !== action.toastId;
        })
      });
  }
};
var listeners = [];
var memoryState = {
  toasts: []
};
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach(function (listener) {
    listener(memoryState);
  });
}
function toast(_ref) {
  var props = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
  var id = genId();
  var update = function update(props) {
    return dispatch({
      type: 'UPDATE_TOAST',
      toast: _objectSpread(_objectSpread({}, props), {}, {
        id: id
      })
    });
  };
  var dismiss = function dismiss() {
    return dispatch({
      type: 'DISMISS_TOAST',
      toastId: id
    });
  };
  dispatch({
    type: 'ADD_TOAST',
    toast: _objectSpread(_objectSpread({}, props), {}, {
      id: id,
      open: true,
      onOpenChange: function onOpenChange(open) {
        if (!open) dismiss();
      }
    })
  });
  return {
    id: id,
    dismiss: dismiss,
    update: update
  };
}
function useToast() {
  var _React$useState = React.useState(memoryState),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    state = _React$useState2[0],
    setState = _React$useState2[1];
  React.useEffect(function () {
    listeners.push(setState);
    return function () {
      var index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return _objectSpread(_objectSpread({}, state), {}, {
    toast: toast,
    dismiss: function dismiss(toastId) {
      return dispatch({
        type: 'DISMISS_TOAST',
        toastId: toastId
      });
    }
  });
}
export { useToast, toast };