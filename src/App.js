import React from 'react';
import './App.css';

const {ipcRenderer} = window.require('electron')

// A debug helper function that IPCs the message over to electron so it's
// printed on the tty together with all other stuff
function debug() {
  ipcRenderer.send('tuhi-debug', Array.prototype.join.call(arguments, ''))
}

class DeviceNameEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    return (
            <div className="DeviceName">{this.props.device.name}</div>
    )
  }
}

// The panel shown when we have a connection
class PanelConnected extends React.Component {
  constructor(props) {
    super(props);
    this.state = {"devices": []}
  }

  componentDidMount() {
    ipcRenderer.on('tuhi-devices', (event, arg) => {
      this.setState({"devices": arg.devices})
    })
    ipcRenderer.send('tuhi-devices', null);

  }

  render () {
    const devices = this.state.devices.map((d) =>
       <DeviceNameEntry key={d} device={d} />
    )
    return (
            <div id="PanelConnected">
            <div id="NewDevice">
              add new device
            </div>
              {devices}
            </div>
    )
  }
}

// The panel shown when we cannot connect to Tuhi
class PanelNotConnected extends React.Component {
  handleClick(e) {
    ipcRenderer.send('tuhi-connect')
  }

  render() {
    return (
            <div id="PanelNotConnected">
              Disconnected
              <div className="helperText">
                Unable to connect to the Tuhi DBus service
              </div>
               <div id="reconnect">
                 <button className="animated" onClick={this.handleClick}>reconnect</button>
               </div>
            </div>
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {"connected": false, "device": "none"};
  }

  componentDidMount() {
    ipcRenderer.on('tuhi-connection-status', (event, arg) => {
      debug('connection status: ', arg.status);
      this.setState({'connected': arg.status})
    })

    ipcRenderer.send('tuhi-connect', null)
  }

  render() {
    const panel = this.state.connected ? <PanelConnected /> : <PanelNotConnected />
    return (
      <div className="App">{panel}</div>
    );
  }
}

export default App;
