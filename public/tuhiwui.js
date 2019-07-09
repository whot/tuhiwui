const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const {ipcMain} = require('electron')
const isDev = require('electron-is-dev')
const Tuhi = require('./tuhi');

var debug = require('debug')('tuhiwui');
var debug_react = require('debug')('tuhi-react');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Remove menubar
  Menu.setApplicationMenu(null); // https://github.com/electron/electron/issues/16521

  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  if (isDev) {
    console.log('Running in developer mode for http://localhost:3000')
    win.loadURL('http://localhost:3000')
    win.webContents.openDevTools()
  } else {
    win.loadURL(`file://${path.join(__dirname, '../build/index.html')}`)
  }


  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// Tuhi IPC communication protocol
//
// tuhi-connect(void)
//   -> tuhi-connection-status({connection: bool})
//   Establish initial connection to Tuhi
//
// tuhi-devices(void)
//   -> tuhi-devices({devices: [devices] })
//   Return a list of available devices


ipcMain.on('tuhi-connect', function (event, arg) {
  debug('connecting to tuhi')
  tuhi = new Tuhi();
  tuhi.init(function(error) {
    if (error) {
      debug('Failed to connect to Tuhi')
      event.sender.send('tuhi-connection-status', {status: false});
      return;
    }

    ipcMain.on('tuhi-devices', function(event, arg) {
      debug('fetching devices')
      event.sender.send('tuhi-devices', {"devices": tuhi.devices});
    });


    event.sender.send('tuhi-connection-status', {"status": true});
  });
});


ipcMain.on('tuhi-debug', function(event, arg) {
  debug_react(arg);
});
