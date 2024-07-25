# Requirements
1. nodeJS
2. graphviz


# Installation

```bash
npm i
```

# Test The Installation

```bash
./iridium help

░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░        ░░       ░░░        ░░       ░░░        ░░  ░░░░  ░░  ░░░░  ░
▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒  ▒▒   ▒▒   ▒
▓▓▓▓  ▓▓▓▓▓       ▓▓▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓  ▓▓        ▓
████  █████  ███  ██████  █████  ████  █████  █████  ████  ██  █  █  █
█        ██  ████  ██        ██       ███        ███      ███  ████  █
██████████████████████████████████████████████████████████████████████
Iridium Version: 0.1a


About

  This project provides infrastructure to allow static analysis of react based  
  applications.                                                                 
  $ ./iridium <command> [OPTIONS]                                               
  $ ./iridium help                                                              
  $ ./iridium analyze help                                                      

Command List

  help      Display help information about iridium. 
  analyze   Run static analysis over a project.     
  sanity    Run sanity tests.                       
  version   Print the version.                      

```

# Run Sanity Test

**Input**
```bash
./iridium sanity
```

**Expected Output**
```bash
meetesh@82706c77cba0:~/wd/Iridium$ ./iridium sanity
Loaded: 15 files
  ├── src_App.js: 227
  ├── src_components_BytecodeStepper.js: 636
  ├── src_components_CallGraph.js: 216
  ├── src_components_Environment.js: 191
  ├── src_components_Lattice.js: 217
  ├── src_components_Layout.jsx: 84
  ├── src_components_SourceCode.js: 24
  ├── src_components_Stack.js: 30
  ├── src_components_TopBar.js: 82
  ├── src_index.js: 15
  ├── src_reducers_MainData.js: 39
  ├── src_reducers_MainState.js: 53
  ├── src_socket.js: 1
  ├── src_store.js: 10
  ├── src_utils.js: 141
  └── LOC: 1966
Failed to import: 
  ├── react
  ├── @mui/material/styles
  ├── @mui/material
  ├── react-redux
  ├── react-grid-layout
  ├── true/jsx-runtime
  ├── socket.io-client
  ├── @mui/icons-material/Send
  ├── graphviz-react
  ├── lodash
  ├── @mui/icons-material
  ├── react-dom/client
  ├── @reduxjs/toolkit
  ├── @mui/system
  └── Total: 14
Ignored imports: 
  ├── /home/meetesh/wd/Iridium/sanity/test1/src/index.css
  └── Total: 1
```