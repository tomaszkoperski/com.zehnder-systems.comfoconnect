'use strict';

const { Device } = require('homey');

class ComfoConnectLanC extends Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('ComfoConnect LAN C has been initialized');
    this.homey.app.activate();

    this.registerCapabilityListener('fan_speed_mode', async (value) => {
      this.log(`Setting fan mode to ${value}`);
      switch (value) {
        case "0":
          this.homey.app.sendCommand('FAN_MODE_AWAY');
          break;
        case "1":
          this.homey.app.sendCommand('FAN_MODE_LOW');
          break;
        case "2":
          this.homey.app.sendCommand('FAN_MODE_MEDIUM');
          break;
        case "3":
          this.homey.app.sendCommand('FAN_MODE_HIGH');
          break;
        default:
      }
    });

    this.registerCapabilityListener('operating_mode', async (value) => {
      this.log(`Setting operating mode to ${value}`);
      switch (value) {
        case "1":
          this.homey.app.sendCommand('MODE_MANUAL');
          break;
        case "-1":
          this.homey.app.sendCommand('MODE_AUTO');
          break;
        default:
      }
    });

    //await this.__updateDevice();

  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('ComfoConnect LAN C has been added');
    //this.__updateDevice();
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {

    try {
      this.log('ComfoConnect LAN C settings where changed');

      this.log(`ChangedKeys: ${JSON.stringify(changedKeys)}`);

      for (const key of changedKeys) {
        if (key == "vent_mode") {
          this.log(`Changing vent mode to ${newSettings.vent_mode}`);
          switch (newSettings.vent_mode) {
            case 'balance':
              this.homey.app.sendCommand('VENTMODE_BALANCE');
              break;
            case 'supply':
              this.homey.app.sendCommand('VENTMODE_SUPPLY');
              break;
            case 'extract':
              this.homey.app.sendCommand('VENTMODE_EXTRACT');
              break;
            default:
          }
        }

        if (key == "bypass") {
          this.log(`Changing vent mode to ${newSettings.bypass}`);
          switch (newSettings.bypass) {
            case 'auto':
              this.homey.app.sendCommand('BYPASS_AUTO');
              break;
            case 'on':
              this.homey.app.sendCommand('BYPASS_ON');
              break;
            case 'off':
              this.homey.app.sendCommand('BYPASS_OFF');
              break;
            default:
          }
        }

        if (key == "temp_profile") {
          this.log(`Changing vent mode to ${newSettings.temp_profile}`);
          switch (newSettings.temp_profile) {
            case 'warm':
              this.homey.app.sendCommand('TEMPPROF_WARM');
              break;
            case 'normal':
              this.homey.app.sendCommand('TEMPPROF_NORMAL');
              break;
            case 'cool':
              this.homey.app.sendCommand('TEMPPROF_COOL');
              break;
            default:
          }
        }

        this.__updateDevice();

      }
    } catch (err) {
      this.log(`Error when updating settings: ${err.message}`);
    }

  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('ComfoConnect LAN C was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('ComfoConnect LAN C has been deleted');
    this.homey.app.disconnect();
  }

  async __updateDevice() {
    this.log('Updating device...');
    try {
      const r = await this.homey.app.getReadings();
      this.setCapabilityValueLog('fan_duty.exhaust', r.SENSOR_FAN_EXHAUST_DUTY);
      this.setCapabilityValueLog('fan_duty.supply', r.SENSOR_FAN_SUPPLY_DUTY);
      this.setCapabilityValueLog('measure_power', r.SENSOR_POWER_CURRENT);
      this.setCapabilityValueLog('fan_speed_mode', r.SENSOR_FAN_SPEED_MODE.toString());
      this.setCapabilityValueLog('operating_mode', r.SENSOR_OPERATING_MODE.toString());
      this.setCapabilityValueLog('days_to_replace_filter', r.SENSOR_DAYS_TO_REPLACE_FILTER);

      this.setCapabilityValueLog('measure_humidity.supply', r.SENSOR_HUMIDITY_SUPPLY);
      this.setCapabilityValueLog('measure_humidity.extract', r.SENSOR_HUMIDITY_EXTRACT);
      this.setCapabilityValueLog('measure_humidity.outdoor', r.SENSOR_HUMIDITY_OUTDOOR);
      this.setCapabilityValueLog('measure_humidity.exhaust', r.SENSOR_HUMIDITY_EXHAUST);

      this.setCapabilityValueLog('measure_temperature.supply', r.SENSOR_TEMPERATURE_SUPPLY);
      this.setCapabilityValueLog('measure_temperature.exhaust', r.SENSOR_TEMPERATURE_EXHAUST);
      this.setCapabilityValueLog('measure_temperature.extract', r.SENSOR_TEMPERATURE_EXTRACT);
      this.setCapabilityValueLog('measure_temperature.outdoor', r.SENSOR_TEMPERATURE_OUTDOOR);

      this.setAvailable();
    } catch (err) {
      this.setUnavailable(this.homey.__('device_unavailable')).catch(this.error);
      this.log(`Error in __updateDevice: ${err.message}`);
    }
  }

  async setCapabilityValueLog(capability, value) {
    this.log(`setCapability ${capability}: ${value}`);
    try {
      await this.setCapabilityValue(capability, value);
    } catch (err) {
      this.log(`setCapabilityValueLog error ${capability} ${err.message}`);
    }
  }

}

module.exports = ComfoConnectLanC;
