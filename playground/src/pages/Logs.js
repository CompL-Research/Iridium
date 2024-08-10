import ReactJson from '@microlink/react-json-view';
import { useEffect, useRef, useState } from "react";
import './Logs.css';
export default function Logs({ socket, flashMessage }) {

  const startingValRef = useRef(null);
  const endingValRef = useRef(null);

  const [logs, setLogs] = useState([])
  const [startEnd, setStartEnd] = useState([0, 1000])
  const [dataFilter, setDataFilter] = useState(new Set(["general", "warn", "error"]))

  function resolveLogObject(idx) {
    const newLogs = [...logs]
    newLogs[idx].objects = ["resolving"]
    setLogs(newLogs)
    socket.emit("get-log-object", idx)
  }

  useEffect(() => {
    const logDataDelivery = (data) => {
      if (data.length > 0) {
        const newLogs = [...logs]
        data.forEach(element => newLogs.push(element));
        setLogs(newLogs)
      }
    }
    const requestDelivery = () => {
      socket.emit("get-log-data", logs.length)
    }
    socket.on("log-data-delivery", logDataDelivery)
    requestDelivery()
    const requestLogs = setInterval(requestDelivery, 2000);

    function updateLogObject({ dataIdx, data }) {
      const newLogs = [...logs]
      newLogs[dataIdx].objects = ["resolved", data]
      setLogs(newLogs)
    }

    socket.on("log-object-delivery", updateLogObject)

    return () => {
      socket.off('log-data-delivery', logDataDelivery);
      socket.off('log-object-delivery', updateLogObject);
      clearInterval(requestLogs);
    };
  }, [socket, logs])

  function updateStartAndEnd() {

    try {
      let start = parseInt(startingValRef.current.value)
      let end = parseInt(endingValRef.current.value)
      setStartEnd([start, end])
    } catch {

    }

  }

  function handleDataFilter(d) {
    if (dataFilter.has(d)) {
      const newData = new Set(dataFilter)
      newData.delete(d)
      setDataFilter(newData)
    } else {
      const newData = new Set(dataFilter)
      newData.add(d)
      setDataFilter(newData)
    }
  }

  console.log("Datafilter: ", dataFilter)

  return <div>

    <div className='log-filter-bar'>
      <span className='filter-bar-checkbox'>
        general <input checked={dataFilter.has("general")} onChange={() => handleDataFilter("general")} type="checkbox" />
      </span>
      <span className='filter-bar-checkbox'>
        warn <input checked={dataFilter.has("warn")} onChange={() => handleDataFilter("warn")} type="checkbox" />
      </span>
      <span className='filter-bar-checkbox'>
        errors <input checked={dataFilter.has("error")} onChange={() => handleDataFilter("error")} type="checkbox" />
      </span>
      : Select Range <input placeholder={startEnd[0]} ref={startingValRef} type="number" /> to <input ref={endingValRef} placeholder={startEnd[1]} type="number" /> <button onClick={updateStartAndEnd}>Filter</button> : Currently showing entries {startEnd[0]} - {startEnd[1]} of {logs.length} entries.
    </div>
    <div className="logs-container">
      {
        logs.slice(startEnd[0], startEnd[1]).filter(l => dataFilter.has(l.level)).map((l, idx) =>
          <div className={`log-item log-item-${l.level}`} key={idx} title={l.timestamp}>

            {l.message.startsWith("https://") ? <div className="resolve-data-button-container"> <a title={"Visit Link"} className='resolve-data-button' target='_blank' href={l.message}>Visit Link</a> </div> : l.message.split("\n").map((e, index) => <div className="log-msg-line" >{e}</div>)}

            {
              l.objects[0] === "unresolved" &&
              <div
                title="Download Object"
                onClick={() => resolveLogObject(idx)}
                className="resolve-data-button-container">
                <span className="resolve-data-button">
                  <span className="material-symbols-outlined">
                    data_object
                  </span>
                </span>
              </div>
            }

            {
              l.objects[0] === "resolving" &&
              <div
                title="Downloading Object"
                onClick={() => resolveLogObject(idx)}
                className="resolve-data-button-container">
                <span className="resolve-data-button downloading">
                  Waiting... (re-request?)
                  <span className="material-symbols-outlined">
                    downloading
                  </span>
                </span>
              </div>
            }

            {
              l.objects[0] === "resolved" &&
              <span>
                <ReactJson theme="flat" name={false} displayDataTypes={false} indentWidth={6} enableClipboard src={l.objects[1]} collapsed={4} />
              </span>
            }

            {/* <div className='log-item-timestamp'>
              {l.timestamp}
            </div> */}





          </div>)
      }
    </div>
  </div>


}