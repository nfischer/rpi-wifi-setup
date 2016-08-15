# rpi-wifi-setup

## Installation

```
$ npm install -g rpi-wifi-setup
```

## Description

This npm package is designed to be installed globally on your Raspberry Pi to
allow you to easily connect to Wifi Networks in a headless state.

Simply install this module globally, and boot up your pi with a flash drive connected. The flash drive should have a file at the top level named **`network.json`**that looks like this:

```json
{
  "name": "nameOfWifiNetwork",
  "password": "passwordToWifiNetwork"
}
```

The Raspberry pi will automatically use these credentials to connect to the
network. Easy!
