#!/usr/bin/env node

var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var JSON_NAME = 'network.json';
var SUPPLICANT_PATH = path.join('/etc', 'wpa_supplicant', 'wpa_supplicant.conf');
var MAX_WAIT_TIME = 20000;

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

function getHeadOfConf(filePath) {
  return fs.readFileSync(filePath).toString().replace(/network(.|\n)*$/, '');
}
exports.getHeadOfConf = getHeadOfConf;

function main() {
  // Find the USB flash drive
  var network;

  var root = '/media';
  fs.readdirSync(root).forEach(function (user) {
    try {
      fs.readdirSync(path.join(root, user)).forEach(function (drive) {
        network = getWifiInfo(path.join(root, user, drive, JSON_NAME));
      });
    } catch (e) {
      // Try, try again
      if (e.toString() === 'Error: Unable to read config file')
        throw e;
    }
  });

  if (!network) {
    console.error('Unable to find network.json');
    process.exit(1);
  }

  // Allow user to write either "ssid" or "name"
  console.log('Attempting to connect to ' + JSON.stringify(network.name));

  var templateConf = getHeadOfConf(SUPPLICANT_PATH);

  var networkString = 'network={\n' +
    '\tssid=' + JSON.stringify(network.name) + '\n' +
    '\tpsk=' + JSON.stringify(network.password) + '\n' +
    '}\n';

  fs.writeFileSync(SUPPLICANT_PATH, templateConf + networkString);

  console.log('Restarting network connection');
  exec('ifdown wlan0 && sleep 1 && ifup wlan0', function (err, response) {
    if (err) {
      console.error(err);
      process.exit(1);
    } else {
      function exitIfReady() {
        exec('hostname -I', function (err, output) {
          if (output.trimRight()) {
            // Exit as soon as this succeeds
            process.exit(0);
          }
        });
      }

      // Every 2 seconds, check to see if it succeeded
      for (var k=2000; k < MAX_WAIT_TIME; k+=2000) {
        setTimeout(function () {
          exitIfReady();
        }, k);
      }

      setTimeout(function () {
        console.error('Unable to get an IP address');
        process.exit(1);
      }, MAX_WAIT_TIME);
    }
  });
}

if (!module.parent) {
  main();
}
