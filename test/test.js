var rpiWifi = require('..');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');

require('should');

describe('rpi-wifi-setup', function() {
  var configObj = {
    ssid: 'TestNetwork',
    password: 'testPassWord'
  };
  var configObj2 = {};
  configObj2.name = configObj.ssid;
  configObj2.password = configObj.password;

  var testJSON = './file.json';
  var testSimple = './file.txt';

  beforeEach(function () {
    try {
      delete require.cache[require.resolve(path.resolve('..', testJSON))];
    } catch (e) {
    }
  });

  afterEach(function () {
    rimraf.sync(testJSON);
    rimraf.sync(testSimple);
  });

  it('can read JSON', function() {
    fs.writeFileSync(testJSON, JSON.stringify(configObj));
    var output = rpiWifi.getWifiInfo(testJSON);
    output.ssid.should.equal(configObj.ssid);
    output.password.should.equal(configObj.password);
  });

  it('can read JSON with capitalized attributes', function() {
    fs.writeFileSync(testJSON, JSON.stringify({
      SSID: configObj.ssid,
      PASSword: configObj.password
    }));
    var output = rpiWifi.getWifiInfo(testJSON);
    output.ssid.should.equal(configObj.ssid);
    output.password.should.equal(configObj.password);
  });

  it('can read JSON with "name" instead of "ssid"', function() {
    fs.writeFileSync(testJSON, JSON.stringify(configObj2));
    var output = rpiWifi.getWifiInfo(testJSON);
    output.ssid.should.equal(configObj2.name);
    output.password.should.equal(configObj2.password);
  });

  it('can read plain text', function() {
    fs.writeFileSync(testSimple, configObj.ssid + '\n' + configObj.password + '\n');
    var output = rpiWifi.getWifiInfo(testSimple);
    output.ssid.should.equal(configObj.ssid);
    output.password.should.equal(configObj.password);
  });

  it('cannot read missing file', function() {
    (function () {
      rpiWifi.getWifiInfo('fakeFileName.json');
    }).should.throw('Unable to read config file');
  });

  it('cannot read empty JSON', function() {
    fs.writeFileSync(testJSON, JSON.stringify({}));
    (function () {
      rpiWifi.getWifiInfo(testJSON);
    }).should.throw();
  });

  it('cannot read malformatted JSON', function() {
    fs.writeFileSync(testJSON, JSON.stringify({
      key: 'value'
    }));
    (function () {
      rpiWifi.getWifiInfo(testJSON);
    }).should.throw('Malformatted config file');
  });

  it('cannot read empty plain text', function() {
    fs.writeFileSync(testSimple, '');
    (function () {
      rpiWifi.getWifiInfo(testSimple);
    }).should.throw('Malformatted config file');
  });
});
