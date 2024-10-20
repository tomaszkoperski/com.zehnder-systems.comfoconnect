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

### v1.5.1 (2024-10-20)
Better connection handling, cleanup, added days to replace filter handling (Tomasz Koperski)

### v1.4.5 (2024-06-16)
Minor fixes (Tomasz Koperski)

### v1.4.1 (2024-04-09)
Added option to control boost and bypass mode from app and flows. Added fan speed measurement capabilities. Added bypass mode information. Added fan speed next scheduled change countdown. Added ability to react to fan duty, fan speed and bypass state in flows. (Tomasz Koperski)

### v1.3.2 (2023-06-18)
Added more logging to help with debugging issues. Fixed sync issue when adding the LanC device (Tomasz Koperski)

### v1.3.1 (2023-06-17)
Better handling in promise race and keepAlives (Tomasz Koperski)

### v1.3.0 (2023-06-09)
Fix disconnect sync (Tomasz Koperski)

### v1.2.0 (2023-06-05)
Remove unused packages (Jens Segers)
Apply linting (Jens Segers)
Add Homey dev dependency (Jens Segers)

### v1.1.0 (2023-01-06)
Better handling and flow card for the ventilation mode (Tomasz Koperski)
Added airflow measurement capabilities. Attempted fix for occasional null readings, which polluted insights (Tomasz Koperski)

### v1.0.4 (2022-09-17)
Fixed mode change flow card (Tomasz Koperski)

### v1.0.2 (2022-08-04)
Added info to restart the app after changing the gateway IP address or PIN. (Tomasz Koperski)
Fixed issue with empty config causing app crash, minor fixes. (Tomasz Koperski)

### v1.0.1 (2022-08-04)
Minor fixes

### v1.0.0 (2022-07-31)
Initial release

## Feedback

Please report issues at the [issues section on GitHub](https://github.com/tomaszkoperski/com.zehnder-systems.comfoconnect/issues).

## Thank you notes / credits
This work relies heavily on the ComfoAirQ protocol implementation created by [herrJones](https://github.com/herrJones), found at [node-comfoairq](https://github.com/herrJones/node-comfoairq)
