# [Zehnder ComfoConnect LAN C support for Athom Homey](https://github.com/tomaszkoperski/com.zehnder-systems.comfoconnect)

I've made this app to be able to control my Zehnder ComfoAir Q350/450/600 ventilation unit connected to the Zehnder ComfoConnect LAN C gateway.

The way this works is:
- the app connect to the gateway via local IP address (set in app Settings)
- the app controls the connected ventilation unit through the gateway interface.

App was build and tested on:
- Homey PRO
- Zehner ComfoConnect LAN C gateway (software version: U1.2.6)
- Zehnder ComfoAir Q450 PL R VV Basic ST (firmware version: R1.8.2)

Please make sure you provide your gateway IP and PIN in the app settings after installation. This is required to list and add the device. The default PIN is `0000`

## Known Issues
See [Issue Tracker](https://github.com/tomaszkoperski/com.zehnder-systems.comfoconnect/issues)

## Supported Languages
* English

## Notes
* Build
  * `homey app run` to run the dev build of the App on your Homey PRO.
  * `homey app install` to drop a production build onto your Homey PRO.

## Change Log
* **1.0.0** Initial release (2022-07-31).

## Feedback

Please report issues at the [issues section on GitHub](https://github.com/tomaszkoperski/com.zehnder-systems.comfoconnect/issues).

## Thank you notes / credits
This work relies heavily on the ComfoAirQ protocol implementation created by [herrJones](https://github.com/herrJones), found at [node-comfoairq](https://github.com/herrJones/node-comfoairq)