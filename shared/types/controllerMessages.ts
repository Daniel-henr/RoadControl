export interface Button {
  type: "button";
  id: number;
  pressed: boolean;
}

export interface Axis {
  type: "axis";
  axis: AxisName;
  value: number;
}

export type AxisName = "steering" | "throttle" | "brake";
export type ProtocolMessage = Button | Axis;
