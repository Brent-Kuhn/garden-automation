Required setup:
create wireless_config.h with the following code and place it in the same location as nodeMCU_sensor_reading.ino
```
#ifndef _WIRELESS_CONFIG_H
#define _WIRELESS_CONFIG_H
#endif

/*Wireless Network Information*/
const char* ssid = "ssid_name";  // Enter SSID here
const char* password = "password_sauce";  //Enter Password here

/*Hardcoding the server IP and port for now*/
const char* host="server_ip";
const uint16_t port=3000;
```
To preare the NodeMCU device:

Add the board to Arduino IDE (From: https://www.amazon.com/gp/product/B010N1SPRK/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1)
Go to File->Preferences and copy the URL below to get the ESP board manager extensions: http://arduino.esp8266.com/stable/package_esp8266com_index.json Placing the http:// before the URL lets the Arduino IDE use it...otherwise it gives you a protocol error.
Go to Tools > Board > Board Manager> Type "esp8266" and download the Community esp8266 and install.
Set up your chip as:
Tools -> Board -> NodeMCU 1.0 (ESP-12E Module)
Tools -> Flash Size -> 4M (3M SPIFFS)
Tools -> CPU Frequency -> 80 Mhz
Tools -> Upload Speed -> 921600
Tools-->Port--> (whatever it is)

Install drivers from:
https://www.silabs.com/products/development-tools/software/usb-to-uart-bridge-vcp-drivers
