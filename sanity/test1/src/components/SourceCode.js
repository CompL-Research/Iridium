import { Grid, Paper } from "@mui/material";
import { Item, RedPara } from "../utils";
import { styled } from '@mui/material/styles';
import { useSelector } from "react-redux";

export default function({ socket }) {
  const currentSyn = useSelector((state) => state.mainState.currentSyn)

  const sourcecodeMapping = useSelector((state) => state.mainData.sourcecodeMapping)

  return (
    <Item style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
      <RedPara>Source Code of current closure</RedPara>
        <pre>
          <code style={{textAlign: 'left'}}>
            {
              currentSyn && sourcecodeMapping[currentSyn[0]] &&
              sourcecodeMapping[currentSyn[0]].map((line) => <div key={`${line}-line`}>{line}</div>)
            }
          </code>
        </pre>
    </Item>
  );
} 