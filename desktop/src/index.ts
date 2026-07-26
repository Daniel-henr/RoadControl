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

// vJoy device created once when the server starts (not per client connection)
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

// Converts a 0-100 protocol value into the vJoy axis range (1 to 32768)
function valueConvert(
  value: number,
  inMax: number,
  outMin: number,
  outRange: number,
): number {
  const res = Math.round((value / inMax) * outRange) + outMin;

  return res;
}

// Returns every axis and button to a neutral state.
// Used when a client disconnects or the connection errors out,
// so the vJoy device never gets stuck holding the last received input.
function resetDevice() {
  const wheelReset = valueConvert(50, 100, 1, 32767);
  const pedalsReset = valueConvert(0, 100, 1, 32767);

  device?.resetButtons();
  device?.axes.X.set(wheelReset); // steering axis
  device?.axes.Z.set(pedalsReset); // throttle axis
  device?.axes.Y.set(pedalsReset); // brake axis
}

// Client connected
wss.on("connection", (ws) => {
  console.log("Client connected!");

  // Message received from client
  ws.on("message", (data) => {
    try {
      const payload = JSON.parse(data.toString());

      if (isButton(payload)) {
        device?.buttons[payload.id]?.set(payload.pressed);
        console.log("Button message received: ", payload);
      } else if (isAxis(payload)) {
        const convertedValue = valueConvert(payload.value, 100, 1, 32767);
        console.log("Axis message received: ", payload);

        // Maps the protocol's axis name to the actual vJoy axis in use.
        // Names don't match 1:1 with vJoy's own labels (X/Y/Z) because
        // the driver's default axis assignment was confirmed by testing
        // in-game, not by the axis names themselves.
        switch (payload.axis) {
          case "steering":
            device?.axes.X.set(convertedValue);
            break;

          case "throttle":
            device?.axes.Z.set(convertedValue);
            break;

          case "brake":
            device?.axes.Y.set(convertedValue);
            break;
        }
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

    resetDevice();
  });

  // Error on connection
  ws.on("error", (error) => {
    console.log("An error occurred on the server.");
    console.log(`Error: ${error.message}`);
    console.log(`Code: ${error.cause}`);
    console.log(`Stack: ${error.stack}`);

    resetDevice();
  });
});