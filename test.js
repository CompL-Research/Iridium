import M1 from "./M1";
import M2 from "./M2";
import M3 from "./M3";
import "./sideEffect.js";
// const M1 = lazy(() => import("./M1"))
// const M2 = lazy(() => import("./M1"))

export const App = () => {
  return <M1>
    <M2/>
    <M3/>
  </M1>
}

// // function deduplicateLevels(data) {
// //   const seen = new Set();
// //   const result = {};

// //   // Iterate through levels in ascending order
// //   Object.keys(data).sort((a, b) => a - b).forEach(level => {
// //     result[level] = data[level].filter(file => {
// //       if (seen.has(file)) {
// //         return false; // Remove if already seen at a lower level
// //       } else {
// //         seen.add(file); // Mark this file as seen
// //         return true;
// //       }
// //     });
// //   });

// //   return result;
// // }

// // let levels = {2: ["/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/@types/react/index.d.ts",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/app/components/NoteCard.tsx",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/app/components/CredCard.tsx"],
  
// //   1000: ["/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Accordion.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/AccordionContext.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/AccordionCollapse.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/AccordionButton.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Anchor.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Badge.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Breadcrumb.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/BreadcrumbItem.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/@types/react/index.d.ts",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/ButtonToolbar.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/CardImg.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/CardGroup.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Carousel.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/CarouselItem.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/CloseButton.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Collapse.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Dropdown.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/DropdownButton.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Fade.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/FormControl.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/FormCheck.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/FormFloating.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/FloatingLabel.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/FormGroup.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/FormLabel.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/FormText.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/FormSelect.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Image.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Figure.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/InputGroup.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/ListGroup.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/ListGroupItem.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Modal.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/ModalBody.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/ModalDialog.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/ModalHeader.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/ModalFooter.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/ModalTitle.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/NavbarBrand.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/NavDropdown.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/NavItem.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/NavLink.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Offcanvas.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/OffcanvasHeader.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/OffcanvasTitle.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/OffcanvasBody.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Overlay.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/OverlayTrigger.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/PageItem.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Pagination.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Placeholder.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/PlaceholderButton.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Popover.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/PopoverHeader.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/PopoverBody.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/ProgressBar.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Ratio.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/SplitButton.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/SSRProvider.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Tab.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/TabContainer.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/TabContent.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Table.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/TabPane.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Tabs.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/ThemeProvider.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Toast.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/ToastBody.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/ToastHeader.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/ToastContainer.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/ToggleButton.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/ToggleButtonGroup.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Tooltip.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/classnames/index.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/@restart/ui/esm/SelectableContext.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/uncontrollable/lib/cjs/index.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/createWithBsPrefix.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/NavbarCollapse.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/NavbarToggle.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/NavbarOffcanvas.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/NavbarContext.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/@types/react/jsx-runtime.d.ts",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/@restart/ui/esm/Button.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/prop-types-extra/lib/all.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/@restart/ui/esm/Nav.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/CardHeaderContext.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/divWithClassName.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/CardHeader.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/createUtilityClasses.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/@restart/hooks/esm/useEventCallback.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/@restart/ui/esm/Anchor.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/@types/prop-types/index.d.ts",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/FormRange.js",
// //   "/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/react-bootstrap/esm/Switch.js"],
  
// //   5: ["/home/meetesh/wd/Iridium/temp/YYAPM/node_modules/@types/react/index.d.ts"],}

// // console.log(deduplicateLevels(levels))



// const seenFiles = new Set();
// const deduplicatedChunks = {};

// for (const [level, files] of Object.entries(chunks)) {
//   deduplicatedChunks[level] = files.filter(file => {
//     if (seenFiles.has(file)) return false;
//     seenFiles.add(file);
//     return true;
//   });
// }

// console.log(deduplicatedChunks);