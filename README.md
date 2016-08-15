# rpi-wifi-setup

[![Travis](https://img.shields.io/travis/nfischer/rpi-wifi-setup.svg?style=flat-square)](https://travis-ci.org/nfischer/rpi-wifi-setup)

## Installation

```
$ sudo npm install -g rpi-wifi-setup
$ sudo rpi-wifi-setup install
```

## Description

This npm package is designed to be installed globally on your Raspberry Pi to
allow you to easily connect to Wifi Networks in a headless state.

Simply install this module globally with the above steps, and boot up your pi
while a flash drive is connected. The flash drive should have a file at the top
level named **`network.json`**that looks like this:

```
/media
  /username
    /flashDriveName
      network.json
```

Inside `network.json`:

```json
{
  "name": "nameOfWifiNetwork",
  "password": "passwordToWifiNetwork"
}
```

The Raspberry pi will automatically use these credentials to connect to the
network. Easy!
