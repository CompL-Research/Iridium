import { Paper, createTheme } from '@mui/material';
import { styled } from '@mui/system';
export {TooltipLattice,RightContainer, RlContainer, colorMap, RedPara, dark_dot_style, light_dot_style, lightTheme, darkTheme, Item}

const TooltipLattice = styled('div')( {
	position: "absolute",
	display: "none",
	padding: 5,
	borderRadius: 5,
	background: 'rgba(0,0,0,0.6)',
	color: "#fff",
	top: 50
});
const RightContainer = styled('div')({
		display: 'flex',
		flex: 3,
	});
const RlContainer= styled('div')({
		flex: 2,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignContent: 'center',
	});
const RedPara= styled('p')(({theme})=>({
	color:theme.palette.highlight ,
	fontSize: 20,
	fontFamily:"mono",
	fontWeight: "bold",
	}));
const colorMap = {};
const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
	color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
export function assignColor(contextList){
 const contextArray= Array.from(contextList)
 contextArray.forEach((cont)=>{
  const color = cont === "baseline" ? "#a0a0a0" : getRandomColor();
  if (colorMap[cont] === undefined) colorMap[cont] = color;
});
}

export function getConT (con) {
	let tmp1 = con.split(';');
	let assumptions = [];
	let typeAssumptions = [];
	let missing = 0;
	if (tmp1[1] !== undefined) { // contains type assumptions
		assumptions = tmp1[0].split(',');
		let tmp2 = tmp1[1].split(" miss: ");

		if (tmp2[1] === undefined) { // missing ?
			typeAssumptions = tmp1[1].split(',');
		} else {
			typeAssumptions = tmp2[0].split(',');
			missing = tmp2[1];
		}
	} else { // contains no type assumptions
		let tmp2 = tmp1[0].split(" miss: ");

		if (tmp2[1] === undefined) { // contains no missing field
			assumptions = tmp1[0].split(',');
		} else {
			assumptions = tmp2[0].split(',');
			missing = tmp2[1];
		}
	}

	const res = {assumptions: assumptions, typeAssumptions: typeAssumptions, missing}

	return res

}

export function showTooltip (evt, text){
	console.log(evt)
    let tooltip = document.getElementById("tooltip-lattice");
    const con = getConT(text);
    tooltip.innerHTML = con.assumptions.join(" ") + "<br/>" + con.typeAssumptions.join(" ") + "<br>" + "missing: " + con.missing;
    tooltip.style.display = "inline-block";
	tooltip.style.position = "static";
    // tooltip.style.left = evt.pageX + 'px';
    // tooltip.style.top = evt.pageY + 'px';
}

export function hideTooltip () {
    var tooltip = document.getElementById("tooltip-lattice");
    tooltip.style.display = "none";
}

// Syn Accessors
export function accessFunctionName(syn) {
	if (typeof syn === "object" && syn.length > 0) return syn[3]
	console.assert(false, "No access to syn name")
}

const dark_dot_style = "size= \"6,9\" " +
  "ratio=fill " +
  "bgcolor= \"#1A2027\" " +
  "node [style=filled fontname=\"Times-Bold\" fontsize=20 color=grey ] "+
  "edge[color=\"#d53232d9\" arrowsize=1.5]; ";

const light_dot_style = "size= \"6,9\" " +
  "ratio=fill " +
    "bgcolor= \"grey\" " +
    "node [style=filled fontname=\"Times-Bold\" fontsize=20 fontcolor=white color=\"#1976d2\" ] "+
    "edge[color=\"blue\" arrowsize=1.5]; ";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "hsl(230, 17%, 14%)"
    },
    highlight: "red",
    dot_style:dark_dot_style
  }
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "hsl(0, 0%, 100%)"
    },
    highlight:"#1976d2",
    dot_style:light_dot_style
  }
});
const Item = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : 'lightgrey',
	...theme.typography.body2,
	padding: theme.spacing(1),
	textAlign: 'center',
	color: theme.palette.text.primary,
  }));