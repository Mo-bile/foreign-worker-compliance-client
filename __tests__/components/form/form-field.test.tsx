import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { FormField } from "@/components/form/form-field";

const schema = z.object({ name: z.string().min(1, "이름은 필수입니다") });
type TestForm = z.infer<typeof schema>;

function TestWrapper() {
  const { register, handleSubmit, formState: { errors } } = useForm<TestForm>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { name: "" },
  });
  return (
    <form onSubmit={handleSubmit(() => {})}>
      <FormField<TestForm>
        label="이름"
        name="name"
        register={register}
        errors={errors}
        placeholder="홍길동"
      />
      <button type="submit">제출</button>
    </form>
  );
}

function ChildrenWrapper() {
  const { register, formState: { errors } } = useForm<TestForm>({
    defaultValues: { name: "" },
  });
  return (
    <FormField<TestForm> label="이름" name="name" register={register} errors={errors}>
      <select id="name" data-testid="custom-select">
        <option value="a">A</option>
      </select>
    </FormField>
  );
}

describe("FormField", () => {
  it("라벨과_입력_필드를_렌더링한다", () => {
    render(<TestWrapper />);
    expect(screen.getByLabelText("이름")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("홍길동")).toBeInTheDocument();
  });

  it("에러가_있으면_에러_메시지를_표시한다", async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);
    await user.click(screen.getByText("제출"));
    expect(await screen.findByText("이름은 필수입니다")).toBeInTheDocument();
  });

  it("children이_있으면_Input_대신_렌더링한다", () => {
    render(<ChildrenWrapper />);
    expect(screen.getByTestId("custom-select")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
