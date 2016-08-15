#!/usr/bin/env node

var wifi = require('wifi-control');
var child_process = require('child_process');
var path = require('path');
var fs = require('fs');
var JSON_NAME = 'network.json';

function getWifiInfo(file) {
  var info;
  var modName = null;
  try {
    modName = require.resolve(file);
    info = require(file);
    if (modName) delete require.cache[modName];
  } catch (e) {
    try {
      info = {};
      var lines = fs.readFileSync(file).toString().split('\n');
      info.ssid = lines[0];
      info.password = lines[1];
    } catch (e) {
      throw new Error('Unable to read config file');
    }
  }

  // Normalize the info
  Object.keys(info).forEach(function (key) {
    // All keys should be lowercase
    info[key.toLowerCase()] = info[key];
  });
  // Prefer 'ssid' over 'name'
  info.ssid = info.ssid || info.name;

  // Must at least have an SSID
  if (!info.ssid) {
    throw new Error('Malformatted config file');
  }

  return info;
}
exports.getWifiInfo = getWifiInfo;

function main() {
  // Find the USB flash drive
  var network;

  var root = '/media';
  fs.readdirSync(root).forEach(function (user) {
    try {
      fs.readdirSync(path.join(root, user)).forEach(function (drive) {
        try {
          network = getWifiInfo(path.join(root, user, drive, JSON_NAME));
        } catch (e) {
          // Nothing
        }
      });
    } catch (e2) {
      // Try, try again
    }
  });

  if (!network) {
    console.error('Unable to find network.json');
    process.exit(1);
  }

  // Allow user to write either "ssid" or "name"
  console.log('Attempting to connect to ' + JSON.stringify(network.name));

  // Initialize the wifi module
  wifi.init();

  wifi.connectToAP(network, function (err, response) {
    if (err) console.error(err);
    console.log(response.msg || response);
    process.exit(err ? 1 : 0);
  });
}

if (!module.parent) {
  main();
}
