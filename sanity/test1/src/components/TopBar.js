import { AppBar, Box, CircularProgress, IconButton, Toolbar, Typography } from "@mui/material";
import { DarkModeOutlined, LightModeOutlined, RestartAltOutlined } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";

import { Alert } from "@mui/material";
import { setCurrentSyn, setEnded, toggleTheme } from "../reducers/MainState";

const ProgramState = ({ended, currentSyn}) => {
  let message="";
  let severity="";
  if(ended) {
    message="Program has ended";
    severity="warning";
  } else if(currentSyn) {
    message= "Program is Running";
    severity="info";
  } else {
    message="Please start the program";
    severity="warning";
  }
  return <Alert severity={severity}>
    {message}
  </Alert>
}

export default function() {
  // redux
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.mainState.loading)
  const ended = useSelector((state) => state.mainState.ended)
  const currentSyn = useSelector((state) => state.mainState.currentSyn)
  const theme = useSelector((state) => state.mainState.theme)

  const restart = () => {
    dispatch(setCurrentSyn(undefined)); 
    dispatch(setEnded(false));
  }

  const toggleThemeMode = () => {
    dispatch(toggleTheme());
  }

  return (
    <AppBar position="static" >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Rsh Dynamic Visualizer and Debugger
        </Typography>
        <Box sx={{ display: 'flex'}}>
          { loading && <CircularProgress style={{color: 'inherit', padding:"1px"}}/>}
        </Box>
        <ProgramState ended={ended} currentSyn={currentSyn}/>
        <IconButton color="inherit" onClick={restart}>
          <RestartAltOutlined/>
        </IconButton>
        <IconButton sx={{ ml: 1 }} onClick={toggleThemeMode} color="inherit">
          {theme === 'dark' ? <DarkModeOutlined /> : <LightModeOutlined />}
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

{/* <div>
<Dialog
  open={alert_message}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
>
  <DialogTitle id="alert-dialog-title">
  {"The Program execution has ended"}
  </DialogTitle>
  <DialogContent>
  <DialogContentText id="alert-dialog-description">
      The tool is showing the last piece of information it got from the compiler.
  </DialogContentText>
  </DialogContent>
  <DialogActions>
  <Button onClick={()=>setAlert_message(false)} >Okay</Button>
  </DialogActions>
</Dialog>
</div> */}