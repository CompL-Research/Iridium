import { create } from 'zustand';
export var useSidebar = create(function (set) {
  return {
    isMinimized: false,
    toggle: function toggle() {
      return set(function (state) {
        return {
          isMinimized: !state.isMinimized
        };
      });
    }
  };
});