import { describe, it, expectTypeOf } from "vitest";
import type { SignalColor, DataSource, DataRow } from "@/types/shared";

describe("shared types", () => {
  it("SignalColor은_6가지_리터럴_유니온이다", () => {
    expectTypeOf<SignalColor>().toEqualTypeOf<
      "red" | "orange" | "yellow" | "blue" | "green" | "gray"
    >();
  });

  it("DataSource는_name과_dataId를_가진다", () => {
    expectTypeOf<DataSource>().toMatchTypeOf<{
      readonly name: string;
      readonly dataId: string;
    }>();
  });

  it("DataRow는_key와_value를_가진다", () => {
    expectTypeOf<DataRow>().toMatchTypeOf<{
      readonly key: string;
      readonly value: string;
    }>();
  });
});
