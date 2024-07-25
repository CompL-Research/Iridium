import { Grid, useTheme } from "@mui/material";
import { Item, RedPara, getConT, colorMap, assignColor, accessFunctionName, light_dot_style, dark_dot_style } from "../utils";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import Graphviz from "graphviz-react";

export default function() {
  const currentSyn = useSelector((state) => state.mainState.currentSyn)
  const currentContext = useSelector((state) => state.mainData.currentContext)
  const singleFun = useSelector((state) => state.mainData.singleFun)
  const cgState = useSelector((state) => state.mainData.cgState)
  const funName = accessFunctionName(currentSyn)

  const theme = useTheme();
  const [dot_style,setDot_style]= useState(theme.palette.dot_style);
  const [styledDOT_string, setStyledDOT_string] = useState("digraph {\n "+ dot_style + " }");


  const themeMode = useSelector((state) => state.mainState.theme)

  useEffect(()=>{
    setDot_style(themeMode === "light" ? light_dot_style : dark_dot_style);
  },[themeMode]);

  useEffect(()=>{
    const cur= [...cgState];
    cur.splice(1,0,dot_style);
    const DOT_string = cur.join(' ');
    //console.log(DOT_string);
    setStyledDOT_string(DOT_string)
  },[cgState,dot_style]);


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
    console.log(colorMap);
  }

  useEffect(()=>{
    assignColor(currentContext);
    plotLattice(currentContext);
  },[currentContext]);

  return (
    <Item style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        <RedPara>Call Graph </RedPara>
        <Graphviz
          options={{
            fit: true,
            width: '100%'
          }}
          dot={currentSyn && singleFun==true ? 'digraph{ '+dot_style+ "pad=4"+ JSON.stringify(funName)+ '}':styledDOT_string} 
        />
    </Item>
  );
} 