'use strict';

const {
  Device,
} = require('homey');

class ComfoConnectLanC extends Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('ComfoConnect LAN C has been initialized');

    const capabilitiesToAdd = [
      'measure_airflow.supply', 'measure_airflow.exhaust', 'ventilation_mode',
      'measure_fan_speed.supply', 'measure_fan_speed.exhaust',
      'boost', 'fan_next_change', 'measure_fan_duty.supply', 'measure_fan_duty.exhaust',
      'bypass_state', 'bypass_mode', 'temperature_profile', 'operating_mode', 'fan_speed_mode',
      'measure_avoided.heating', 'measure_avoided.heating_total', 'measure_avoided.cooling', 'measure_avoided.cooling_total',
      'measure_rmot',
    ];

    for (const capability of capabilitiesToAdd) {
      if (!this.hasCapability(capability)) {
        try {
          await this.addCapability(capability);
          this.log(`Capability ${capability} added`);
        } catch (err) {
          this.error(`Error adding capability ${capability}: ${err.message}`);
        }
      }
      const lastKnownValue = await this.getStoreValue(capability);
      if (lastKnownValue !== null) {
        this.setCapabilityValue(capability, lastKnownValue)
          .catch((err) => this.log(`Error setting capability ${capability}: ${err.message}`));
      }
    }

    await this.homey.app.activate();

    this.registerCapabilityListener('fan_speed_mode', async (value) => {
      this.log(`Setting fan mode to ${value}`);
      this.homey.app.setSpeed(value);
    });

    this.registerCapabilityListener('operating_mode', async (value) => {
      this.log(`Setting operating mode to ${value}`);
      this.homey.app.setOperatingMode(value);
    });

    this.registerCapabilityListener('bypass_state', async (value) => {
      this.log(`Setting bypass state to ${value}`);
    });

    this.registerCapabilityListener('bypass_mode', async (value) => {
      this.log(`Setting bypass mode to ${value}`);
      await this.homey.app.setBypassMode(value);
    });

    this.registerCapabilityListener('boost', async (value) => {
      this.log(`Setting boost to ${value}`);
      this.homey.app.setBoost(value);
    });

    this.registerCapabilityListener('temperature_profile', async (value) => {
      this.log(`Setting temperature profile to ${value}`);
      this.homey.app.setTempProfile(value);
    });

    this.registerCapabilityListener('ventilation_mode', async (value) => {
      this.log(`Setting ventilation mode to ${value}`);
      this.homey.app.setVentilationMode(value);
    });

    this.registerCapabilityListener('fan_next_change', async (value) => {
      this.log(`Fan level next change will happen in ${value}`);
    });

    this.registerCapabilityListener('measure_humidity.extract', async (value) => {
      this.log(`Extract humidity set to ${value}`);
    });

    this.registerCapabilityListener('measure_temperature.extract', async (value) => {
      this.log(`Extract temperature set to ${value}`);
    });

    this.registerCapabilityListener('measure_humidity.exhaust', async (value) => {
      this.log(`Exhaust humidity set to ${value}`);
    });

    this.registerCapabilityListener('measure_temperature.exhaust', async (value) => {
      this.log(`Exhaust temperature set to ${value}`);
    });

    this.registerCapabilityListener('measure_humidity.supply', async (value) => {
      this.log(`Supply humidity set to ${value}`);
    });

    this.registerCapabilityListener('measure_temperature.supply', async (value) => {
      this.log(`Supply temperature set to ${value}`);
    });

    this.registerCapabilityListener('measure_humidity.outdoor', async (value) => {
      this.log(`Outdoor humidity set to ${value}`);
    });

    this.registerCapabilityListener('measure_temperature.outdoor', async (value) => {
      this.log(`Outdoor temperature set to ${value}`);
    });

    this.registerCapabilityListener('measure_airflow.supply', async (value) => {
      this.log(`Supply airflow set to ${value}`);
    });

    this.registerCapabilityListener('measure_airflow.exhaust', async (value) => {
      this.log(`Extract airflow set to ${value}`);
    });

    this.registerCapabilityListener('measure_fan_speed.supply', async (value) => {
      this.log(`Supply fan speed set to ${value}`);
    });

    this.registerCapabilityListener('measure_fan_speed.exhaust', async (value) => {
      this.log(`Exhaust fan speed set to ${value}`);
    });

    this.registerCapabilityListener('measure_fan_duty.supply', async (value) => {
      this.log(`Supply fan duty set to ${value}`);
    });

    this.registerCapabilityListener('measure_fan_duty.exhaust', async (value) => {
      this.log(`Exhaust fan duty set to ${value}`);
    });

    this.registerCapabilityListener('measure_avoided.heating', async (value) => {
      this.log(`Avoided hearing current set to ${value}`);
    });

    this.registerCapabilityListener('measure_avoided.cooling', async (value) => {
      this.log(`Avoided cooling current set to ${value}`);
    });

    this.registerCapabilityListener('measure_avoided.heating_total', async (value) => {
      this.log(`Avoided heating total set to ${value} kWh`);
    });

    this.registerCapabilityListener('measure_avoided.cooling_total', async (value) => {
      this.log(`Avoided cooling total set to ${value} kWh`);
    });

    this.registerCapabilityListener('measure_rmot', async (value) => {
      this.log(`Current RMOT set to ${value}`);
    });

    this.homey.flow.getConditionCard('supply_temperature_is_higher_than').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('measure_temperature.supply') > args.degrees;
    });

    this.homey.flow.getConditionCard('extract_temperature_is_higher_than').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('measure_temperature.extract') > args.degrees;
    });

    this.homey.flow.getConditionCard('outdoor_temperature_is_higher_than').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('measure_temperature.outdoor') > args.degrees;
    });

    this.homey.flow.getConditionCard('exhaust_temperature_is_higher_than').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('measure_temperature.exhaust') > args.degrees;
    });

    this.homey.flow.getConditionCard('supply_humidity_is_higher_than').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('measure_humidity.supply') > args.percent;
    });

    this.homey.flow.getConditionCard('extract_humidity_is_higher_than').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('measure_humidity.extract') > args.percent;
    });

    this.homey.flow.getConditionCard('outdoor_humidity_is_higher_than').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('measure_humidity.outdoor') > args.percent;
    });

    this.homey.flow.getConditionCard('exhaust_humidity_is_higher_than').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('measure_humidity.exhaust') > args.percent;
    });

    this.homey.flow.getConditionCard('bypass_state_is_higher_than').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('bypass_state') > args.percent;
    });

    this.homey.flow.getConditionCard('exhaust_fan_duty_is_higher_than').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('measure_fan_duty.exhaust') > args.percent;
    });

    this.homey.flow.getConditionCard('supply_fan_duty_is_higher_than').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('measure_fan_duty.supply') > args.percent;
    });

    this.homey.flow.getConditionCard('exhaust_fan_speed_is_higher_than').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('measure_fan_speed.exhaust') > args.speed;
    });

    this.homey.flow.getConditionCard('supply_fan_speed_is_higher_than').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('measure_fan_speed.supply') > args.speed;
    });

    this.homey.flow.getConditionCard('days_to_replace_filter_is_higher_than').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('days_to_replace_filter') > args.days;
    });

    this.homey.flow.getConditionCard('current_rmot_is_higher_than').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('measure_rmot') > args.degrees;
    });

    this.homey.flow.getConditionCard('temperature_profile_is').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('temperature_profile') === args.profile;
    });

    this.homey.flow.getConditionCard('ventilation_mode_is').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('ventilation_mode') === args.mode;
    });

    this.homey.flow.getConditionCard('bypass_mode_is').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('bypass_mode') === args.mode;
    });

    this.homey.flow.getConditionCard('fan_speed_mode_is').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('fan_speed_mode') === args.mode;
    });

    this.homey.flow.getConditionCard('operating_mode_is').registerRunListener(async (args, state) => {
      return this.getCapabilityValue('operating_mode') === args.mode;
    });

    // await this.__updateDevice();
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('ComfoConnect LAN C has been added');
    // this.__updateDevice();
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({
    oldSettings,
    newSettings,
    changedKeys,
  }) {
    try {
      this.log('ComfoConnect LAN C settings where changed');

      this.log(`ChangedKeys: ${JSON.stringify(changedKeys)}`);

      for (const key of changedKeys) {
        this.log(`Changing ${key} to ${newSettings[key]}`);
        await this.__updateDevice();
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
    await this.homey.app.disconnect();
  }

  async __updateDevice() {
    this.log('Updating device...');
    try {
      const r = await this.homey.app.getReadings();
      this.setCapabilityValueLog('measure_fan_duty.exhaust', r.SENSOR_FAN_EXHAUST_DUTY);
      this.setCapabilityValueLog('measure_fan_duty.supply', r.SENSOR_FAN_SUPPLY_DUTY);
      this.setCapabilityValueLog('fan_next_change', this.getTimeFormatted(r.SENSOR_FAN_NEXT_CHANGE));
      this.setCapabilityValueLog('measure_fan_speed.exhaust', r.SENSOR_FAN_EXHAUST_SPEED);
      this.setCapabilityValueLog('measure_fan_speed.supply', r.SENSOR_FAN_SUPPLY_SPEED);
      this.setCapabilityValueLog('measure_power', r.SENSOR_POWER_CURRENT);
      this.setCapabilityValueLog('bypass_state', r.SENSOR_BYPASS_STATE);
      this.setCapabilityValueLog('bypass_mode', r.SENSOR_BYPASS_ACTIVATION_MODE.toString());
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

      this.setCapabilityValueLog('measure_airflow.supply', r.SENSOR_FAN_SUPPLY_FLOW);
      this.setCapabilityValueLog('measure_airflow.exhaust', r.SENSOR_FAN_EXHAUST_FLOW);

      this.setCapabilityValueLog('measure_avoided.heating', r.SENSOR_AVOIDED_HEATING_CURRENT);
      this.setCapabilityValueLog('measure_avoided.cooling', r.SENSOR_AVOIDED_COOLING_CURRENT);
      this.setCapabilityValueLog('measure_avoided.heating_total', r.SENSOR_AVOIDED_HEATING_TOTAL * 1000);
      this.setCapabilityValueLog('measure_avoided.cooling_total', r.SENSOR_AVOIDED_COOLING_TOTAL * 1000);
      this.setCapabilityValueLog('measure_rmot', r.SENSOR_CURRENT_RMOT);

      let temperatureProfile = 0; // Normal
      if (r.SENSOR_TEMPERATURE_PROFILE === 1) {
        temperatureProfile = 1; // Warm
      } else if (r.SENSOR_TEMPERATURE_PROFILE === 2) {
        temperatureProfile = 2; // Cool
      }
      this.setCapabilityValueLog('temperature_profile', temperatureProfile.toString());

      let ventMode = 1; // Balance
      if (r.SENSOR_FAN_MODE_SUPPLY === 1) {
        ventMode = 2; // Supply only
      } else if (r.SENSOR_FAN_MODE_EXHAUST === 1) {
        ventMode = 3; // Extract only
      }
      this.setCapabilityValueLog('ventilation_mode', ventMode.toString());

      this.setAvailable();
    } catch (err) {
      this.setUnavailable(this.homey.__('device_unavailable')).catch(this.error);
      this.log(`Error in __updateDevice: ${err.message}`);
    }
  }

  async setCapabilityValueLog(capability, value) {
    this.log(`setCapability ${capability}: ${JSON.stringify(value)}`);
    try {
      await this.setCapabilityValue(capability, value);
      await this.setStoreValue(capability, value); // Zapisz wartość w pamięci trwałej
    } catch (err) {
      this.log(`setCapabilityValueLog error ${capability} ${err.message}`);
    }
  }

  getTimeFormatted(value) {
    if (value.length !== 4) {
      return ('Not scheduled');
    }
    const totalSeconds = value[0] + value[1] * 256 + value[2] * 256 ** 2 + value[3] * 256 ** 3;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let formattedTime = '';
    if (hours > 0) {
      formattedTime += `${hours}h `;
    }
    if (minutes > 0) {
      formattedTime += `${minutes}m `;
    }
    formattedTime += `${seconds}s`;

    return formattedTime.trim();
  }

}

module.exports = ComfoConnectLanC;
