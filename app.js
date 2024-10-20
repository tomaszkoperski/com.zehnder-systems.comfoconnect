'use strict';

const Homey = require('homey');
const ComfoAirQ = require('node-comfoairq');

class ComfoConnectApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('App started init, reconnecting to bridge in a few seconds...');

    this.registered = false; // Is the app already registered in the bridge?
    this.connected = false; // Is currently connected with the bridge?
    this.reconnect = false; // Should reconnect with the bridge?

    this.bridgeSettings = {
      device: 'Homey PRO',
      uuid: '20200428000000000000000009080407',
      comfoair: this.homey.settings.get('ip'),
      pin: this.homey.settings.get('pin'),
      multicast: '224.0.0.1',
      debug: false,
      verbose: true,
    };

    this.bridgeStatus = {};

    this.homey.settings.on('set', async (key) => {
      if (this.connected) {
        await this.disconnect();
      }
      this.log('App settings updated...');
      this.bridgeSettings.pin = this.homey.settings.get('pin');
      this.bridgeSettings.comfoair = this.homey.settings.get('ip');
      this.log(`New IP: ${this.bridgeSettings.comfoair}`);
      this.log(`New PIN: ${this.bridgeSettings.pin}`);
      if (this.bridgeSettings.comfoair && this.bridgeSettings.pin) {
        this.log('Connecting using new config...');
        await this.connect();
      }
    });

    if (!this.bridgeSettings.comfoair || !this.bridgeSettings.pin) {
      this.log('ComfoConnect module not configured. Check config in app settings.');
      return;
    }

    this.keepAlive = this.keepAlive.bind(this);

    this.log('App init finished...');
  }

  async connect() {
    const initialTimeout = 10000; // Początkowe opóźnienie 1 sekunda
    let attempts = 0;

    while (true) {
      try {
        this.log('Connecting...');
        if (!this.bridgeSettings.comfoair || !this.bridgeSettings.pin) {
          throw new Error('ComfoConnect module not configured. Check config in app settings.');
        }

        this.log(`Bridge settings: ${JSON.stringify(this.bridgeSettings)}`);

        // create bridge
        try {
          this.bridge = new ComfoAirQ(this.bridgeSettings);
        } catch (err) {
          this.log(`Error creating bridge: ${err.message}`);
          throw err;
        }

        // discover - this opens up a UDP socket which waits indefinitely for connection. If the IP was bad, this will permanently block the port.
        // to fix that we're doing a Promise race here to abort and potentially destroy the bridge if this hangs
        let discoveryResult;
        try {
          discoveryResult = await Promise.race([
            this.bridge.discover().then(() => 'Bridge discovered.'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), initialTimeout * (2 ** attempts))),
          ]);
        } catch (err) {
          this.log(`Discovery error: ${err.message}`);
          throw err;
        }

        this.log(`Discovery result: ${discoveryResult}`);

        if (this.bridge._bridge.isdiscovered !== true) {
          this.bridge = null;
          throw new Error('Unable to discover the bridge');
        }

        if (this.registered === false) {
          try {
            await this.bridge.RegisterApp();
            this.log('Registering the app...');
          } catch (err) {
            this.log(`Error registering app: ${err.message}`);
            throw err;
          }
        }

        if (this.connected === false) {
          try {
            this.bridge.StartSession(true);
            this.log('Starting session...');
          } catch (err) {
            this.connected = false;
            this.reconnect = true;
            this.log(`Error starting session: ${err.message}`);
            throw err;
          }
        }

        this.enableSensors();

        this.bridge.on('receive', (data) => {
          this.log(`Received: ${JSON.stringify(data)}`);
          switch (data.result.kind) {
            case 'RegisterAppConfirm':
              this.registered = true;
              this.log('App registered successfully in ComfoConnect LAN C');
              break;
            case 'StartSessionConfirm':
              this.connected = true;
              this.log('An active connection was established with the ConfoConnect LAN C');
              break;
            case 'CnRpdoNotification':
              this.bridgeStatus[data.result.data.name] = data.result.data.data;
              break;
            default:
          }
        });

        this.bridge.on('disconnect', (reason) => {
          if (reason.state === 'OTHER_SESSION') {
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
        attempts++;
        const maxBackoffTime = 600000;
        const backoffTime = Math.min(initialTimeout * (2 ** attempts), maxBackoffTime);
        this.log(`Retrying connection in ${backoffTime / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
      }
    }
  }

  async enableSensors() {
    try {
      await this.bridge.RegisterSensor(67); // SENSOR_TEMPERATURE_PROFILE
      await this.bridge.RegisterSensor(81); // SENSOR_FAN_NEXT_CHANGE
      await this.bridge.RegisterSensor(117); // SENSOR_FAN_EXHAUST_DUTY
      await this.bridge.RegisterSensor(118); // SENSOR_FAN_SUPPLY_DUTY
      await this.bridge.RegisterSensor(227); // SENSOR_BYPASS_STATE
      await this.bridge.RegisterSensor(66); // SENSOR_BYPASS_ACTIVATION_MODE
      await this.bridge.RegisterSensor(221); // SENSOR_TEMPERATURE_SUPPLY
      await this.bridge.RegisterSensor(274); // SENSOR_TEMPERATURE_EXTRACT
      await this.bridge.RegisterSensor(275); // SENSOR_TEMPERATURE_EXHAUST
      await this.bridge.RegisterSensor(276); // SENSOR_TEMPERATURE_OUTDOOR
      await this.bridge.RegisterSensor(290); // SENSOR_HUMIDITY_EXTRACT
      await this.bridge.RegisterSensor(291); // SENSOR_HUMIDITY_EXHAUST
      await this.bridge.RegisterSensor(292); // SENSOR_HUMIDITY_OUTDOOR
      await this.bridge.RegisterSensor(294); // SENSOR_HUMIDITY_SUPPLY
      await this.bridge.RegisterSensor(119); // SENSOR_FAN_EXHAUST_FLOW
      await this.bridge.RegisterSensor(120); // SENSOR_FAN_SUPPLY_FLOW
      await this.bridge.RegisterSensor(121); // SENSOR_FAN_EXHAUST_SPEED
      await this.bridge.RegisterSensor(122); // SENSOR_FAN_SUPPLY_SPEED
      await this.bridge.RegisterSensor(128); // SENSOR_POWER_CURRENT
      await this.bridge.RegisterSensor(65); // SENSOR_FAN_SPEED_MODE
      await this.bridge.RegisterSensor(192); // SENSOR_DAYS_TO_REPLACE_FILTER
      await this.bridge.RegisterSensor(209); // SENSOR_CURRENT_RMOT
      await this.bridge.RegisterSensor(56); // SENSOR_CURRENT_RMOT
      await this.bridge.RegisterSensor(70); // SENSOR_FAN_MODE_SUPPLY
      await this.bridge.RegisterSensor(71); // SENSOR_FAN_MODE_EXHAUST
    } catch (err) {
      this.log(`Error when enabling sensors: ${err.message}`);
    }
  }

  async activate() {
    this.log('Device activated, reconnecting to bridge in a few seconds...');
    this.reconnect = true;
    await this.connect();
  }

  async disconnect() {
    this.reconnect = false;
    this.connected = false;
    try {
      await this.bridge.CloseSession();
    } catch (err) {
      this.log(`Error when disconnecting: ${err.message}`);
    }
  }

  async getInfo() {
    this.log('Finding the bridge for pairing...');
    if (this.bridge?.settings?.comfouuid !== undefined) {
      const device = {
        name: 'ComfoConnect LAN C',
        data: {
          id: this.bridge.settings.comfouuid.toString('hex'),
        },
      };
      this.log(`Found: ${device}`);
      return device;
    }
    this.log('Unable to find the bridge for pairing');
    return null;
  }

  async getReadings() {
    // this.log(`Bridge status: ${JSON.stringify(this.bridgeStatus)}`);
    return this.bridgeStatus;
  }

  async keepAlive() {
    try {
      if (!this.connected) {
        if (this.reconnect) {
          this.restartSession();
          return;
        }
        return;
      }
      this.bridge.KeepAlive();
      this.pushReadings();
      this.homey.setTimeout(this.keepAlive, 8000);
    } catch (err) {
      this.log(`Error in keepAlive: ${err.message}`);
    }
  }

  async pushReadings() {
    this.log('!!! Pushing readings...');
    const promises = [];

    try {
      const drivers = this.homey.drivers.getDrivers();
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const driver in drivers) {
        const devices = this.homey.drivers.getDriver(driver).getDevices();
        for (const device of devices) {
          if (device.__updateDevice) {
            promises.push(device.__updateDevice());
          }
        }
      }
      await Promise.all(promises);
      this.log('!!! Push ended.');
    } catch (err) {
      this.log(`Push error: ${err.message}`);
    }
  }

  restartSession() {
    try {
      this.bridge.StartSession(false);
      this.connected = true;
      this.enableSensors();
      // sometimes, immediately after reconnecting, the device can push 0s for all values.
      // a not-to-elegant way to solve is just wait for it to settle down
      this.homey.setTimeout(this.keepAlive, 20000);
    } catch (err) {
      this.connected = false;
      this.reconnect = true;
      this.log(`Unable to restartSession: ${err.message}`);
    }
  }

  sendCommand(command) {
    try {
      this.bridge.SendCommand(1, command);
    } catch (err) {
      this.connected = false;
      this.reconnect = true;
      this.log(`Unable to sendCommand: ${err.message}`);
    }
  }

  setSpeed(value) {
    this.log(`Setting fan mode to ${value}`);
    switch (value) {
      case '0':
        this.sendCommand('FAN_MODE_AWAY');
        break;
      case '1':
        this.sendCommand('FAN_MODE_LOW');
        break;
      case '2':
        this.sendCommand('FAN_MODE_MEDIUM');
        break;
      case '3':
        this.sendCommand('FAN_MODE_HIGH');
        break;
      default:
    }
  }

  setOperatingMode(value) {
    this.log(`Setting operating mode to ${value}`);
    switch (value) {
      case '1':
        this.sendCommand('MODE_MANUAL');
        break;
      case '-1':
        this.sendCommand('MODE_AUTO');
        break;
      default:
    }
  }

  setBoost(value) {
    this.log(`Setting boost mode to ${value}`);
    switch (value) {
      case '1':
        this.sendCommand('FAN_BOOST_10M');
        break;
      case '2':
        this.sendCommand('FAN_BOOST_20M');
        break;
      case '3':
        this.sendCommand('FAN_BOOST_30M');
        break;
      case '0':
        this.sendCommand('FAN_BOOST_END');
        break;
      default:
    }
  }

  setVentilationMode(value) {
    this.log(`Setting ventilation mode to ${value}`);
    switch (value) {
      case '1':
        this.sendCommand('VENTMODE_SUPPLY_OFF');
        this.sendCommand('VENTMODE_EXTRACT_OFF');
        break;
      case '2':
        this.sendCommand('VENTMODE_SUPPLY');
        this.sendCommand('VENTMODE_EXTRACT_OFF');
        break;
      case '3':
        this.sendCommand('VENTMODE_EXTRACT');
        this.sendCommand('VENTMODE_SUPPLY_OFF');
        break;
      default:
    }
  }

  setBypass(value) {
    this.log(`Setting bypass mode to ${value}`);
    switch (value) {
      case '0':
        this.sendCommand('BYPASS_AUTO');
        break;
      case '1':
        this.sendCommand('BYPASS_ON');
        break;
      case '2':
        this.sendCommand('BYPASS_OFF');
        break;
      default:
    }
  }

}

module.exports = ComfoConnectApp;
