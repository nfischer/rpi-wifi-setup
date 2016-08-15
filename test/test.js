var exec = require('child_process').exec;
var rpiWifi = require('..');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');

require('should');

describe('rpi-wifi-setup', function() {
  describe('getWifiInfo', function () {
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

    it('cannot read empty JSON', function() {
      fs.writeFileSync(testSimple, '');
      (function () {
        rpiWifi.getWifiInfo(testSimple);
      }).should.throw('Malformatted config file');
    });
  });

  describe('getHeadOfConf', function() {
    var testConf1 = path.join('test', 'sample1.conf')
    var testConf2 = path.join('test', 'sample2.conf')

    it('works for an empty file', function() {
      var output = rpiWifi.getHeadOfConf(testConf1);
      output.should.not.match(/network/);
    });

    it('works for a file that has network info', function() {
      var output = rpiWifi.getHeadOfConf(testConf2);
      output.should.not.match(/network/);
    });
  });

  describe('dependencies', function() {
    it('child_process', function() {
      exec.should.be.type('function');
    });

    it('fs', function() {
      fs.readFileSync.should.be.type('function');
      fs.writeFileSync.should.be.type('function');
    });
  });
});
