
import * as React from 'react';
import { io } from 'socket.io-client';

import './App.css'
import Logs from './pages/Logs';
import ImportsGraph from './pages/ImportsGraph';

const banner = `
 
 
 
 
 
 
 

░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░        ░░       ░░░        ░░       ░░░        ░░  ░░░░  ░░  ░░░░  ░
▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒  ▒▒   ▒▒   ▒
▓▓▓▓  ▓▓▓▓▓       ▓▓▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓  ▓▓        ▓
████  █████  ███  ██████  █████  ████  █████  █████  ████  ██  █  █  █
█        ██  ████  ██        ██       ███        ███      ███  ████  █
██████████████████████████████████████████████████████████████████████
 
 
 
 
interactive explorer
 
__connect to a session to get started__
 
Author: mee, meeteshmehta@cse.iitb.ac.in
`

function MainContainer() {
  const [mainSocket, setMainSocket] = React.useState(null)
  const [isConnected, setIsConnected] = React.useState(false);

  const [selectedTab, setSelectedTab] = React.useState(2);

  const [url, setUrl] = React.useState("")
  const [message, setMessage] = React.useState("Waiting to connect...")

  function validateURL(url) {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.?)+[a-zA-Z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-zA-Z\\d_]*)?$', 'i' // fragment locator
    );
    return !!pattern.test(url);
  }

  function onConnect() {
    setMessage(`Connected...`)
    setIsConnected(true);
  }

  function onDisconnect() {
    setMessage(`Disconnected...`)
    setIsConnected(false);
  }

  const handleConnect = () => {
    const isValid = validateURL(url);
    if (isValid) {
      const socket = io(url)
      setMessage(`Attempting to connect to ${url}`)
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      // socket.on('foo', onFooEvent);
      setMainSocket(socket)
    } else {
      flashMessage("Invalid Address")
    }

  }

  const flashMessage = (msg) => {
    setMessage(msg)
    setTimeout(() => {
      setMessage(message)
    }, 250)
  }

  const enablePlayground = isConnected

  return (
    <React.Fragment>
      <div className='main'>
        <div className='main-container'>
          <div className='top-bar'>
            <div onClick={handleConnect} className='top-bar-connect-icon generic-button'>
              <i className="material-symbols-outlined">conversion_path</i>
            </div>
            <input
              value={url}
              type="text"
              className='top-bar-ip-address'
              placeholder='Ip Address'
              onChange={(e) => setUrl(e.target.value)}
            />
            <div className='top-bar-connection-status'>
              {message}
            </div>
          </div>
          <div className='main-space'>
            <div className='left-bar'>
              <div 
                title="Project" 
                onClick={() => setSelectedTab(0)}
                className={`left-icon ${enablePlayground ? selectedTab === 0 ? "left-icon-selected" : "left-icon-idle" : "left-icon-disabled"}`}>
                <i className="material-icons">folder_open</i>
              </div>
              <div 
                title="Imports Graph" 
                onClick={() => setSelectedTab(1)}
                className={`left-icon ${enablePlayground ? selectedTab === 1 ? "left-icon-selected" : "left-icon-idle" : "left-icon-disabled"}`}>
                <i className="material-symbols-outlined">tenancy</i>
              </div>
              <div 
                title="Logs" 
                onClick={() => setSelectedTab(2)}
                className={`left-icon ${enablePlayground ? selectedTab === 2 ? "left-icon-selected" : "left-icon-idle" : "left-icon-disabled"}`}>
                <i className="material-icons">list</i>
              </div>
            </div>
            <div className='right-space'>
              {
                enablePlayground ?
                  <>
                    {
                      selectedTab === 1 && <ImportsGraph socket={mainSocket} />
                    }
                    {
                      selectedTab === 2 && <Logs flashMessage={flashMessage} socket={mainSocket} />
                    }
                  </> :
                  <div className="banner">
                    {
                      banner.split("\n").map((i, key) => {
                        return <div key={key}>{i}</div>;
                      })
                    }
                  </div>
              }
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

function App() {
  return (
    <MainContainer />
  );
}

export default App;
