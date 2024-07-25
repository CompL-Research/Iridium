import { Grid, Paper, useTheme } from "@mui/material";
import { Item, RedPara, getConT, colorMap, showTooltip, hideTooltip, TooltipLattice, assignColor } from "../utils";
import { styled } from '@mui/material/styles';
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";


export default function({ socket }) {
  const currentSyn = useSelector((state) => state.mainState.currentSyn)
  const currentContext = useSelector((state) => state.mainData.currentContext)
  const contextRuns = useSelector((state) => state.mainData.contextRuns)

  const funId = 123

  const theme = useTheme();

  const radius = 18;
  const [circleCoords, setCircleCoords] = useState([]); // default: []
  const [latticeEdges, setLatticeEdges] = useState([]); // default: []
  const latticeRef = useRef(null);
  const plotLattice = (context) => {
    //if (!mainFileData.isValidId(funId)) return reset();
    // Lattice Plotter Data
    if (latticeRef.current === null || latticeRef.current.clientHeight === null) return;


    //const contexts = mainFileData.getContexts(funId);
    const cont = Array.from(context);
    const contexts =  cont.filter(e => e);
    const ciData = {};


    const checker = (arr, target) => target.length === 0 ? true : target.every(v => arr.includes(v));
    const contains = (o, c) => {
      const other = getConT(o);
      const curr = getConT(c);

      return (
        other.missing === curr.missing &&
        checker(other.assumptions, curr.assumptions) &&
        checker(other.typeAssumptions, curr.typeAssumptions)
      );
    }

    contexts.forEach((curr) => {

      let res = [];
      contexts.forEach((other) => {
        if (curr !== other && contains(other,curr)) res.push(other)
      });
      ciData[curr] = res;
    });

    ciData["baseline"] = contexts;

    const index = ciData["baseline"].indexOf("baseline");
    ciData["baseline"].splice(index, 1); // remove processed leaves from map


    const getLevelData = (ciData) => {
      const getLeaves = (d) => {
        const leaves = [];
        for (var key in d) {
          if (d.hasOwnProperty(key) && d[key].length === 0) {
            leaves.push(key);
          }
        }
        return leaves;
      }
      const map = {...ciData};
      const levelData = [];
      while(Object.keys(map).length !== 0) {
        const leaves = getLeaves(map);
        levelData.push(leaves);
        leaves.forEach(e => delete map[e]); // remove processed leaves

        for (var key in map) {
          if (map.hasOwnProperty(key)) {

            let j = 0;
            for (j=0;j<leaves.length;j++) {
              const e = leaves[j];
              const newArr = [...map[key]];
              const index = newArr.indexOf(e);
              if (index !== -1) {
                newArr.splice(index, 1); // remove processed leaves from map
              }
              map[key] = newArr;

            }
          }
        }
      }
      return levelData;
    }

    // ciData says, I am contained in all these contexts
    // const ciData = containedInData; // contained in data
    const levelData = getLevelData(ciData);
    const contextCoordMap = {};
    const levels = levelData.length;
    const generateCoordinates = () => {
      if (levels === 0 || latticeRef.current === null) return [];
      const displayHeight = latticeRef.current.clientHeight;
      const displayWidth = latticeRef.current.clientWidth;
      const increment_per_level = parseInt(displayHeight / levels) + 1;
      const coords = [];
      let i = 0;
      let l = 0;
      for (i=0;i<displayHeight;i+=increment_per_level) {
        let centerY = i + increment_per_level/2;
        let levelNodes = levelData[l];
        let node_seperation = parseInt(displayWidth / (levelNodes.length)) + 1;
        let j = 0;
        let m = 0;
        for (j=0;j<displayWidth;j+=node_seperation) {
          let x = (j + node_seperation/2);
          let y = centerY;
          let currentContext = levelNodes[m];
          contextCoordMap[currentContext] = {x, y}
          coords.push([x,y,currentContext]);
          m++;
        }
        l++;
      }
      return coords;
    }

    const generateEdges = () => {

      const getTarget = (node,depth) => {
        const level = levelData[depth];
        if (level === undefined) return ["baseline"];
        let i = 0;
        let res = [];
        for(i=0;i<level.length;i++) {
          const e = level[i];
          if (ciData[e].indexOf(node) !== -1) {
            res.push(e);
          }
        }
        if (res.length > 0) return res
        else return getTarget(node, depth + 1);
      }

      const edges = [];
      let i = 0;
      let current = levelData[i];

      while (current !== undefined) {
        let j = 0;
        for (j=0;j<current.length;j++) {
          const node = current[j];
          const targets = getTarget(node, i + 1);
          targets.forEach(target =>
            edges.push([contextCoordMap[node].x,contextCoordMap[node].y,contextCoordMap[target].x,contextCoordMap[target].y])
          );
        }
        i++;
        current = levelData[i];
      }

      return edges;
    }

    const updateLatticeDiagram = () => {
      const c = generateCoordinates();
      const edges = generateEdges();

      setCircleCoords(c);
      setLatticeEdges(edges);
    }



    window.addEventListener("resize", updateLatticeDiagram, false);

    updateLatticeDiagram();
  }

  useEffect(()=>{
    assignColor(currentContext);
    plotLattice(currentContext);
  },[currentContext]);

  return (
    <Item style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        <RedPara>Lattice of Contexts</RedPara>
          <svg ref={latticeRef} height="100%" width="100%" >
            {
              currentSyn && latticeEdges.map((e,i) => <line key={`${funId}-edge-${i}`} x1={e[0]} y1={e[1]} x2={e[2]} y2={e[3]} stroke={theme.palette.secondary.main} strokeWidth={1.5} />)
            }
            { currentSyn &&
              circleCoords.map((e,i) => {
              return <g key={`${funId}-node-${i}`} id="UrTavla">
                <circle
                  onMouseMove={(event) => {showTooltip(event, e[2])}}
                  onMouseOut={hideTooltip}
                  cx={e[0]}
                  cy={e[1]}
                  r={radius}
                  stroke={e[2] === currentContext ? "black" : "gray"}
                  strokeWidth={e[2] === currentContext ? 2 : 1}
                  fill={colorMap[e[2]]}
                >
                  </circle>
                <text x={e[0]} y={e[1]} textAnchor="middle" fill="white" style={{fontSize: 15, fontFamily:"mono", fontWeight: "bold", mixBlendMode: "difference"}} dy={radius/2 - 3} >{contextRuns[e[2]]}</text>
              </g>
              }
              )
            }
            Sorry, your browser does not support inline SVG.
          </svg>
          <TooltipLattice id="tooltip-lattice" display="none"  ></TooltipLattice>
    </Item>
  );
} 