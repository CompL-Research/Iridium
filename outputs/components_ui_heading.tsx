import { jsx as _jsx, jsxs as _jsxs } from "true/jsx-runtime";
export var Heading = function Heading(_ref) {
  var title = _ref.title,
    description = _ref.description;
  return _jsxs("div", {
    children: [_jsx("h2", {
      className: "text-3xl font-bold tracking-tight",
      children: title
    }), _jsx("p", {
      className: "text-sm text-muted-foreground",
      children: description
    })]
  });
};