import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn() {
  for (var _len = arguments.length, inputs = new Array(_len), _key = 0; _key < _len; _key++) {
    inputs[_key] = arguments[_key];
  }
  return twMerge(clsx(inputs));
}
export function hasDraggableData(entry) {
  if (!entry) {
    return false;
  }
  var data = entry.data.current;
  if ((data === null || data === void 0 ? void 0 : data.type) === 'Column' || (data === null || data === void 0 ? void 0 : data.type) === 'Task') {
    return true;
  }
  return false;
}