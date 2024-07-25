import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { styled } from '@mui/material/styles';
import { useDispatch, useSelector } from "react-redux";
import { Item, RedPara } from '../utils';
import SendIcon from '@mui/icons-material/Send';
import { setEnvUpdates } from '../reducers/MainState';

const VIZ_REQ_ENV = "viz-mod-env"
const VIZ_REQUESTS_THESE = "viz-requests-these"


export default function({socket}) {

  const connected = useSelector((state) => state.mainState.connected)
  const loading = useSelector((state) => state.mainState.loading)
  const ended = useSelector((state) => state.mainState.ended)
  const currentSyn = useSelector((state) => state.mainState.currentSyn)
  const envState = useSelector((state) => state.mainState.envState)

  const envUpdates = useSelector((state) => state.mainState.envUpdates)
  const [envError, setEnvError] = React.useState({});
  const [isEnvValid, setIsEnvValid] = React.useState(true);
  const [envAlert, setEnvAlert] = React.useState(false);

  const dispatch = useDispatch();

  function EnvEntry (data) {
    let cur_val=envUpdates.hasOwnProperty(data["key_"])? envUpdates[data["key_"]][1]:data["val"];
    let cur_dt=envUpdates.hasOwnProperty(data["key_"])? envUpdates[data["key_"]][0]:data["dt"];
    let cur_error=envError.hasOwnProperty(data["key_"])? envError[data["key_"]]:false;
  
    const handleDataTypeChange = (event) => {
      cur_dt=event.target.value;
      dispatch(setEnvUpdates({
        ...envUpdates,
        [data["key_"]] : [event.target.value,cur_val],
      }));
      CheckValue();
    };
    function CheckValue (){
      switch (cur_dt) {
        case 'str':
          setEnvError(prevState =>({...prevState,[data["key_"]]:!cur_val.trim()}));
          break;
        case 'int':
          setEnvError(prevState =>({...prevState,[data["key_"]]:isNaN(cur_val)}));
          break;
          case 'real':
          setEnvError(prevState =>({...prevState,[data["key_"]]:isNaN(cur_val)}));
          break;
          // case 'promise':
          // setEnvError(prevState =>({...prevState,[data["key_"]]:false}));
          // break;
        case 'lgl':
          setEnvError(prevState =>({...prevState,[data["key_"]]:cur_val !== 'true' && cur_val !== 'false'}));
          break;
        default:
          setEnvError(prevState =>({...prevState,[data["key_"]]:false}));
      }
      cur_error=envError[data["key_"]];
    }
    const handleValueChange = (event) => {
      cur_val = event.target.value;
      dispatch(setEnvUpdates({
        ...envUpdates,
        [data["key_"]] : [cur_dt,event.target.value],
      }));
      // Validate the input value based on the selected data type
      CheckValue();
    };
  
    return (
      <TableRow>
      <TableCell>{data['key_']}</TableCell><TableCell> {data["val"]}</TableCell>
      <TableCell>{data['dt']}</TableCell>
      <TableCell>
        <Select defaultValue={cur_dt} onChange={handleDataTypeChange}>
          <MenuItem value="str">String</MenuItem>
          <MenuItem value="int">Integer</MenuItem>
          <MenuItem value="real">Real</MenuItem>
          <MenuItem value="lgl">Boolean</MenuItem>
          <MenuItem value="prom">Promise</MenuItem>
          <MenuItem value="cls">Closure</MenuItem>
          <MenuItem value="char">Character</MenuItem>
          <MenuItem value="lst">List</MenuItem>
          <MenuItem value="expr">Expression</MenuItem>
          <MenuItem value="vec">Vector</MenuItem>
        </Select>
      </TableCell>
      <TableCell>
      <TextField
        key={data["key_"]}
        autoFocus = {data["key_"]== Object.keys(envUpdates).pop()}
        defaultValue={cur_val}
        onChange={handleValueChange}
        label="Value"
        error={cur_error}
        helperText={envError[data["key_"]] && `Invalid ${cur_dt} value`}
        />
      </TableCell>
      </TableRow>
    );
  };

  const getEnvTable=(data)=>{
    if(JSON.stringify(data)=="{}")data=[];
    return (
      <div style={{ flex: 1, overflow: 'scroll' }}>
        <TableContainer >
          <Table>
            <TableHead fontWeight={5} >
              <TableRow>
                <TableCell>Key</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>DataType</TableCell>
                <TableCell>Modify DataType</TableCell>
                <TableCell>Modify Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => {
                return (currentSyn &&
                    Object.entries(item).map((field) => {
                      return (
                      <EnvEntry key={field[0]} key_={field[0]} val={field[1][0]} dt={field[1][1]} />
                      );
                    })
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

      </div>
        );
  }

  // ref: https://www.freecodecamp.org/news/check-if-an-object-is-empty-in-javascript/
  const isObjectEmpty = (objectName) => {
    return Object.keys(objectName).length === 0 && objectName.constructor === Object;
  }

  const reqEnvMod = () => {
    //let dt = "INTSXP"
    if(!isEnvValid){setEnvAlert(true);return;}
    if (isObjectEmpty(envUpdates)) return;
    let keys=Object.keys(envUpdates);
    const values=[];
    const datatypes=[];
    keys.forEach((key) => {
      values.push(envUpdates[key][0]);datatypes.push(envUpdates[key][1]);
    })

    socket.emit(VIZ_REQ_ENV,JSON.stringify([keys,values,datatypes]));
    socket.emit(VIZ_REQUESTS_THESE,["environment"])
  }

  return (
    <Item style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>

        <div>
          <RedPara>Environment</RedPara>
        </div>
        {getEnvTable(envState)}
        <div>
          <Button  sx={{ m:1,p:1}} variant="outlined" onClick={reqEnvMod} disabled={!connected || !currentSyn || loading || ended} endIcon={<SendIcon />} size="medium">
            Update Environment
          </Button>
        </div>
        {/* <Dialog
          open={envAlert}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"The modified values in the environment are invalid"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
    The values for the respective datatypes are invalid as shown in the errors. Enter the valid values and then try to update the environemnt.           </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setEnvAlert(false)} >Okay</Button>
          </DialogActions>
        </Dialog> */}
    </Item>

  );
}
