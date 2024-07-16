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
import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { persist } from 'zustand/middleware';
var defaultCols = [{
  id: 'TODO',
  title: 'Todo'
}];
export var useTaskStore = create()(persist(function (set) {
  return {
    tasks: [],
    columns: defaultCols,
    draggedTask: null,
    addTask: function addTask(title, description) {
      return set(function (state) {
        return {
          tasks: [].concat(_toConsumableArray(state.tasks), [{
            id: uuid(),
            title: title,
            description: description,
            status: 'TODO'
          }])
        };
      });
    },
    updateCol: function updateCol(id, newName) {
      return set(function (state) {
        return {
          columns: state.columns.map(function (col) {
            return col.id === id ? _objectSpread(_objectSpread({}, col), {}, {
              title: newName
            }) : col;
          })
        };
      });
    },
    addCol: function addCol(title) {
      return set(function (state) {
        return {
          columns: [].concat(_toConsumableArray(state.columns), [{
            id: uuid(),
            title: title
          }])
        };
      });
    },
    dragTask: function dragTask(id) {
      return set({
        draggedTask: id
      });
    },
    removeTask: function removeTask(id) {
      return set(function (state) {
        return {
          tasks: state.tasks.filter(function (task) {
            return task.id !== id;
          })
        };
      });
    },
    removeCol: function removeCol(id) {
      return set(function (state) {
        return {
          columns: state.columns.filter(function (col) {
            return col.id !== id;
          })
        };
      });
    },
    setTasks: function setTasks(newTasks) {
      return set({
        tasks: newTasks
      });
    },
    setCols: function setCols(newCols) {
      return set({
        columns: newCols
      });
    }
  };
}, {
  name: 'task-store',
  skipHydration: true
}));