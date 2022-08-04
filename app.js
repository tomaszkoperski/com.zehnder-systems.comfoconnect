'use strict';

const Homey = require('homey');
const comfoconnect = require('node-comfoairq');
const fetch = require('node-fetch');
const cache = require('node-cache');
const {
  throws
} = require('assert');

class ComfoConnectApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('App started init, reconnecting to bridge in a few seconds...');

    this.registered = false; //Is the app already registered in the bridge?
    this.connected = false; //Is currently connected with the bridge?
    this.reconnect = false; //Should reconnect with the bridge?

    this.bridgeSettings = {
      device: 'Homey PRO',
      uuid: '20200428000000000000000009080407',
      comfoair: this.homey.settings.get('ip'),
      pin: this.homey.settings.get('pin'),
      multicast: '224.0.0.1',
      debug: false,
      verbose: true
    };

    this.bridgeStatus = {}

    this.homey.settings.on('set', async key => {
      if (this.connected) { await this.disconnect(); }
      this.log('App settings updated...');
      this.bridgeSettings.pin = this.homey.settings.get('pin');
      this.bridgeSettings.comfoair = this.homey.settings.get('ip');
      this.log(`New IP: ${this.bridgeSettings.comfoair}`);
      this.log(`New PIN: ${this.bridgeSettings.pin}`);
      if (this.bridgeSettings.comfoair && this.bridgeSettings.pin) {
        this.log(`Connecting using new config...`)
        await this.connect();
      }
      return;
    });

    if (!this.bridgeSettings.comfoair || !this.bridgeSettings.pin) {
      this.log('ComfoConnect module not configured. Check config in app settings.');
      return;
    }
    
    this.keepAlive = this.keepAlive.bind(this);

    this.log('App init finished...');
  }

  async connect() {
    try {
      this.log(`Connecting...`);
      if (!this.bridgeSettings.comfoair || !this.bridgeSettings.pin) {
        throw new Error('ComfoConnect module not configured. Check config in app settings.');
      }

      this.log(`Bridge settings: ${JSON.stringify(this.bridgeSettings)}`);

      // create bridge
      this.bridge = new comfoconnect(this.bridgeSettings);

      // discover - this opens up a UDP socket which waits indefinitely for connection. If the IP was bad, this will permanently block the port.
      // to fix that we're doing a Promise race here to abort and potentially destroy the bridge if this hangs
      await Promise.race([
        this.bridge.discover(),
        new Promise((resolve) => setTimeout(resolve, 10000))
      ]);
 
      if (this.bridge._bridge.isdiscovered != true) {
        this.bridge = null;
        delete this.bridge;
        throw new Error('Unable to discover the bridge');
      }

      if (this.registered == false) {
        await this.bridge.RegisterApp();
        this.log("Registering the app...")
      }

      if (this.connected == false) {
        this.bridge.StartSession(true);
        this.log("Starting session...")
      }

      this.enableSensors();

      //this.log(this.bridge);

      this.bridge.on('receive', (data) => {
        this.log(`Received: ${JSON.stringify(data)}`);
        switch (data.result.kind) {
          case 'RegisterAppConfirm':
            this.registered = true;
            this.log("App registered successfully in ComfoConnect LAN C");
            break;
          case 'StartSessionConfirm':
            this.connected = true;
            this.log("An active connection was established with the ConfoConnect LAN C");
            break;
          case 'CnRpdoNotification':
            var variable = data.result.data.name;
            this.bridgeStatus[variable] = data.result.data.data;
          default:
        }
      });

      this.bridge.on('disconnect', (reason) => {
        if (reason.state == 'OTHER_SESSION') {
          this.log('other device became active');
          this.reconnect = true;
        }
        this.connected = false;
      });

      this.homey.setTimeout(this.keepAlive, 8000);
      return true;

    } catch (err) {
      this.log(`Error when connecting: ${err.message}`);
      this.connected = false;
      return false;
    }

  }

  async enableSensors() {
    try {
      await this.bridge.RegisterSensor(67); // SENSOR_TEMPERATURE_PROFILE
      //await this.bridge.RegisterSensor(121); // SENSOR_FAN_EXHAUST_SPEED
      //await this.bridge.RegisterSensor(122); // SENSOR_FAN_SUPPLY_SPEED
      await this.bridge.RegisterSensor(117); // SENSOR_FAN_EXHAUST_DUTY
      await this.bridge.RegisterSensor(118); // SENSOR_FAN_SUPPLY_DUTY
      await this.bridge.RegisterSensor(227); // SENSOR_BYPASS_STATE
      await this.bridge.RegisterSensor(221); // SENSOR_TEMPERATURE_SUPPLY
      await this.bridge.RegisterSensor(274); // SENSOR_TEMPERATURE_EXTRACT
      await this.bridge.RegisterSensor(275); // SENSOR_TEMPERATURE_EXHAUST
      await this.bridge.RegisterSensor(276); // SENSOR_TEMPERATURE_OUTDOOR
      await this.bridge.RegisterSensor(290); // SENSOR_HUMIDITY_EXTRACT
      await this.bridge.RegisterSensor(291); // SENSOR_HUMIDITY_EXHAUST
      await this.bridge.RegisterSensor(292); // SENSOR_HUMIDITY_OUTDOOR
      await this.bridge.RegisterSensor(294); // SENSOR_HUMIDITY_SUPPLY
      await this.bridge.RegisterSensor(128); // SENSOR_POWER_CURRENT
      await this.bridge.RegisterSensor(65); // SENSOR_FAN_SPEED_MODE
      await this.bridge.RegisterSensor(192); // SENSOR_DAYS_TO_REPLACE_FILTER
      await this.bridge.RegisterSensor(209); // SENSOR_CURRENT_RMOT
      await this.bridge.RegisterSensor(56); // SENSOR_CURRENT_RMOT
    } catch (err) {
      this.log(`Error when enabling sensors: ${err.message}`);
    }
  }


  async activate() {
    this.reconnect = true;
    await this.connect();
  }


  async disconnect() {
    this.reconnect = false;
    await this.bridge.CloseSession();
    this.connected = false;
  }


  async getInfo() {
    if (typeof this.bridge.settings.comfouuid !== undefined) {
      let device = {
        name: 'ComfoConnect LAN C',
        data: {
          id: this.bridge.settings.comfouuid.toString('hex')
        }
      }
      return device;
    }
    return null;
  }


  async getReadings() {
    return this.bridgeStatus;
  }


  async keepAlive() {
    if (!this.connected) {
      if (this.reconnect) {
        this.restartSession();
      }
      return;
    }
    this.bridge.KeepAlive();
    this.pushReadings();
    this.homey.setTimeout(this.keepAlive, 8000);
  }


  async pushReadings() {
    this.log("!!! Pushing readings...");
    const promises = [];

    try {
      const drivers = this.homey.drivers.getDrivers();
      for (const driver in drivers) {
        let devices = this.homey.drivers.getDriver(driver).getDevices();
        for (const device of devices) {
          if (device.__updateDevice) {
            promises.push(device.__updateDevice());
          }
        }
      }
      await Promise.all(promises);
      this.log("!!! Push ended.");
    } catch (err) {
      this.log(`Push error: ${err.message}`)
    }
  }


  restartSession() {
    try {
      this.bridge.StartSession(false);
      this.enableSensors();
      this.homey.setTimeout(this.keepAlive, 8000);
    } catch (err) {
      this.log(`Unable to restartSession: ${err.message}`);
    }
  }


  sendCommand(command) {
    try {
      this.bridge.SendCommand(1, command);
    } catch (err) {
      this.log(`Unable to sendCommand: ${err.message}`);
    }
  }

  setSpeed(value) {
    this.log(`Setting fan mode to ${value}`);
    switch (value) {
      case "0":
        this.sendCommand('FAN_MODE_AWAY');
        break;
      case "1":
        this.sendCommand('FAN_MODE_LOW');
        break;
      case "2":
        this.sendCommand('FAN_MODE_MEDIUM');
        break;
      case "3":
        this.sendCommand('FAN_MODE_HIGH');
        break;
      default:
    }
  }


  setOperationgMode(value) {
    this.log(`Setting operating mode to ${value}`);
    switch (value) {
      case "1":
        this.sendCommand('MODE_MANUAL');
        break;
      case "-1":
        this.sendCommand('MODE_AUTO');
        break;
      default:
    }
  }


  setBoost(value) {
    this.log(`Setting boost mode to ${value}`);
    switch (value) {
      case "1":
        this.sendCommand('FAN_BOOST_10M')
        break;
      case "2":
        this.sendCommand('FAN_BOOST_20M')
        break;
      case "3":
        this.sendCommand('FAN_BOOST_30M')
        break;
      case "0":
        this.sendCommand('FAN_BOOST_END')
        break;
      default:
    }
  }

}

module.exports = ComfoConnectApp;