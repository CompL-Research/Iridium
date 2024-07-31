import { useEffect, useState } from "react";
import ReactJson from '@microlink/react-json-view'
import './Logs.css'
export default function Logs({ socket, }) {

  const [logs, setLogs] = useState([])

  const logDataDelivery = (data) => {
    if (data) {
      setLogs(data)
    }
  }

  const requestDelivery = () => {
    socket.emit("get-log-data", logs.length)
  }

  useEffect(() => {
    socket.on("log-data-delivery", logDataDelivery)

    const requestLogs = setInterval(requestDelivery, 1000);

    return () => {
      socket.off('log-data-delivery', logDataDelivery);
      clearInterval(requestLogs);
    };
  }, [socket])

  return <div className="logs-container">
    {
      logs.map((l, idx) => <div className={`log-item log-item-${l.level}`} key={idx} title={l.timestamp}>
        {l.message}
        {l.objects.length > 0 && 
          <ReactJson theme="threezerotwofour" name={false} displayDataTypes={false} indentWidth={6} enableClipboard src={l.objects} collapsed={0} />
        }
      </div>)
    }
  </div>
}