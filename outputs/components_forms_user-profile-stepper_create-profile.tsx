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
function _regeneratorRuntime() {
  "use strict";

  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
  _regeneratorRuntime = function _regeneratorRuntime() {
    return e;
  };
  var t,
    e = {},
    r = Object.prototype,
    n = r.hasOwnProperty,
    o = Object.defineProperty || function (t, e, r) {
      t[e] = r.value;
    },
    i = "function" == typeof Symbol ? Symbol : {},
    a = i.iterator || "@@iterator",
    c = i.asyncIterator || "@@asyncIterator",
    u = i.toStringTag || "@@toStringTag";
  function define(t, e, r) {
    return Object.defineProperty(t, e, {
      value: r,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), t[e];
  }
  try {
    define({}, "");
  } catch (t) {
    define = function define(t, e, r) {
      return t[e] = r;
    };
  }
  function wrap(t, e, r, n) {
    var i = e && e.prototype instanceof Generator ? e : Generator,
      a = Object.create(i.prototype),
      c = new Context(n || []);
    return o(a, "_invoke", {
      value: makeInvokeMethod(t, r, c)
    }), a;
  }
  function tryCatch(t, e, r) {
    try {
      return {
        type: "normal",
        arg: t.call(e, r)
      };
    } catch (t) {
      return {
        type: "throw",
        arg: t
      };
    }
  }
  e.wrap = wrap;
  var h = "suspendedStart",
    l = "suspendedYield",
    f = "executing",
    s = "completed",
    y = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var p = {};
  define(p, a, function () {
    return this;
  });
  var d = Object.getPrototypeOf,
    v = d && d(d(values([])));
  v && v !== r && n.call(v, a) && (p = v);
  var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
  function defineIteratorMethods(t) {
    ["next", "throw", "return"].forEach(function (e) {
      define(t, e, function (t) {
        return this._invoke(e, t);
      });
    });
  }
  function AsyncIterator(t, e) {
    function invoke(r, o, i, a) {
      var c = tryCatch(t[r], t, o);
      if ("throw" !== c.type) {
        var u = c.arg,
          h = u.value;
        return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) {
          invoke("next", t, i, a);
        }, function (t) {
          invoke("throw", t, i, a);
        }) : e.resolve(h).then(function (t) {
          u.value = t, i(u);
        }, function (t) {
          return invoke("throw", t, i, a);
        });
      }
      a(c.arg);
    }
    var r;
    o(this, "_invoke", {
      value: function value(t, n) {
        function callInvokeWithMethodAndArg() {
          return new e(function (e, r) {
            invoke(t, n, e, r);
          });
        }
        return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(e, r, n) {
    var o = h;
    return function (i, a) {
      if (o === f) throw Error("Generator is already running");
      if (o === s) {
        if ("throw" === i) throw a;
        return {
          value: t,
          done: !0
        };
      }
      for (n.method = i, n.arg = a;;) {
        var c = n.delegate;
        if (c) {
          var u = maybeInvokeDelegate(c, n);
          if (u) {
            if (u === y) continue;
            return u;
          }
        }
        if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
          if (o === h) throw o = s, n.arg;
          n.dispatchException(n.arg);
        } else "return" === n.method && n.abrupt("return", n.arg);
        o = f;
        var p = tryCatch(e, r, n);
        if ("normal" === p.type) {
          if (o = n.done ? s : l, p.arg === y) continue;
          return {
            value: p.arg,
            done: n.done
          };
        }
        "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg);
      }
    };
  }
  function maybeInvokeDelegate(e, r) {
    var n = r.method,
      o = e.iterator[n];
    if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y;
    var i = tryCatch(o, e.iterator, r.arg);
    if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y;
    var a = i.arg;
    return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y);
  }
  function pushTryEntry(t) {
    var e = {
      tryLoc: t[0]
    };
    1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e);
  }
  function resetTryEntry(t) {
    var e = t.completion || {};
    e.type = "normal", delete e.arg, t.completion = e;
  }
  function Context(t) {
    this.tryEntries = [{
      tryLoc: "root"
    }], t.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(e) {
    if (e || "" === e) {
      var r = e[a];
      if (r) return r.call(e);
      if ("function" == typeof e.next) return e;
      if (!isNaN(e.length)) {
        var o = -1,
          i = function next() {
            for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next;
            return next.value = t, next.done = !0, next;
          };
        return i.next = i;
      }
    }
    throw new TypeError(_typeof(e) + " is not iterable");
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), o(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) {
    var e = "function" == typeof t && t.constructor;
    return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name));
  }, e.mark = function (t) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t;
  }, e.awrap = function (t) {
    return {
      __await: t
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () {
    return this;
  }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) {
    void 0 === i && (i = Promise);
    var a = new AsyncIterator(wrap(t, r, n, o), i);
    return e.isGeneratorFunction(r) ? a : a.next().then(function (t) {
      return t.done ? t.value : a.next();
    });
  }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () {
    return this;
  }), define(g, "toString", function () {
    return "[object Generator]";
  }), e.keys = function (t) {
    var e = Object(t),
      r = [];
    for (var n in e) r.push(n);
    return r.reverse(), function next() {
      for (; r.length;) {
        var t = r.pop();
        if (t in e) return next.value = t, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, e.values = values, Context.prototype = {
    constructor: Context,
    reset: function reset(e) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t);
    },
    stop: function stop() {
      this.done = !0;
      var t = this.tryEntries[0].completion;
      if ("throw" === t.type) throw t.arg;
      return this.rval;
    },
    dispatchException: function dispatchException(e) {
      if (this.done) throw e;
      var r = this;
      function handle(n, o) {
        return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o;
      }
      for (var o = this.tryEntries.length - 1; o >= 0; --o) {
        var i = this.tryEntries[o],
          a = i.completion;
        if ("root" === i.tryLoc) return handle("end");
        if (i.tryLoc <= this.prev) {
          var c = n.call(i, "catchLoc"),
            u = n.call(i, "finallyLoc");
          if (c && u) {
            if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
          } else if (c) {
            if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
          } else {
            if (!u) throw Error("try statement without catch or finally");
            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
          }
        }
      }
    },
    abrupt: function abrupt(t, e) {
      for (var r = this.tryEntries.length - 1; r >= 0; --r) {
        var o = this.tryEntries[r];
        if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
          var i = o;
          break;
        }
      }
      i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null);
      var a = i ? i.completion : {};
      return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a);
    },
    complete: function complete(t, e) {
      if ("throw" === t.type) throw t.arg;
      return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y;
    },
    finish: function finish(t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y;
      }
    },
    "catch": function _catch(t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.tryLoc === t) {
          var n = r.completion;
          if ("throw" === n.type) {
            var o = n.arg;
            resetTryEntry(r);
          }
          return o;
        }
      }
      throw Error("illegal catch attempt");
    },
    delegateYield: function delegateYield(e, r, n) {
      return this.delegate = {
        iterator: values(e),
        resultName: r,
        nextLoc: n
      }, "next" === this.method && (this.arg = t), y;
    }
  }, e;
}
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/accordion.tsx";
import { Button } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/form.tsx";
import { Heading } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/heading.tsx";
import { Input } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/select.tsx";
import { Separator } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/separator.tsx";
import { profileSchema } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/lib/form-schema.ts";
import { cn } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/lib/utils.ts";
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangleIcon, Trash, Trash2Icon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "true/jsx-runtime";
export var CreateProfileOne = function CreateProfileOne(_ref) {
  var initialData = _ref.initialData,
    categories = _ref.categories;
  var params = useParams();
  var router = useRouter();
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    open = _useState2[0],
    setOpen = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    loading = _useState4[0],
    setLoading = _useState4[1];
  var _useState5 = useState(false),
    _useState6 = _slicedToArray(_useState5, 2),
    imgLoading = _useState6[0],
    setImgLoading = _useState6[1];
  var title = initialData ? 'Edit product' : 'Create Your Profile';
  var description = initialData ? 'Edit a product.' : 'To create your resume, we first need some basic information about you.';
  var toastMessage = initialData ? 'Product updated.' : 'Product created.';
  var action = initialData ? 'Save changes' : 'Create';
  var _useState7 = useState(0),
    _useState8 = _slicedToArray(_useState7, 2),
    previousStep = _useState8[0],
    setPreviousStep = _useState8[1];
  var _useState9 = useState(0),
    _useState10 = _slicedToArray(_useState9, 2),
    currentStep = _useState10[0],
    setCurrentStep = _useState10[1];
  var _useState11 = useState({}),
    _useState12 = _slicedToArray(_useState11, 2),
    data = _useState12[0],
    setData = _useState12[1];
  var delta = currentStep - previousStep;
  var defaultValues = {
    jobs: [{
      jobtitle: '',
      employer: '',
      startdate: '',
      enddate: '',
      jobcountry: '',
      jobcity: ''
    }]
  };
  var form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultValues,
    mode: 'onChange'
  });
  var control = form.control,
    errors = form.formState.errors;
  var _useFieldArray = useFieldArray({
      control: control,
      name: 'jobs'
    }),
    append = _useFieldArray.append,
    remove = _useFieldArray.remove,
    fields = _useFieldArray.fields;
  var onSubmit = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(data) {
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            try {
              setLoading(true);
              if (initialData) {
                // await axios.post(`/api/products/edit-product/${initialData._id}`, data);
              } else {
                // const res = await axios.post(`/api/products/create-product`, data);
                // console.log("product", res);
              }
              router.refresh();
              router.push("/dashboard/products");
            } catch (error) {} finally {
              setLoading(false);
            }
          case 1:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function onSubmit(_x) {
      return _ref2.apply(this, arguments);
    };
  }();
  var onDelete = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            try {
              setLoading(true);
              //   await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
              router.refresh();
              router.push("/".concat(params.storeId, "/products"));
            } catch (error) {} finally {
              setLoading(false);
              setOpen(false);
            }
          case 1:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return function onDelete() {
      return _ref3.apply(this, arguments);
    };
  }();
  var processForm = function processForm(data) {
    console.log('data ==>', data);
    setData(data);
    // api call and reset
    // form.reset();
  };
  var steps = [{
    id: 'Step 1',
    name: 'Personal Information',
    fields: ['firstname', 'lastname', 'email', 'contactno', 'country', 'city']
  }, {
    id: 'Step 2',
    name: 'Professional Informations',
    // fields are mapping and flattening for the error to be trigger  for the dynamic fields
    fields: fields === null || fields === void 0 ? void 0 : fields.map(function (_, index) {
      return ["jobs.".concat(index, ".jobtitle"), "jobs.".concat(index, ".employer"), "jobs.".concat(index, ".startdate"), "jobs.".concat(index, ".enddate"), "jobs.".concat(index, ".jobcountry"), "jobs.".concat(index, ".jobcity") // Add other field names as needed
      ];
    }).flat()
  }, {
    id: 'Step 3',
    name: 'Complete'
  }];
  var next = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
      var fields, output;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            fields = steps[currentStep].fields;
            _context3.next = 3;
            return form.trigger(fields, {
              shouldFocus: true
            });
          case 3:
            output = _context3.sent;
            if (output) {
              _context3.next = 6;
              break;
            }
            return _context3.abrupt("return");
          case 6:
            if (!(currentStep < steps.length - 1)) {
              _context3.next = 12;
              break;
            }
            if (!(currentStep === steps.length - 2)) {
              _context3.next = 10;
              break;
            }
            _context3.next = 10;
            return form.handleSubmit(processForm)();
          case 10:
            setPreviousStep(currentStep);
            setCurrentStep(function (step) {
              return step + 1;
            });
          case 12:
          case "end":
            return _context3.stop();
        }
      }, _callee3);
    }));
    return function next() {
      return _ref4.apply(this, arguments);
    };
  }();
  var prev = function prev() {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep(function (step) {
        return step - 1;
      });
    }
  };
  var countries = [{
    id: 'wow',
    name: 'india'
  }];
  var cities = [{
    id: '2',
    name: 'kerala'
  }];
  return _jsxs(_Fragment, {
    children: [_jsxs("div", {
      className: "flex items-center justify-between",
      children: [_jsx(Heading, {
        title: title,
        description: description
      }), initialData && _jsx(Button, {
        disabled: loading,
        variant: "destructive",
        size: "sm",
        onClick: function onClick() {
          return setOpen(true);
        },
        children: _jsx(Trash, {
          className: "h-4 w-4"
        })
      })]
    }), _jsx(Separator, {}), _jsx("div", {
      children: _jsx("ul", {
        className: "flex gap-4",
        children: steps.map(function (step, index) {
          return _jsx("li", {
            className: "md:flex-1",
            children: currentStep > index ? _jsxs("div", {
              className: "group flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
              children: [_jsx("span", {
                className: "text-sm font-medium text-sky-600 transition-colors ",
                children: step.id
              }), _jsx("span", {
                className: "text-sm font-medium",
                children: step.name
              })]
            }) : currentStep === index ? _jsxs("div", {
              className: "flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
              "aria-current": "step",
              children: [_jsx("span", {
                className: "text-sm font-medium text-sky-600",
                children: step.id
              }), _jsx("span", {
                className: "text-sm font-medium",
                children: step.name
              })]
            }) : _jsxs("div", {
              className: "group flex h-full w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
              children: [_jsx("span", {
                className: "text-sm font-medium text-gray-500 transition-colors",
                children: step.id
              }), _jsx("span", {
                className: "text-sm font-medium",
                children: step.name
              })]
            })
          }, step.name);
        })
      })
    }), _jsx(Separator, {}), _jsx(Form, _objectSpread(_objectSpread({}, form), {}, {
      children: _jsx("form", {
        onSubmit: form.handleSubmit(processForm),
        className: "w-full space-y-8",
        children: _jsxs("div", {
          className: cn(currentStep === 1 ? 'w-full md:inline-block' : 'gap-8 md:grid md:grid-cols-3'),
          children: [currentStep === 0 && _jsxs(_Fragment, {
            children: [_jsx(FormField, {
              control: form.control,
              name: "firstname",
              render: function render(_ref5) {
                var field = _ref5.field;
                return _jsxs(FormItem, {
                  children: [_jsx(FormLabel, {
                    children: "First Name"
                  }), _jsx(FormControl, {
                    children: _jsx(Input, _objectSpread({
                      disabled: loading,
                      placeholder: "John"
                    }, field))
                  }), _jsx(FormMessage, {})]
                });
              }
            }), _jsx(FormField, {
              control: form.control,
              name: "lastname",
              render: function render(_ref6) {
                var field = _ref6.field;
                return _jsxs(FormItem, {
                  children: [_jsx(FormLabel, {
                    children: "Last Name"
                  }), _jsx(FormControl, {
                    children: _jsx(Input, _objectSpread({
                      disabled: loading,
                      placeholder: "Doe"
                    }, field))
                  }), _jsx(FormMessage, {})]
                });
              }
            }), _jsx(FormField, {
              control: form.control,
              name: "email",
              render: function render(_ref7) {
                var field = _ref7.field;
                return _jsxs(FormItem, {
                  children: [_jsx(FormLabel, {
                    children: "Email"
                  }), _jsx(FormControl, {
                    children: _jsx(Input, _objectSpread({
                      disabled: loading,
                      placeholder: "johndoe@gmail.com"
                    }, field))
                  }), _jsx(FormMessage, {})]
                });
              }
            }), _jsx(FormField, {
              control: form.control,
              name: "contactno",
              render: function render(_ref8) {
                var field = _ref8.field;
                return _jsxs(FormItem, {
                  children: [_jsx(FormLabel, {
                    children: "Contact Number"
                  }), _jsx(FormControl, {
                    children: _jsx(Input, _objectSpread({
                      type: "number",
                      placeholder: "Enter you contact number",
                      disabled: loading
                    }, field))
                  }), _jsx(FormMessage, {})]
                });
              }
            }), _jsx(FormField, {
              control: form.control,
              name: "country",
              render: function render(_ref9) {
                var field = _ref9.field;
                return _jsxs(FormItem, {
                  children: [_jsx(FormLabel, {
                    children: "Country"
                  }), _jsxs(Select, {
                    disabled: loading,
                    onValueChange: field.onChange,
                    value: field.value,
                    defaultValue: field.value,
                    children: [_jsx(FormControl, {
                      children: _jsx(SelectTrigger, {
                        children: _jsx(SelectValue, {
                          defaultValue: field.value,
                          placeholder: "Select a country"
                        })
                      })
                    }), _jsx(SelectContent, {
                      children: countries.map(function (country) {
                        return _jsx(SelectItem, {
                          value: country.id,
                          children: country.name
                        }, country.id);
                      })
                    })]
                  }), _jsx(FormMessage, {})]
                });
              }
            }), _jsx(FormField, {
              control: form.control,
              name: "city",
              render: function render(_ref10) {
                var field = _ref10.field;
                return _jsxs(FormItem, {
                  children: [_jsx(FormLabel, {
                    children: "City"
                  }), _jsxs(Select, {
                    disabled: loading,
                    onValueChange: field.onChange,
                    value: field.value,
                    defaultValue: field.value,
                    children: [_jsx(FormControl, {
                      children: _jsx(SelectTrigger, {
                        children: _jsx(SelectValue, {
                          defaultValue: field.value,
                          placeholder: "Select a city"
                        })
                      })
                    }), _jsx(SelectContent, {
                      children: cities.map(function (city) {
                        return _jsx(SelectItem, {
                          value: city.id,
                          children: city.name
                        }, city.id);
                      })
                    })]
                  }), _jsx(FormMessage, {})]
                });
              }
            })]
          }), currentStep === 1 && _jsxs(_Fragment, {
            children: [fields === null || fields === void 0 ? void 0 : fields.map(function (field, index) {
              var _errors$jobs, _errors$jobs2;
              return _jsx(Accordion, {
                type: "single",
                collapsible: true,
                defaultValue: "item-1",
                children: _jsxs(AccordionItem, {
                  value: "item-1",
                  children: [_jsxs(AccordionTrigger, {
                    className: cn('relative !no-underline [&[data-state=closed]>button]:hidden [&[data-state=open]>.alert]:hidden', (errors === null || errors === void 0 || (_errors$jobs = errors.jobs) === null || _errors$jobs === void 0 ? void 0 : _errors$jobs[index]) && 'text-red-700'),
                    children: ["Work Experience ".concat(index + 1), _jsx(Button, {
                      variant: "outline",
                      size: "icon",
                      className: "absolute right-8",
                      onClick: function onClick() {
                        return remove(index);
                      },
                      children: _jsx(Trash2Icon, {
                        className: "h-4 w-4 "
                      })
                    }), (errors === null || errors === void 0 || (_errors$jobs2 = errors.jobs) === null || _errors$jobs2 === void 0 ? void 0 : _errors$jobs2[index]) && _jsx("span", {
                      className: "alert absolute right-8",
                      children: _jsx(AlertTriangleIcon, {
                        className: "h-4 w-4   text-red-700"
                      })
                    })]
                  }), _jsx(AccordionContent, {
                    children: _jsxs("div", {
                      className: cn('relative mb-4 gap-8 rounded-md border p-4 md:grid md:grid-cols-3'),
                      children: [_jsx(FormField, {
                        control: form.control,
                        name: "jobs.".concat(index, ".jobtitle"),
                        render: function render(_ref11) {
                          var field = _ref11.field;
                          return _jsxs(FormItem, {
                            children: [_jsx(FormLabel, {
                              children: "Job title"
                            }), _jsx(FormControl, {
                              children: _jsx(Input, _objectSpread({
                                type: "text",
                                disabled: loading
                              }, field))
                            }), _jsx(FormMessage, {})]
                          });
                        }
                      }), _jsx(FormField, {
                        control: form.control,
                        name: "jobs.".concat(index, ".employer"),
                        render: function render(_ref12) {
                          var field = _ref12.field;
                          return _jsxs(FormItem, {
                            children: [_jsx(FormLabel, {
                              children: "Employer"
                            }), _jsx(FormControl, {
                              children: _jsx(Input, _objectSpread({
                                type: "text",
                                disabled: loading
                              }, field))
                            }), _jsx(FormMessage, {})]
                          });
                        }
                      }), _jsx(FormField, {
                        control: form.control,
                        name: "jobs.".concat(index, ".startdate"),
                        render: function render(_ref13) {
                          var field = _ref13.field;
                          return _jsxs(FormItem, {
                            children: [_jsx(FormLabel, {
                              children: "Start date"
                            }), _jsx(FormControl, {
                              children: _jsx(Input, _objectSpread({
                                type: "date",
                                disabled: loading
                              }, field))
                            }), _jsx(FormMessage, {})]
                          });
                        }
                      }), _jsx(FormField, {
                        control: form.control,
                        name: "jobs.".concat(index, ".enddate"),
                        render: function render(_ref14) {
                          var field = _ref14.field;
                          return _jsxs(FormItem, {
                            children: [_jsx(FormLabel, {
                              children: "End date"
                            }), _jsx(FormControl, {
                              children: _jsx(Input, _objectSpread({
                                type: "date",
                                disabled: loading
                              }, field))
                            }), _jsx(FormMessage, {})]
                          });
                        }
                      }), _jsx(FormField, {
                        control: form.control,
                        name: "jobs.".concat(index, ".jobcountry"),
                        render: function render(_ref15) {
                          var field = _ref15.field;
                          return _jsxs(FormItem, {
                            children: [_jsx(FormLabel, {
                              children: "Job country"
                            }), _jsxs(Select, {
                              disabled: loading,
                              onValueChange: field.onChange,
                              value: field.value,
                              defaultValue: field.value,
                              children: [_jsx(FormControl, {
                                children: _jsx(SelectTrigger, {
                                  children: _jsx(SelectValue, {
                                    defaultValue: field.value,
                                    placeholder: "Select your job country"
                                  })
                                })
                              }), _jsx(SelectContent, {
                                children: countries.map(function (country) {
                                  return _jsx(SelectItem, {
                                    value: country.id,
                                    children: country.name
                                  }, country.id);
                                })
                              })]
                            }), _jsx(FormMessage, {})]
                          });
                        }
                      }), _jsx(FormField, {
                        control: form.control,
                        name: "jobs.".concat(index, ".jobcity"),
                        render: function render(_ref16) {
                          var field = _ref16.field;
                          return _jsxs(FormItem, {
                            children: [_jsx(FormLabel, {
                              children: "Job city"
                            }), _jsxs(Select, {
                              disabled: loading,
                              onValueChange: field.onChange,
                              value: field.value,
                              defaultValue: field.value,
                              children: [_jsx(FormControl, {
                                children: _jsx(SelectTrigger, {
                                  children: _jsx(SelectValue, {
                                    defaultValue: field.value,
                                    placeholder: "Select your job city"
                                  })
                                })
                              }), _jsx(SelectContent, {
                                children: cities.map(function (city) {
                                  return _jsx(SelectItem, {
                                    value: city.id,
                                    children: city.name
                                  }, city.id);
                                })
                              })]
                            }), _jsx(FormMessage, {})]
                          });
                        }
                      })]
                    })
                  })]
                })
              }, field.id);
            }), _jsx("div", {
              className: "mt-4 flex justify-center",
              children: _jsx(Button, {
                type: "button",
                className: "flex justify-center",
                size: 'lg',
                onClick: function onClick() {
                  return append({
                    jobtitle: '',
                    employer: '',
                    startdate: '',
                    enddate: '',
                    jobcountry: '',
                    jobcity: ''
                  });
                },
                children: "Add More"
              })
            })]
          }), currentStep === 2 && _jsxs("div", {
            children: [_jsx("h1", {
              children: "Completed"
            }), _jsx("pre", {
              className: "whitespace-pre-wrap",
              children: JSON.stringify(data)
            })]
          })]
        })
      })
    })), _jsx("div", {
      className: "mt-8 pt-5",
      children: _jsxs("div", {
        className: "flex justify-between",
        children: [_jsx("button", {
          type: "button",
          onClick: prev,
          disabled: currentStep === 0,
          className: "rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50",
          children: _jsx("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            fill: "none",
            viewBox: "0 0 24 24",
            strokeWidth: "1.5",
            stroke: "currentColor",
            className: "h-6 w-6",
            children: _jsx("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              d: "M15.75 19.5L8.25 12l7.5-7.5"
            })
          })
        }), _jsx("button", {
          type: "button",
          onClick: next,
          disabled: currentStep === steps.length - 1,
          className: "rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50",
          children: _jsx("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            fill: "none",
            viewBox: "0 0 24 24",
            strokeWidth: "1.5",
            stroke: "currentColor",
            className: "h-6 w-6",
            children: _jsx("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              d: "M8.25 4.5l7.5 7.5-7.5 7.5"
            })
          })
        })]
      })
    })]
  });
};