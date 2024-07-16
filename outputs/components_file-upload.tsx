'use client';

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
import { UploadDropzone } from '@uploadthing/react';
import { Trash } from 'lucide-react';
import Image from 'next/image';
import { IMG_MAX_LIMIT } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/forms/product-form.tsx";
import { Button } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/button.tsx";
import { useToast } from "/home/mee/dev/iridium/analysis/tests/next-shadcn-dashboard-starter/components/ui/use-toast.ts";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "true/jsx-runtime";
export default function FileUpload(_ref) {
  var onChange = _ref.onChange,
    onRemove = _ref.onRemove,
    value = _ref.value;
  var _useToast = useToast(),
    toast = _useToast.toast;
  var onDeleteFile = function onDeleteFile(key) {
    var files = value;
    var filteredFiles = files.filter(function (item) {
      return item.key !== key;
    });
    onRemove(filteredFiles);
  };
  var onUpdateFile = function onUpdateFile(newFiles) {
    onChange([].concat(_toConsumableArray(value), _toConsumableArray(newFiles)));
  };
  return _jsxs("div", {
    children: [_jsx("div", {
      className: "mb-4 flex items-center gap-4",
      children: !!value.length && (value === null || value === void 0 ? void 0 : value.map(function (item) {
        return _jsxs("div", {
          className: "relative h-[200px] w-[200px] overflow-hidden rounded-md",
          children: [_jsx("div", {
            className: "absolute right-2 top-2 z-10",
            children: _jsx(Button, {
              type: "button",
              onClick: function onClick() {
                return onDeleteFile(item.key);
              },
              variant: "destructive",
              size: "sm",
              children: _jsx(Trash, {
                className: "h-4 w-4"
              })
            })
          }), _jsx("div", {
            children: _jsx(Image, {
              fill: true,
              className: "object-cover",
              alt: "Image",
              src: item.fileUrl || ''
            })
          })]
        }, item.key);
      }))
    }), _jsx("div", {
      children: value.length < IMG_MAX_LIMIT && _jsx(UploadDropzone, {
        className: "ut-label:text-sm ut-allowed-content:ut-uploading:text-red-300 py-2 dark:bg-zinc-800",
        endpoint: "imageUploader",
        config: {
          mode: 'auto'
        },
        content: {
          allowedContent: function allowedContent(_ref2) {
            var isUploading = _ref2.isUploading;
            if (isUploading) return _jsx(_Fragment, {
              children: _jsx("p", {
                className: "mt-2 animate-pulse text-sm text-slate-400",
                children: "Img Uploading..."
              })
            });
          }
        },
        onClientUploadComplete: function onClientUploadComplete(res) {
          // Do something with the response
          var data = res;
          if (data) {
            onUpdateFile(data);
          }
        },
        onUploadError: function onUploadError(error) {
          toast({
            title: 'Error',
            variant: 'destructive',
            description: error.message
          });
        },
        onUploadBegin: function onUploadBegin() {
          // Do something once upload begins
        }
      })
    })]
  });
}