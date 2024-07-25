import { Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import { Item, RedPara } from "../utils";

export default function({ currentSyn, stackframeMapping }) {
  return (
    <Item style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
      <div>
        <RedPara>Stack</RedPara>
      </div>
      <div style={{ flex: 1, overflow: 'scroll' }}>
        <TableContainer>
          <Table>
            <TableBody>
            {
              currentSyn && stackframeMapping[currentSyn[0]] &&
              stackframeMapping[currentSyn[0]].map(
                (line) => <TableRow key={`line-${Math.random(line)}`}>
                  <TableCell>
                    {line}
                  </TableCell>
                </TableRow>
              )
            }
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Item>
  );
} 