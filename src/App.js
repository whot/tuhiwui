import React from 'react';
import './App.css';

const {ipcRenderer} = window.require('electron')

// A debug helper function that IPCs the message over to electron so it's
// printed on the tty together with all other stuff
function debug() {
  ipcRenderer.send('tuhi-debug', Array.prototype.join.call(arguments, ''))
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
	     Connection established
	</div>
      );
    else
      return (
	<div className="App">
	     Unable to connect to Tuhi
	</div>
      );
  }
}

export default App;
