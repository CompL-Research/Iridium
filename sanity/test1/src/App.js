import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from "@mui/material";
// import Grid from '@mui/material/Grid';
import TopBar from './components/TopBar';
import BytecodeStepper from './components/BytecodeStepper';
import SourceCode from './components/SourceCode';
import { useSelector, useDispatch } from 'react-redux'
import { setLoading, setEnded, setCurrentSyn, setConnected, setEnvState } from './reducers/MainState'
import { setBytecodeMapping, setCGState, setContextRuns, setCurrentContext, setSingleFun, setSourcecodeMapping, setStackframeMapping } from './reducers/MainData';
import Environment from './components/Environment';
import Stack from './components/Stack';
import Lattice from './components/Lattice';
import CallGraph from './components/CallGraph';
import { darkTheme, lightTheme } from './utils';

import {Responsive, WidthProvider} from 'react-grid-layout';
const ResponsiveGridLayout = WidthProvider(Responsive);

const { io } = require("socket.io-client");

const socket = io();
const ASK_VIZ_IF_SYNC_NEEDED = "viz-do-need-anything"
const DATA_FOR_VIZ = "viz-requested-data"
const VIZ_REQUESTS_THESE = "viz-requests-these"
const VIZ_PROG_COMP = "viz-end-msg"


const layout = [
  { i: "bytecodeStepper", x: 0, y: 0, w: 4, h: 4, static: true },
  { i: "environment", x: 4, y: 0, w: 4, h: 2, static: true },
  { i: "sourceCode", x: 0, y: 0, w: 4, h: 1, maxH: 4, minW: 2, maxW: 4 },
  { i: "stack", x: 8, y: 0, w: 4, h: 2 },
  { i: "lattice", x: 8, y: 0, w: 4, h: 4 },
  { i: "callgraph", x: 4, y: 0, w: 4, h: 4 },
  
  

];
const layouts = {
  lg: layout,
  md: layout,
  sm: layout,
  xs: layout,
  xxs: layout
}

export default function App() {
  const currentSyn = useSelector((state) => state.mainState.currentSyn)
  const bytecodeSync = useSelector((state) => state.mainState.bytecodeSync)
  const bytecodeMapping = useSelector((state) => state.mainData.bytecodeMapping)
  const sourcecodeMapping = useSelector((state) => state.mainData.sourcecodeMapping)
  const stackframeMapping = useSelector((state) => state.mainData.stackframeMapping)
  const dispatch = useDispatch()

  const themeMode = useSelector((state) => state.mainState.theme)
  const theme = themeMode === "dark" ? darkTheme : lightTheme;

  const currentSynRef = React.useRef();
  currentSynRef.current = currentSyn;

  React.useEffect(() => {
    function programEnded() {
      console.log("[ON]: Program Ended")
      dispatch(setLoading(false))
      dispatch(setEnded(true))
    }

    function connected() {
      console.log("[ON]: Program Connected")
      dispatch(setConnected(true))
    }

    function disconnected() {
      console.log("[ON]: Program Disconnected")
      dispatch(setConnected(false))
    }

    function dataForViz(rawData) {
      const receivedData = JSON.parse(rawData);
      console.log("[ON - DATA_FOR_VIZ]: [app #==> viz DATA]", receivedData);

      if (receivedData.code != undefined) {
        dispatch(setBytecodeMapping({...bytecodeMapping, [currentSynRef.current[0]]: receivedData.code }))
      }
  
      if (receivedData.sourcecode != undefined) {
        dispatch(setSourcecodeMapping({...sourcecodeMapping, [currentSynRef.current[0]]: receivedData.sourcecode }))
      }
  
      if (receivedData.stack != undefined) {
        if(receivedData.stack.length>1)receivedData.stack.pop();
        dispatch(setStackframeMapping({...stackframeMapping, [currentSynRef.current[0]]: receivedData.stack }))
      }
  
      if (receivedData.context_runs != undefined) {
        receivedData.context_runs.pop();
        const mergedArr = receivedData.context_runs.flatMap((ob) => [Object.keys(ob)[0],Object.values(ob)[0]]);
        const mergedMap = {}
        for(var i=0;i< mergedArr.length;i+=2){
            mergedMap[mergedArr[i]]=mergedArr[i+1];
        }
        dispatch(setContextRuns(mergedMap));
      }
      if (receivedData.context != undefined) {
        dispatch(setCurrentContext(receivedData.context));
      }
  
      if (receivedData.callgraph != undefined) {
        let len = receivedData.callgraph.length;
        if(len==4) {
          dispatch(setSingleFun(true)); 
        } else {
          dispatch(setSingleFun(false));
        }
        dispatch(setCGState(receivedData.callgraph));
  
      }
      if (receivedData.environment != undefined) {
        if(receivedData.environment.length>1)receivedData.environment.pop();
        dispatch(setEnvState(receivedData.environment))
      }
  
      dispatch(setLoading(false))
    }

    function askVizForSyn(data) {
      const synData = JSON.parse(data);
      console.log("[ON - ASK_VIZ_IF_SYNC_NEEDED]: [app #==> viz SYN-START]:", synData);
      dispatch(setCurrentSyn(synData))
      dispatch(setEnded(false))
    }

    // SOCKET CONNECT METHODS
    socket.on(VIZ_PROG_COMP,programEnded)
    socket.on("connect",connected);
    socket.on("disconnect",disconnected);
    socket.on(DATA_FOR_VIZ,dataForViz);
    socket.on(ASK_VIZ_IF_SYNC_NEEDED,askVizForSyn);

    return () => {
      socket.off(VIZ_PROG_COMP,programEnded)
      socket.off("connect",connected);
      socket.off("disconnect",disconnected);
      socket.off(DATA_FOR_VIZ,dataForViz);
      socket.off(ASK_VIZ_IF_SYNC_NEEDED,askVizForSyn);
    };
  }, []);


  React.useEffect(() => {
    if (!currentSyn) return;
    const dataRequest = []
    const synCode = currentSyn[0]
    const synCodeType = currentSyn[1]
    // bytecode
    let gettingCode = false;
    if (bytecodeMapping[synCode] == undefined) {
      // have not seen this code object before, request for it now
      gettingCode = true;
    }

    if (bytecodeSync) {
      gettingCode = true;
    }

    if (synCodeType == "NATIVE") {
      // Don't request codes for native code objects
      gettingCode = false;
    }

    if (gettingCode) {
      dataRequest.push("code")
    }

    // sourcecode
    if (sourcecodeMapping[synCode] == undefined) {
      // have not seen this source code before, request for it now
      dataRequest.push("sourcecode")
    }

    // always keeping stack in sync
    dataRequest.push("stack")
    dataRequest.push("context")
    dataRequest.push("context_runs")
    dataRequest.push("callgraph")
    dataRequest.push("environment")

    console.log(`[viz #==> app DATA-REQ]: ${dataRequest}, currentSyn: ${currentSyn}`);
    socket.emit(VIZ_REQUESTS_THESE,dataRequest);
  }, [currentSyn]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TopBar />
      <div style={{ padding: theme.spacing(2) }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        >
          <div key="bytecodeStepper" style={{ overflow: 'scroll', display: 'flex' }}>
            <BytecodeStepper socket={socket}/>
          </div>
          <div key="sourceCode" style={{ overflow: 'scroll', display: 'flex' }}>
            <SourceCode />
          </div>
          <div key="environment" style={{ overflow: 'scroll', display: 'flex' }}>
            <Environment socket={socket} />
          </div>
          <div key="stack" style={{ overflow: 'scroll', display: 'flex' }}>
            <Stack currentSyn={currentSyn} stackframeMapping={stackframeMapping} />
          </div>
          <div key="lattice" style={{ overflow: 'scroll', display: 'flex' }}>
            <Lattice />
          </div>
          <div key="callgraph" style={{ overflow: 'scroll', display: 'flex' }}>
            <CallGraph />
          </div>
        </ResponsiveGridLayout>
      </div>
    </ThemeProvider>
  );
}
