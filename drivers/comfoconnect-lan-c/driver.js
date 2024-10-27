'use strict';

const {
  Driver,
} = require('homey');

class ComfoConnectLanCDriver extends Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('ComfoConnect LAN C driver has been initialized');

    const cardChangeSpeed = this.homey.flow.getActionCard('change_fan_speed');
    cardChangeSpeed.registerRunListener(async (args, state) => {
      this.log(`Change speed: ${JSON.stringify(args)}, ${JSON.stringify(state)}`);
      this.homey.app.setSpeed(args['fan_speed']);
    });

    const cardBoost = this.homey.flow.getActionCard('boost');
    cardBoost.registerRunListener(async (args, state) => {
      this.log(`Boost: ${JSON.stringify(args)}, ${JSON.stringify(state)}`);
      this.homey.app.setBoost(args['period']);
    });

    const cardMode = this.homey.flow.getActionCard('change_operating_mode');
    cardMode.registerRunListener(async (args, state) => {
      this.log(`Mode: ${JSON.stringify(args)}, ${JSON.stringify(state)}`);
      this.homey.app.setOperatingMode(args['operating_mode']);
    });

    const cardChangeVentMode = this.homey.flow.getActionCard('change_ventilation_mode');
    cardChangeVentMode.registerRunListener(async (args, state) => {
      this.log(`Ventilation mode: ${JSON.stringify(args)}, ${JSON.stringify(state)}`);
      this.homey.app.setVentilationMode(args['ventilation_mode']);
    });

    const cardChangeBypassMode = this.homey.flow.getActionCard('change_bypass_mode');
    cardChangeBypassMode.registerRunListener(async (args, state) => {
      this.log(`Bypass mode: ${JSON.stringify(args)}, ${JSON.stringify(state)}`);
      this.homey.app.setBypassMode(args['bypass_mode']);
    });

    const cardChangeTempProfile = this.homey.flow.getActionCard('change_temp_profile');
    cardChangeTempProfile.registerRunListener(async (args, state) => {
      this.log(`Temperature profile: ${JSON.stringify(args)}, ${JSON.stringify(state)}`);
      this.homey.app.setTempProfile(args['temp_profile']);
    });
  }

  /**
   * onPairListDevices is called when a user is adding a device
   * and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    try {
      await this.homey.app.activate();
      const bridge = await this.homey.app.getInfo();
      return [bridge];
    } catch (err) {
      this.log(`Error in onPairListDevices(): ${err.message}`);
    }
    return [];
  }

}

module.exports = ComfoConnectLanCDriver;
