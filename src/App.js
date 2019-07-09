import React from 'react';
import './App.css';

const {ipcRenderer} = window.require('electron')

// A debug helper function that IPCs the message over to electron so it's
// printed on the tty together with all other stuff
function debug() {
  ipcRenderer.send('tuhi-debug', Array.prototype.join.call(arguments, ''))
}

// A single entry in the list of devices
class DeviceNameEntry extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClick(e) {
    e.preventDefault();
    console.log('The link was clicked.');
  }

  render() {
    return (
            <div onClick={this.handleClick} className="DeviceName">{this.props.device.name}</div>
    )
  }
}

class DevicePanel extends React.Component {
  render() {
    return (
            <div className="DevicePanel">
              <div className="DeviceName">
                {this.props.device.name}
              </div>
            </div>
    )
  }
}

class AddNewDevicePanel extends React.Component {
  render() {
    return <div id="NewDevice">add new device</div>
  }
}

// The panel shown when we have a connection
class PanelConnected extends React.Component {
  constructor(props) {
    super(props);
    /* It's so niche that someone has two devices (other than us
     * developers), so let's just focus on whatever the first
     * device is. We'll eventually need some button to add devices or switch
     * between them.
     */
    this.state = {"devices": [],
                  "activeidx": 0}
  }

  componentDidMount() {
    ipcRenderer.on('tuhi-devices', (event, arg) => {
      this.setState({"devices": arg.devices})
    })
    ipcRenderer.send('tuhi-devices', null)
  }

  render () {
    var panel;
    if (this.state.devices.length) {
      const active = this.state.devices[this.state.activeidx]
      panel = <DevicePanel device={active} />
    } else {
      panel = <AddNewDevicePanel />
    }
    return (
            <div id="PanelConnected">
            {panel}
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
