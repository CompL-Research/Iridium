import { Box, Button, Checkbox, Chip, FormControlLabel, Grid, MenuItem,Menu, Modal, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography, MenuList } from "@mui/material";
import { Item, RedPara, accessFunctionName } from "../utils";
import { useDispatch, useSelector } from "react-redux";
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { setBytecodeSync, setLoading } from "../reducers/MainState";
import SendIcon from '@mui/icons-material/Send';
import { useEffect, useRef } from "react";
import { useState } from "react";

const VIZ_SYN_DONE = "viz-syn-done"
const VIZ_REQ_TYPE = "viz-mod-type"
const VIZ_STEP_OVER = "viz-step-over"
const VIZ_REQUESTS_THESE = "viz-requests-these"

const modalStyle = {
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "50vw",
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  height: "80vh",
  overflow: 'scroll',
  p: 4,
};

const TfModal=({ currentTF, open, update, close }) => {
  const getZeros = (n) => {
    let zeros=""
    for (let i = 0; i < n; i++) zeros += "0"
    return zeros
  }
  let defVal = "0"
  let type = "0";
  if (currentTF.data) {
    defVal = currentTF.data[3]
    type = currentTF.data[1];
  }
  
  const currentTFRep = new Uint32Array([defVal]);
  const currentTFBinaryRep =  getZeros(32-currentTFRep[0].toString(2).length) + currentTFRep[0].toString(2);
  const [newValue,setNewValue] = useState(currentTFBinaryRep);

  useEffect(() => {
    setNewValue(currentTFBinaryRep);
  }, [currentTF])

  console.log(currentTFBinaryRep, newValue)

  const getNumTypes = (data) => {
    return data.substring(data.length-2, data.length)
  }
  const getSeen = (data) => {
    return data.substring(data.length-2, data.length)
  }

  const getStateBeforeLastForce = (data) => {
    return data.substring(data.length-4, data.length-2)
  }

  const getNotScalarBit = (data) => {
    return data.substring(data.length-5, data.length-4)
  }

  const getAttribsBit = (data) => {
    return data.substring(data.length-6, data.length-5)
  }
  
  const getObjectBit = (data) => {
    return data.substring(data.length-7, data.length-6)
  }
  
  const getNotFastVecEltBit = (data) => {
    return data.substring(data.length-8, data.length-7)
  }

  const getSeen1 = (data) => {
    return data.substring(data.length-16, data.length-8)
  }

  const getSeen2 = (data) => {
    return data.substring(data.length-24, data.length-16)
  }

  const getSeen3 = (data) => {
    return data.substring(data.length-32, data.length-24)
  }


  String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
  }

  const updateNumTypes = (e) => {
    let updatedVal = newValue.toString();
    let toUpdate = e.target.value.toString();
    updatedVal = updatedVal.replaceAt(updatedVal.length-2, toUpdate[0])
    updatedVal = updatedVal.replaceAt(updatedVal.length-1, toUpdate[1])
    setNewValue(updatedVal)
  }
  const updateSeen = (e) => {
    let updatedVal = newValue.toString();
    let toUpdate = e.target.value.toString();
    updatedVal = updatedVal.replaceAt(updatedVal.length-2, toUpdate[0])
    updatedVal = updatedVal.replaceAt(updatedVal.length-1, toUpdate[1])
    setNewValue(updatedVal)
  }

  const updateStateBeforeLastSeen = (e) => {
    let updatedVal = newValue.toString();
    let toUpdate = e.target.value.toString();
    updatedVal = updatedVal.replaceAt(updatedVal.length-4, toUpdate[0])
    updatedVal = updatedVal.replaceAt(updatedVal.length-3, toUpdate[1])
    setNewValue(updatedVal)
  }

  const setNotScalarBit = (e) => {
    let updatedVal = newValue.toString();
    let toUpdate = e.target.value.toString();
    updatedVal = updatedVal.replaceAt(updatedVal.length-5, toUpdate[0])
    setNewValue(updatedVal)
  }

  const setAttribsBit = (e) => {
    let updatedVal = newValue.toString();
    let toUpdate = e.target.value.toString();
    updatedVal = updatedVal.replaceAt(updatedVal.length-6, toUpdate[0])
    setNewValue(updatedVal)
  }

  const setObjectBit = (e) => {
    let updatedVal = newValue.toString();
    let toUpdate = e.target.value.toString();
    updatedVal = updatedVal.replaceAt(updatedVal.length-7, toUpdate[0])
    setNewValue(updatedVal)
  }

  const setNotFastEltBit = (e) => {
    let updatedVal = newValue.toString();
    let toUpdate = e.target.value.toString();
    updatedVal = updatedVal.replaceAt(updatedVal.length-8, toUpdate[0])
    setNewValue(updatedVal)
  }

  const setSeen1 = (e) => {
    let updatedVal = newValue.toString();
    let toUpdate = e.target.value.toString();
    for (let i = 0; i < 8; i++) {
      updatedVal = updatedVal.replaceAt(updatedVal.length-(16 - i), toUpdate[i])
    }
    setNewValue(updatedVal)
  }

  const setSeen2 = (e) => {
    let updatedVal = newValue.toString();
    let toUpdate = e.target.value.toString();
    for (let i = 0; i < 8; i++) {
      updatedVal = updatedVal.replaceAt(updatedVal.length-(24 - i), toUpdate[i])
    }
    setNewValue(updatedVal)
  }

  const setSeen3 = (e) => {
    let updatedVal = newValue.toString();
    let toUpdate = e.target.value.toString();
    for (let i = 0; i < 8; i++) {
      updatedVal = updatedVal.replaceAt(updatedVal.length-(32 - i), toUpdate[i])
    }
    setNewValue(updatedVal)
  }

  const PrettyPrint_test = ({data}) => {
    return (
      <div>
        <Tooltip style={{ marginRight: 3 }} placement="bottom" title="Seen">
          <tt>
            {getSeen(data)}
          </tt>
        </Tooltip>
      </div>)
  }
  const PrettyPrint_type = ({data}) => {
    return (
      <div>
        <Tooltip style={{ marginRight: 3 }} placement="bottom" title="Seen3">
          <tt>
            {getSeen3(data)}
          </tt>
        </Tooltip>

        <Tooltip style={{ marginRight: 3 }} placement="bottom" title="Seen2">
          <tt>
            {getSeen2(data)}
          </tt>
        </Tooltip>

        <Tooltip style={{ marginRight: 3 }} placement="bottom" title="Seen1">
          <tt>
            {getSeen1(data)}
          </tt>
        </Tooltip>

        <Tooltip style={{ marginRight: 3 }} placement="bottom" title="NotFastVecElt">
          <tt>
            {getNotFastVecEltBit(data)}
          </tt>
        </Tooltip>

        <Tooltip style={{ marginRight: 3 }} placement="bottom" title="Object">
          <tt>
            {getObjectBit(data)}
          </tt>
        </Tooltip>

        <Tooltip style={{ marginRight: 3 }} placement="bottom" title="Attribs">
          <tt>
            {getAttribsBit(data)}
          </tt>
        </Tooltip>

        <Tooltip style={{ marginRight: 3 }} placement="bottom" title="Not Scalar">
          <tt>
            {getNotScalarBit(data)}
          </tt>
        </Tooltip>

        <Tooltip style={{ marginRight: 3 }} placement="bottom" title="State Before Last Force">
          <tt>
            {getStateBeforeLastForce(data)}
          </tt>
        </Tooltip>

        <Tooltip style={{ marginRight: 3 }} placement="bottom" title="Num Types">
          <tt>
            {getNumTypes(data)}
          </tt>
        </Tooltip>
      </div>
    )
  }
  const SeenOptions = [
    { name: "NILSXP",  value: "00000000" },
    { name: "SYMSXP",  value: "00000001" },
    { name: "LISTSXP", value: "00000010" },
    { name: "CLOSXP",  value: "00000011" },
    { name: "ENVSXP",  value: "00000100" },
    { name: "PROMSXP",  value: "00000101" },
    { name: "LANGSXP",  value: "00000110" },
    { name: "SPECIALXP",  value: "00000111" },
    { name: "BUITLINSXP",  value: "00001000" },
    { name: "CHARSXP",  value: "00001001" },
    { name: "LGLSXP",  value: "00001010" },

    { name: "INTSXP",  value: "00001101" },
    { name: "REALSXP",  value: "00001110" },
    { name: "CPLXSXP",  value: "00001111" },
    { name: "STRSXP",  value: "00010000" },
    { name: "DOTSXP",  value: "00010001" },
    { name: "ANYSXP",  value: "00010010" },

    { name: "VECSXP",  value: "00010011" },
    { name: "EXPRSXP",  value: "00010100" },
    { name: "BCODESXP",  value: "00010101" },
    { name: "EXTPTRSXP",  value: "00010110" },
    { name: "WEAKREFSXP",  value: "00010111" },
    { name: "RAWSXP",  value: "00011000" },
    { name: "S4SXP",  value: "00011001" },

    { name: "EXTERNALSXP",  value: "00011010" },

    { name: "NEWSXP",  value: "00011110" },
    { name: "FREESXP",  value: "00011111" },

    { name: "FUNSXP",  value: "01100011" },


  ];


  if (!currentTF.data) return <div></div>
  return <Modal
    open={open}
    onClose={close}
  >
    {
      <Box sx={modalStyle}>
        
          {type==="record_type_  " ? 
          <div><br/>
          Old: <PrettyPrint_type data={currentTFBinaryRep} />
          <br/>
          New: <PrettyPrint_type data={newValue} />
          <br/></div>
          :<div><br/>
          Old: <PrettyPrint_test data={currentTFBinaryRep} />
          <br/>
          New: <PrettyPrint_test data={newValue} />
          <br/></div>}
          <Chip label={type} color="primary" />
        
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
        <div>

        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Field</TableCell>
              <TableCell>CurrentValue</TableCell>
              <TableCell>Modify</TableCell>
              </TableRow></TableHead>
          {type=="record_type_  "? 
          <TableBody>
           
            <TableRow>
              <TableCell>numTypes</TableCell>
              <TableCell>{getNumTypes(currentTFBinaryRep)}</TableCell>
              <TableCell>
                <Select
                  defaultValue={getNumTypes(currentTFBinaryRep)}
                  onChange={updateNumTypes}
                >
                  <MenuItem value={"00"}>0</MenuItem>
                  <MenuItem value={"01"}>1</MenuItem>
                  <MenuItem value={"10"}>2</MenuItem>
                  <MenuItem value={"11"}>3</MenuItem>
                </Select>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>stateBeforeLastForce</TableCell>
              <TableCell>{getStateBeforeLastForce(currentTFBinaryRep)}</TableCell>
              <TableCell>
                <Select
                  defaultValue={getStateBeforeLastForce(currentTFBinaryRep)}
                  onChange={updateStateBeforeLastSeen}
                >
                  <MenuItem value={"00"}>unknown</MenuItem>
                  <MenuItem value={"01"}>value</MenuItem>
                  <MenuItem value={"10"}>evaluatedPromise</MenuItem>
                  <MenuItem value={"11"}>promise</MenuItem>
                </Select>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Not Scalar</TableCell>
              <TableCell>{getNotScalarBit(currentTFBinaryRep)}</TableCell>
              <TableCell>
                <Select
                  defaultValue={getNotScalarBit(currentTFBinaryRep)}
                  onChange={setNotScalarBit}
                >
                  <MenuItem value={"0"}>unset</MenuItem>
                  <MenuItem value={"1"}>set</MenuItem>
                </Select>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Attribs</TableCell>
              <TableCell>{getAttribsBit(currentTFBinaryRep)}</TableCell>
              <TableCell>
                <Select
                  defaultValue={getAttribsBit(currentTFBinaryRep)}
                  onChange={setAttribsBit}
                >
                  <MenuItem value={"0"}>unset</MenuItem>
                  <MenuItem value={"1"}>set</MenuItem>
                </Select>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Object</TableCell>
              <TableCell>{getObjectBit(currentTFBinaryRep)}</TableCell>
              <TableCell>
                <Select
                  defaultValue={getObjectBit(currentTFBinaryRep)}
                  onChange={setObjectBit}
                >
                  <MenuItem value={"0"}>unset</MenuItem>
                  <MenuItem value={"1"}>set</MenuItem>
                </Select>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Not Fast Vec Elt</TableCell>
              <TableCell>{getNotFastVecEltBit(currentTFBinaryRep)}</TableCell>
              <TableCell>
                <Select
                  defaultValue={getNotFastVecEltBit(currentTFBinaryRep)}
                  onChange={setNotFastEltBit}
                >
                  <MenuItem value={"0"}>unset</MenuItem>
                  <MenuItem value={"1"}>set</MenuItem>
                </Select>
              </TableCell>
            </TableRow>
            {
              parseInt(getNumTypes(newValue), 2) > 0 &&  
              <TableRow>
                <TableCell>Seen 1</TableCell>
                <TableCell>{getSeen1(currentTFBinaryRep)}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={getSeen1(currentTFBinaryRep)}
                    onChange={setSeen1}
                  >
                    {SeenOptions.map(({ name,value }, index) => (
  <MenuItem key={index} value={value}>
    {name}
  </MenuItem>
))}
                  </Select>
                </TableCell>
              </TableRow>
            }
            {
              parseInt(getNumTypes(newValue), 2) > 1 &&  
              <TableRow>
                <TableCell>Seen 2</TableCell>
                <TableCell>{getSeen2(currentTFBinaryRep)}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={getSeen2(currentTFBinaryRep)}
                    onChange={setSeen2}
                  > 
                    {SeenOptions.map(({ name,value }, index) => (
  <MenuItem key={index} value={value}>
    {name}
  </MenuItem>
))}
                  </Select>
                </TableCell>
              </TableRow>
            }
            {
              parseInt(getNumTypes(newValue), 2) > 2 &&  
              <TableRow>
                <TableCell>Seen 3</TableCell>
                <TableCell>{getSeen3(currentTFBinaryRep)}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={getSeen3(currentTFBinaryRep)}
                    onChange={setSeen3}
                  >
                    {SeenOptions.map(({ name,value }, index) => (
  <MenuItem key={index} value={value}>
    {name}
  </MenuItem>
))}
                  </Select>
                </TableCell>
              </TableRow>
            }
        </TableBody>
        :
        <TableBody>
          <TableRow>
              <TableCell>numTypes</TableCell>
              <TableCell>{getSeen(currentTFBinaryRep)}</TableCell>
              <TableCell>
                <Select
                  defaultValue={getSeen(currentTFBinaryRep)}
                  onChange={updateSeen}
                >
                  <MenuItem value={"00"}>0</MenuItem>
                  <MenuItem value={"01"}>1</MenuItem>
                  <MenuItem value={"10"}>2</MenuItem>
                  <MenuItem value={"11"}>3</MenuItem>
                </Select>
              </TableCell>
            </TableRow>
          </TableBody>}
        </Table>
        </Typography>
        <Button variant="outlined" onClick={()=> update(currentTF.offset,newValue,currentTF.data[1])}>Update</Button>
        <Button variant="outlined" onClick={close}>Close</Button>
      </Box>

    }
  </Modal>

}

export default function({ socket }) {
  const currentSyn = useSelector((state) => state.mainState.currentSyn)
  const funName = accessFunctionName(currentSyn)
  const bytecodeMapping = useSelector((state) => state.mainData.bytecodeMapping)
  const loading = useSelector((state) => state.mainState.loading)
  const ended = useSelector((state) => state.mainState.ended)
  const connected = useSelector((state) => state.mainState.connected)
  const bytecodeSync = useSelector((state) => state.mainState.bytecodeSync)

  const theme = useTheme();

  const dispatch = useDispatch();

  const reqTypeMod = (offset, newVal, type) => {
    console.log("type updates are " ,offset, parseInt(newVal, 2), type);
    // let keys=Object.keys(typeUpdates);
    // const values=[];
    // keys.forEach((key) => {
    //   values.push(typeUpdates[key][0]);
    // })
    // console.log(keys,values);

    socket.emit(VIZ_REQ_TYPE,JSON.stringify([offset,parseInt(newVal, 2).toString()]));
    socket.emit(VIZ_REQUESTS_THESE,["code"])
    setTfModal(false);
  }

  const sendSynDone = () => {
    dispatch(setLoading(true))
    console.log("[step] stepping into");
    socket.emit(VIZ_SYN_DONE);
  }

  const stepOverCurrent = () => {
    dispatch(setLoading(true))
    console.log("[next] stepOverCurrent");
    if(currentSyn[1] == "NATIVE"){
      var nInd = "0"
      socket.emit(VIZ_STEP_OVER,nInd)
    } else {
      var keys = Object.keys(bytecodeMapping[currentSyn[0]]);
      var ind = keys.indexOf(currentSyn[2])
      var nInd = ind < keys.length - 1 ? bytecodeMapping[currentSyn[0]][keys[ind + 1]][2] : "1";
      socket.emit(VIZ_STEP_OVER,nInd)
    }
  }

  const lineRef = useRef()

  const scrollToLine = () => {
    if (lineRef.current) {
      lineRef.current.scrollIntoView(false)
    }
  }
  
  useEffect(() => {
    // console.log("Scroll to line")
    scrollToLine()
  }, [currentSyn])
  const [tfModal, setTfModal] = useState(false);
  const [currTF, setCurrTF] = useState({});

  const handleOpenTfModal = (key) => {
    setTfModal(true);
    const data = {
      offset: key,
      data: bytecodeMapping[currentSyn[0]][key]
    }
    setCurrTF(data)
  };
  // const handleTfModalClose = () => {
  //   setTfModal(false)
  // };
  // const handleTfModalUpdate = (updatedValue) => {
  //   setTypeUpdates(prevState => ({
  //     ...prevState,
  //     [currTF] : [updatedValue],
  //   }))
  // };

  return (
    <Item style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
      <TfModal currentTF={currTF} open={tfModal} close={
        () => {setTfModal(false);}
      } update={reqTypeMod}
      />
      <div>
        Current Syn: {currentSyn ? `Code: ${currentSyn[0]}, Type: ${currentSyn[1]}` : "Waiting for syn..."}
        <RedPara> {funName=="Promise" ? "At a promise" :  "At function : " + JSON.stringify(funName) }  </RedPara>
      </div>
      <div style={{ flex: 1, overflow: 'scroll' }}>
        <pre >
          <code style={{textAlign: 'left', fontSize: "1.15em"}}>
          <TableContainer>
            <Table>
              <TableBody>
                {
                  currentSyn && bytecodeMapping[currentSyn[0]] &&
                    Object.keys(bytecodeMapping[currentSyn[0]]).map((key, idx) => {
                      return (
                        <TableRow key={`key` + idx}>
                          <TableCell>
                            <div ref={currentSyn[2] == key ? lineRef : undefined} style={{ fontWeight: currentSyn[2] == key ? "bold": undefined, color: currentSyn[2] == key ? theme.palette.highlight : undefined }}>
                              {key}  {bytecodeMapping[currentSyn[0]][key][1] == "record_type_  " || bytecodeMapping[currentSyn[0]][key][1] == "record_test_  " ? 
                              <Button variant="outlined" onClick={() => handleOpenTfModal(key)}>{bytecodeMapping[currentSyn[0]][key][0]}</Button> : bytecodeMapping[currentSyn[0]][key][0]}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                  })
                }
              </TableBody>
            </Table>
          </TableContainer>
          </code>
        </pre>
      </div>
      <FormControlLabel
        sx={{
          justifyContent: 'right',
        }}
        control={
          <Checkbox
            disabled={!connected || !currentSyn  || loading|| ended}
            checked={bytecodeSync}
            onChange={() => {
              dispatch(setBytecodeSync(!bytecodeSync))
            }}
            inputProps={{ 'aria-label': 'controlled' }}
            />
          }
        label={"Keep bytecode sync"}
      />
      <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row-reverse', width:'100%'}}>
        <Button  sx={{ m:1,p:1}} variant="outlined" onClick={sendSynDone} disabled={!connected || !currentSyn || loading || ended} endIcon={<SendIcon />} size="medium">
          Step
        </Button>
        <Button sx={{ m:1,p:1}} variant="outlined" onClick={stepOverCurrent} disabled={!connected || !currentSyn || loading || ended} endIcon={<SendIcon />} size="small">
          Next
        </Button>
        <Button sx={{ m:1,p:1}} variant="outlined" onClick={scrollToLine} disabled={!connected || !currentSyn || loading || ended} endIcon={<SendIcon />} size="small">
          Scroll
        </Button>
      </div>

    </Item>
  );
} 