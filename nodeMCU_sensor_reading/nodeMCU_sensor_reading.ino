#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include "wireless_config.h"


#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>

#define DHTPIN 5     // Digital pin connected to the DHT sensor 
#define DHTTYPE    DHT11     // DHT 11 sensor

/*
 * Tempurature and humidity sensor setup
 */

DHT_Unified dht(DHTPIN, DHTTYPE);

uint32_t delayMS, heartbeat;

float temperature, humidity, moisture;

/* 
 *Soil Moisture Sensor setup
*/
int sensor_pin = A0;
int sensor_val = 0;

/*
 * Device information
 */
uint32_t deviceId = ESP.getChipId();

//Setup
void setup() {
  /*
   * Start the server connections
   */
  Serial.begin(9600);
  Serial.println("Connecting to WiFi network");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid,password);
  while(WiFi.status()!=WL_CONNECTED){
    Serial.print(".");
    delay(500);
  }
  Serial.println("Connected!");
  Serial.println("CONNECTED TO WIFI");
  Serial.print("IP:");
  Serial.println(WiFi.localIP());
  /*
   * Start the sensors
   */
  sensor_t sensor;
  dht.temperature().getSensor(&sensor);
  dht.humidity().getSensor(&sensor);
  dht.begin();
  delayMS = sensor.min_delay / 1000;
  //  TODO: Use the response from heartbeat to sleep on
}

String response;
void loop(){
  int first_val = 1;
  int second_val = 2;
  String host = server_prefix + String(first_val) + "." + String(second_val);
  sensorData ();
  WiFiClient client;
  /*
    Warning!!! This is not safe!  If the while loop goes out of range before finding the server (i.e. the server was off)
    the device is basically useless until it is rebooted.
  */
  while(!client.connect(host,port) || !(second_val < 255))
  {
    Serial.print("Connecting to: ");
    Serial.print(host);
    Serial.print(":");
    Serial.println(port);
    second_val += 1;
    host = server_prefix + String(first_val) + "." + String(second_val);
    delay(100);
  }
//  if(!client.connect(host,port))//IF THIS OCCURS MAKE THEN FIREWALL IS STOPPING THE CONNECTION OR THE IP ADDRESS/PORT OF THE SERVER IS INCORRECT.
//  {
//    Serial.println("CONNECTION FAILED");
//    delay(4000);
//    return;
//  }
//  else
  {
   Serial.println("CONNECTED TO THE SERVER");
   String urlInfo = "/api/v1/addData";
   urlInfo += "?";
   urlInfo += "deviceId=";
   urlInfo += deviceId;
   urlInfo += "&ip=";
   // This is null for now because ip has several periods in it
   // This should be WiFi.localIP().toString();
   urlInfo += WiFi.localIP().toString();
   urlInfo += "&temperature=";
   urlInfo += temperature;
   urlInfo += "&humidity=";
   urlInfo += humidity;
   urlInfo += "&moisture=";
   urlInfo += moisture;

   // Post the device readings to the server
   client.print(String("POST ")+urlInfo+" HTTP/1.1\r\n"+"Host:"+host+"\r\n"+"Connection:close\r\n\r\n");
    unsigned long timeout=millis();
    while(client.available()==0)
    { 
      //close the connection if it has been connected for more than 5 seconds
      if(millis()-timeout>5000)
      {
        Serial.println(">>> Client Timeout !");
        client.stop();
        delay(5000);
        return;
      }
    }
    Serial.println("receiving from remote server");
    //Start reading the response from the server
    while (client.available()) {
      String line = client.readStringUntil('\n');
      if (line == "\r") 
      {
        Serial.println("headers received");
        break;
      }
    }
    String line = client.readStringUntil('\n');
    Serial.println(line);

    // Close the connection
    Serial.println();
    Serial.println("closing connection");
    client.stop();
  }
  
  Serial.print("Connecting to: ");
  Serial.print(host);
  Serial.print(":");
  Serial.println(port);
  if(!client.connect(host,port))//IF THIS OCCURS MAKE THEN FIREWALL IS STOPPING THE CONNECTION OR THE IP ADDRESS/PORT OF THE SERVER IS INCORRECT.
  {
    Serial.println("CONNECTION FAILED");
    delay(4000);
    return;
  }
  else
  {
   Serial.println("CONNECTED TO THE SERVER");
    // Get the sleep time
    String address = "/api/v1/heartbeat";
    client.print(String("GET ") + address + " HTTP/1.1\r\n" + "Host: " + host + "\r\n" + "Connection: close\r\n\r\n");
    unsigned long timeout=millis();
    while(client.available()==0)
    { 
      //close the connection if it has been connected for more than 5 seconds
      if(millis()-timeout>5000)
      {
        Serial.println(">>> Client Timeout !");
        client.stop();
        delay(5000);
        return;
      }
    }
    Serial.println("receiving from remote server");
    //Start reading the response from the server
    // TODO: Parse this for the heartbeat
    while (client.available()) 
    {
      String line = client.readStringUntil('\n');
      if (line == "\r") {
        Serial.println("headers received");
        break;
      }
    }
    String line = client.readStringUntil('\n');
    Serial.println(line);
    int heartBeat = line.toInt();

    
    // Close the connection
    Serial.println();
    Serial.println("closing connection");
    client.stop();

    delay(heartBeat + 5000);
  }
}

void sensorData () {
  // Humidity sensor Events
  delay(delayMS);
  sensors_event_t event;
  dht.temperature().getEvent(&event);
  temperature = event.temperature;
  
  dht.humidity().getEvent(&event);
  humidity = event.relative_humidity;

  // Soil sensor Events
  moisture = (int) ((100 - analogRead(sensor_pin)/10.24)*100.0);
  moisture = moisture / 100.0;
}