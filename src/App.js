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
            <div>{this.props.device.name}</div>
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
       <DeviceNameEntry device={d} />
    )
    return (
            <div id="PanelConnected">
              {devices}
            <div id="new device">
              Add new device
            </div>
            </div>
    )
  }
}

// The panel shown when we cannot connect to Tuhi
class PanelNotConnected extends React.Component {
  render() {
    return (
            <div id="PanelNotConnected">
              Unable to establish a connection to Tuhi.
              <div className="helpeText">
                The DBus service may not be running.
              </div>
            </div>
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state ={"connected": false, "device": "none"};
  }

  componentDidMount() {
    ipcRenderer.on('tuhi-connection-status', (event, arg) => {
      debug('connection status: ', arg.status);
      this.setState({'connected': arg.status})
    })

    ipcRenderer.send('tuhi-connect', null)
  }

  render() {
    if (this.state.connected)
      return (
	<div className="App">
              <PanelConnected />
	</div>
      );
    else
      return (
	<div className="App">
              <PanelNotConnected />,
        </div>
      )
  }
}

export default App;
