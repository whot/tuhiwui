/* DBus bindings for Tuhi */

"use strict";

var DBus = require('dbus');
var util = require('util');
var events = require('events');
var debug = require('debug')('tuhi');
var TuhiDevice = require('./tuhidevice');

const BUSNAME_TUHI = 'org.freedesktop.tuhi1'
const PATH_ROOT = '/org/freedesktop/tuhi1'
const INTF_MANAGER = 'org.freedesktop.tuhi1.Manager'

var dbus = new DBus();

var Tuhi = module.exports = function() {
  var self = this;

  self.connected = false;
  self.dbus = dbus;
  self.sessionBus = dbus.getBus('session');
  self.systemBus = dbus.getBus('system'); // for BlueZ
  self.manager = null;
  self.searching = false;
  self.devices = [];

  self.unregistered_device_cb = null;
};

util.inherits(Tuhi, events.EventEmitter);

Tuhi.prototype.init = function(callback) {
  var self = this;

  self.sessionBus.getInterface(BUSNAME_TUHI, PATH_ROOT, INTF_MANAGER, function(err, iface) {
    if (err) {
      console.log('error: ' + err);
      if (callback)
        callback(err);
      return;
    }

    self.manager = iface;

    iface.getProperty('Devices', function(err, devices) {
      devices.map(function(d) {
        var device = new TuhiDevice(self, d);
        device.init(function(err) {
          if (err) {
            console.log('error: ', err);
            return;
          }

          self.devices.push(device)
          self.emit('DeviceAdded', device);
        });
      });
    });

    iface.getProperty('Searching', function(err, value) {
      self.searching = value;
    });

    /* FIXME: should be hidden away */
    self.manager.on('PropertyChanged', function(name, value) {
      console.log('PropertyChanged: ', name, value);
      self.emit('PropertyChanged', name, value);
    });

    self.manager.on('SearchStopped', function(val) {
      console.log('SearchStopped', val);
      self.searching = false;
      self.emit('SearchStopped', value);
    });

    self.manager.on('UnregisteredDevice', function(objpath) {
      debug('unregisteredDevice', objpath);
      if (!self.unregistered_device_cb)
        return;

      var device = new TuhiDevice(self, objpath);
      device.init(function(err) {
        if (err) {
          console.log('error: ', err);
          return;
        }
        self.unregistered_device_cb(null, device);
      });
    });

    self.connected = true;
    if (callback)
      callback();
  });
};

Tuhi.prototype.getProperties = function(callback) {
  var self = this;

  if (!callback)
    return;

  self.manager.GetProperties.error = callback;
  self.manager.GetProperties.finish = function(props) { callback(null, props); };
  self.manager.GetProperties();
};

Tuhi.prototype.startSearch = function(callback) {
  var self = this;

  self.manager.StartSearch(function(err) {
    if (err) {
      if (callback)
        callback(err);
      return;
    }

    self.unregistered_device_cb = callback;
  });
};

Tuhi.prototype.stopSearch = function(callback) {
  var self = this;

  self.unregistered_device_cb = null;

  self.manager.StopSearch.error = callback;
  self.manager.StopSearch.finish = function () {
    callback(null);
  };
  self.manager.StopSearch();
};
