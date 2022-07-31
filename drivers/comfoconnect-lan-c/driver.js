'use strict';

const { Driver } = require('homey');

class ComfoConnectLanCDriver extends Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('ComfoConnect LAN C driver has been initialized');
    this.homey.app.activate();

    const cardChangeSpeed = this.homey.flow.getActionCard('change_speed');
    cardChangeSpeed.registerRunListener(async (args, state) => {
      this.log(`Change speed: ${JSON.stringify(args)}, ${JSON.stringify(state)}`);
      this.homey.app.setSpeed(args['speed']);
    });

    const cardBoost = this.homey.flow.getActionCard('boost');
    cardBoost.registerRunListener(async (args, state) => {
      this.log(`Boost: ${JSON.stringify(args)}, ${JSON.stringify(state)}`);  
      this.homey.app.setBoost(args['period']);
    });

    const cardMode = this.homey.flow.getActionCard('change_mode');
    cardMode.registerRunListener(async (args, state) => {
      this.log(`Mode: ${JSON.stringify(args)}, ${JSON.stringify(state)}`);  
      this.homey.app.setOperatingMode(args['mode']);
    });


  }

  /**
   * onPairListDevices is called when a user is adding a device
   * and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {

    const bridge = await this.homey.app.getInfo();

    if ( bridge !== null) {
      return [bridge];
    } else { 
      return [];
    }
  }

}

module.exports = ComfoConnectLanCDriver;
