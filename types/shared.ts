import { z } from "zod";

export const SIGNAL_COLORS = ["red", "orange", "yellow", "blue", "green", "gray"] as const;
export const signalColorSchema = z.enum(SIGNAL_COLORS);
export type SignalColor = z.infer<typeof signalColorSchema>;

export interface DataSource {
  readonly name: string;
  readonly dataId: string;
}

export interface DataRow {
  readonly key: string;
  readonly value: string;
}
