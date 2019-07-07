Setup instructions to get all this working from scratch.

We have 3 components:
- React for the UI
- electron
- our Tuhi-specific DBus accessors

The actual event flow is:
- the dbus javascript library (`tuhi.js`) connects to Tuhi. That happens in
  electron's main process where we have access to everything.
- the React-based UI runs in the renderer process and does not have access,
  so it needs to use(`ipcRenderer`, `ipcMain`) to send messages to
  the main process and extract the data.


Bootstrapping
=============

Steps to start from zero:

```
npx create-react-app tuhiwui
```

Now we have a basic react app, let's install all other dependencies:

```
cd tuhiwui
npm install --save-dev electron
npm install dbus
npm install electron-is-dev
npm install --save-dev electron-builder
npm install --save-dev electron-rebuild
./node_modules/.bin/electron-rebuild -p -t "dev,prod,optional"
```

Without that last command, node-dbus and electron aren't compatible and
you'll get version mismatches. Just run it once, and all is good. This may
not be necessary in the future.

Create `public/tuhiwui.js` and fill it with the default content you can
find online for electron apps. Do make sure that `nodeIntegration` is on
because otherwise we can't do IPC between electron and the render window.
And point the URL to the built `index.html`:
```
       win = new BrowserWindow({
                               width: 800, height: 600,
                               webPreferences: {
                                   nodeIntegration: true,
                               }})
       ...
       win.loadURL(`file://${path.join(__dirname, '../build/index.html')}`)
```

[This link](https://medium.com/@brockhoff/using-electron-with-react-the-basics-e93f9761f86f)
is useful, it's called `Main.js` there but otherwise the same.

Edit the `package.json` and make sure the following entries are present:
```
   "main": "public/tuhiwui.js",
   "homepage": "./",
   "scripts": { 
       ...
       electron-start": "electron .", 
   }
   ```

To test it you need to build it (which creates the `index.html`):
```
npm run build
npm run electron-start
```

Arguably the best thing about React is that it is interactive. While our
integrations won't work in a normal browser window, they do work in the
electron one. So we can point to localhost instead when we're not deploying:
```
    const isDev = require("electron-is-dev");
    if (isDev)
        win.loadURL('http://localhost:3000/')
    else
        win.loadURL(`file://${path.join(__dirname, '../build/index.html')}`)
```
And then in two different terminals:
```
npm start
npm run electron-start
```

This starts up an electron process that supports live editing as React
usually does.

npm start also opens `locahlhost:3000` in the default browser which will
immediately fail because for React we use `window.require('whatever')`
instead of a plain `require`, see
[here](https://github.com/electron/electron/issues/7300)
Ignore that, it won't matter.
