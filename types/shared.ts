export type SignalColor = "red" | "orange" | "yellow" | "blue" | "green" | "gray";

export interface DataSource {
  readonly name: string;
  readonly dataId: string;
}

export interface DataRow {
  readonly key: string;
  readonly value: string;
}
