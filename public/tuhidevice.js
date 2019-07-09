"use strict";

var DBus = require('dbus');
var util = require('util');
var events = require('events');
var debug = require('debug')('tuhi:device');

const BUSNAME_TUHI = 'org.freedesktop.tuhi1'
const PATH_ROOT = '/org/freedesktop/tuhi1'
const INTF_DEVICE = 'org.freedesktop.tuhi1.Device'

var TuhiDevice = module.exports = function(tuhi, objpath) {
  var self = this;

    self.manager = tuhi;
    self.objectPath = objpath;
    self.iface = null;
    self.name = 'unknown';
    self.register_callback = null;
    self.drawings = [];
};

util.inherits(TuhiDevice, events.EventEmitter);

TuhiDevice.prototype.init = function(callback) {
  var self = this;

  self.manager.sessionBus.getInterface(BUSNAME_TUHI, self.objectPath, INTF_DEVICE, function(err, iface) {
    if (err) {
      if (callback)
        callback(err);
      return;
    }

    self.iface = iface;

    iface.on('PropertyChanged', function(name, value) {
      console.log("PropertyChanged: ", name, value);
      self.emit('PropertyChanged', name, value);
    });

    iface.on('ListeningStopped', function(why) {
      console.log("ListeningStopped: ", why);
      self.emit('ListeningStopped', why);
    });

    iface.on('ButtonPressRequired', function() {
      debug("ButtonPressRequired signal ");

      if (self.register_cb) {
        var cb = self.register_cb;
        self.register_cb = null;
        cb();
      }
    });

    iface.getProperties(function(err, props) {
      var promises = [];

      self.listening = props.Listening;

      props.DrawingsAvailable.forEach((ts) => {
        promises.push(new Promise((resolve, reject) => {
          self.iface.GetJSONData(1, ts, function(err, data) {
            if (err)
              reject(err)
            self.drawings.push(JSON.parse(data));
            resolve(data)
          });
        }));
      })

      promises.push(new Promise((resolve, reject) => {
        self.manager.systemBus.getInterface('org.bluez', props.BlueZDevice, 'org.bluez.Device1',
                                          function(err, bluez_iface) {
          if (err)
            reject(err);

          bluez_iface.getProperties(function(err, bluez_props) {
            self.name = bluez_props.Name;
            self.address = bluez_props.Address;
            debug('bluez device: ', self.name, ' (', self.address, ')');

            resolve(self.name);
          });
        });
      }));
      Promise.all(promises).then((values) => {
        callback(null);
      });
    });
  });
};

TuhiDevice.prototype.getDrawing = function(timestamp, callback) {
  var self = this;

  /* I don't know why we can't use the .finish approach here but if we do
   * so, it just hangs */
  self.iface.GetJSONData(1, timestamp, function(err, data) {
    callback(err, data);;
  });
};

TuhiDevice.prototype.startListening = function(callback) {
  var self = this;

  self.iface.StartListening.error = callback;
  self.iface.StartListening.finish = callback;
  self.iface.StartListening();
};

TuhiDevice.prototype.stopListening = function(callback) {
  var self = this;

  self.iface.StopListening.error = callback;
  self.iface.StopListening.finish = callback;
  self.iface.StopListening();
};

TuhiDevice.prototype.register = function(callback) {
  var self = this;

  self.register_cb = callback;
  self.iface.Register.error = callback;
  self.iface.Register.finish = callback;
  self.iface.Register();
};
