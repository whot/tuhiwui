tuhi-wui
========

Tuhi is a DBus session daemon that connects to and fetches the data from the
Wacom ink range (Spark, Slate, Folio, Intuos Paper, ...). See
https://github.com/tuhiproject/tuhi for more information.

tuhi-wui is a graphical user interface to access Tuhi and allow users to
register devices and download drawings from those devices.

tuhi-wui uses electron and React.

Note: this is very much a "my first web app", any feedback will be
appreciated.


Building
--------

```
  cd tuhiwui
  npm install -y
  ./node_modules/.bin/electron-rebuild -p -t "dev,prod,optional"
```

That last step removes the `NODE_MODULE_VERSION` 64 vs 70 mismatch that the
dbus module will complain about.


Running
-------

First, start the Tuhi DBus daemon. Then you can start tuhiwui.

```
  cd tuhiwui
  npm start # This will start the development server
  npm run electron-start # This will start the actual UI
```

The development server is to make quick iteration simpler, if you've ever
done React before you'll know what this is anyway.
