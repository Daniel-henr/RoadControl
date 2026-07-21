import { WebSocketServer } from "ws";
import pkg from "vjoy";

const { vJoy, vJoyDevice } = pkg;

// Create the server on port 5555
const wss = new WebSocketServer({ port: 5555 });
console.log("Server created on port 5555");

// vJoy device created
const device = vJoyDevice.create(1);

// Client connected
wss.on("connection", (ws) => {
  console.log("Client connected!");

  // Message received from client
  ws.on("message", (data) => {
    try {
      const payload = JSON.parse(data.toString());

      console.log("Message received:", payload);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Error detected: ${message}`);
    }
  });

  // Client connection closed
  ws.on("close", (code, reason) => {
    const context = reason.toString() || "No information provided!";

    console.error("Connection closed!");
    console.error(`Code: ${code}`);
    console.error(`Reason: ${context}`);
  });

  // Error on connection
  ws.on("error", (error) => {
    console.log("An error occurred on the server.");
    console.log(`Error: ${error.message}`);
    console.log(`Code: ${error.cause}`);
    console.log(`Stack: ${error.stack}`);
  });
});