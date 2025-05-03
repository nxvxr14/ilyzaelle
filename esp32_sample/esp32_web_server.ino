#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YourWiFiName";
const char* password = "YourWiFiPassword";

// API authentication key - should match the serverAPIKey in your Node.js app
const char* validApiKey = "esp32-secret-key-1234";

// Create web server on port 80
WebServer server(80);

// Variables that can be accessed remotely
int temperature = 24;
int humidity = 65;
bool relay1 = false;
bool relay2 = false;
int lightLevel = 512;

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.print("Connected to WiFi. IP Address: ");
  Serial.println(WiFi.localIP());
  
  // Define API endpoints
  server.on("/variables", HTTP_GET, handleGetVariables);
  server.on("/values", HTTP_GET, handleGetValues);
  server.on("/set", HTTP_POST, handleSetVariable);
  
  // Start the server
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
  
  // Simulate changing sensor values
  if (random(100) < 10) { // 10% chance to change each loop
    temperature = 20 + random(15); // Random temperature between 20-35
    humidity = 50 + random(40);    // Random humidity between 50-90
    lightLevel = random(1024);     // Random light level between 0-1023
  }
  
  delay(100); // Short delay for stability
}

// Handle request for available variable names
void handleGetVariables() {
  // Check if request includes valid API key
  if (!isAuthorized()) {
    return;
  }
  
  DynamicJsonDocument doc(1024);
  JsonArray variables = doc.createNestedArray("variables");
  
  variables.add("temperature");
  variables.add("humidity");
  variables.add("relay1");
  variables.add("relay2");
  variables.add("lightLevel");
  
  String response;
  serializeJson(doc, response);
  
  server.send(200, "application/json", response);
}

// Handle request for variable values
void handleGetValues() {
  // Check if request includes valid API key
  if (!isAuthorized()) {
    return;
  }
  
  DynamicJsonDocument doc(1024);
  JsonObject values = doc.createNestedObject("values");
  
  values["temperature"] = temperature;
  values["humidity"] = humidity;
  values["relay1"] = relay1;
  values["relay2"] = relay2;
  values["lightLevel"] = lightLevel;
  
  String response;
  serializeJson(doc, response);
  
  server.send(200, "application/json", response);
}

// Handle setting variable values
void handleSetVariable() {
  // Check if request includes valid API key
  if (!isAuthorized()) {
    return;
  }
  
  // Parse request body
  String requestBody = server.arg("plain");
  DynamicJsonDocument doc(1024);
  DeserializationError error = deserializeJson(doc, requestBody);
  
  if (error) {
    server.send(400, "application/json", "{\"success\":false,\"message\":\"Invalid JSON\"}");
    return;
  }
  
  // Extract variable name and value
  const char* variable = doc["variable"];
  if (!variable) {
    server.send(400, "application/json", "{\"success\":false,\"message\":\"Variable name required\"}");
    return;
  }
  
  bool success = true;
  String variableName = String(variable);
  
  // Update the appropriate variable
  if (variableName == "relay1") {
    relay1 = doc["value"];
  } 
  else if (variableName == "relay2") {
    relay2 = doc["value"];
  }
  else if (variableName == "temperature" || 
           variableName == "humidity" || 
           variableName == "lightLevel") {
    // These are read-only sensor values in this example
    success = false;
  }
  else {
    success = false;
  }
  
  // Send response
  if (success) {
    server.send(200, "application/json", "{\"success\":true}");
  } else {
    server.send(400, "application/json", "{\"success\":false,\"message\":\"Read-only or unknown variable\"}");
  }
}

// Helper to check API key
bool isAuthorized() {
  // Check query parameters first (for GET requests)
  if (server.hasArg("serverAPIKey")) {
    if (server.arg("serverAPIKey") == validApiKey) {
      return true;
    }
  }
  
  // For POST requests, check JSON body
  if (server.hasArg("plain")) {
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, server.arg("plain"));
    if (!error && doc.containsKey("serverAPIKey")) {
      if (doc["serverAPIKey"] == validApiKey) {
        return true;
      }
    }
  }
  
  // Not authorized
  server.send(401, "application/json", "{\"success\":false,\"message\":\"Unauthorized\"}");
  return false;
}
