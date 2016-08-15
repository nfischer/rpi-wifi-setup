#!/usr/bin/env node

// Install into /etc/rc.local
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;

var FILENAME = 'rpi-wifi-setup-rc-script.sh';
var scriptPath = path.dirname(__dirname);
var scriptName = path.join(scriptPath, FILENAME);

console.log('Creating rc-script wrapper');

var nodePath = process.execPath;

fs.writeFileSync(scriptName, [
  '#!/bin/bash',
  'cur_dir=$(dirname "$0")',
  nodePath + ' "${cur_dir}/index.js"',
].join('\n'));

exec('chmod a+rwx ' + scriptName);

console.log('Installing into /etc/rc.local');

var injectedLines = [
  '# Automatically connect to new wifi networks (must auto-mount flash drive)',
  'mkdir -p /media/pi/flashdrive',
  '/bin/mount /dev/sda1 /media/pi/flashdrive',
  'if [ -z "$(hostname -I)" ]; then',
  '  ' + scriptName + ' &>/tmp/rpi-wifi.log',
  'fi'
];

try {
  var oldRcLocal = fs.readFileSync('/etc/rc.local').toString().split('\n');

  var newRcLocal = [];
  oldRcLocal.forEach(function (line) {
    if (line.match(/^exit/)) {
      newRcLocal = newRcLocal.concat(injectedLines);
    }
    newRcLocal.push(line);
  });

  fs.writeFileSync('/etc/rc.local', newRcLocal.join('\n'));
} catch (e) {
  console.error(">> Make sure you're running this as root <<");
  console.error("===========================================\n");
  throw e;
}
