import { useEffect, useRef } from "react";
import './ImportsGraph.css'
import { graphviz } from 'd3-graphviz';
import * as d3 from 'd3';

export default function Logs({ socket, flashMessage }) {

  // const [graphData, setGraphData] = useState("")
  const containerRef = useRef(null);

  const graphDataDelivery = (data) => {
    console.log(data)
    graphviz(containerRef.current)
      .renderDot(data)
      .on("end", function () {
        // Select all nodes and add the onclick event
        d3.selectAll(".node").on("click", function (event) {
          // Get the ID of the clicked node
          const nodeId = d3.select(this).select("title").text();
          alert("Clicked node: " + nodeId);
          // You can replace the alert with your custom function
        });
      });
  }

  const graphWaiting = () => {
    flashMessage("Imports graph is not yet ready...")
  }


  useEffect(() => {
    socket.on("imports-graph-not-ready", graphWaiting)
    socket.on("imports-graph-delivery", graphDataDelivery)

    socket.emit("get-imports-graph")

    return () => {
      socket.off('imports-graph-delivery', graphDataDelivery);
    };
  }, [socket])

  return <div className="graph-container">
    <div className="node-data">

    </div>
    <div ref={containerRef} className="graph-svg-container">

    </div>
    {/* <div  /> */}
  </div>
}