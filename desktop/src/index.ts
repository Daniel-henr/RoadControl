import { WebSocketServer } from "ws";
import pkg from "vjoy";
import type {
  Button,
  Axis,
  AxisName,
  ProtocolMessage,
} from "../../shared/types/controllerMessages.js";

const { vJoy, vJoyDevice } = pkg;

// Create the server on port 5555
const wss = new WebSocketServer({ port: 5555 });
console.log("Server created on port 5555");

// vJoy device created
const device = vJoyDevice.create(1);

// Type guard: checks if the received payload matches the Button shape
function isButton(payload: unknown): payload is Button {
  if (typeof payload === "object" && payload !== null) {
    if ("type" in payload && "id" in payload && "pressed" in payload) {
      if (
        typeof payload.type === "string" &&
        payload.type === "button" &&
        typeof payload.id === "number" &&
        typeof payload.pressed === "boolean"
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}

// Type guard: checks if the received payload matches the Axis shape
function isAxis(payload: unknown): payload is Axis {
  if (typeof payload === "object" && payload !== null) {
    if ("type" in payload && "axis" in payload && "value" in payload) {
      if (
        typeof payload.type === "string" &&
        payload.type === "axis" &&
        typeof payload.axis === "string" &&
        (payload.axis === "steering" ||
          payload.axis === "throttle" ||
          payload.axis === "brake") &&
        typeof payload.value === "number"
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}

// Client connected
wss.on("connection", (ws) => {
  console.log("Client connected!");

  // Message received from client
  ws.on("message", (data) => {
    try {
      const payload = JSON.parse(data.toString());

      if (isButton(payload)) {
        console.log('Button message received: ', payload);
      } else if (isAxis(payload)) {
        console.log('Axis message received: ', payload);
      } else {
        console.log("Invalid message!", payload);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
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