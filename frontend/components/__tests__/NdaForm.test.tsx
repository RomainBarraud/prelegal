import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NdaForm from "../NdaForm";
import { defaultFormData } from "@/lib/types";
import type { NdaFormData } from "@/lib/types";

function Harness({
  initial,
  onDataChange,
}: {
  initial?: NdaFormData;
  onDataChange?: (d: NdaFormData) => void;
}) {
  const [data, setData] = useState<NdaFormData>(
    initial ?? defaultFormData("2026-01-15"),
  );
  return (
    <NdaForm
      data={data}
      onChange={(next) => {
        setData(next);
        onDataChange?.(next);
      }}
    />
  );
}

describe("<NdaForm />", () => {
  it("renders the two Party sections and deal terms", () => {
    render(<Harness />);
    expect(screen.getByRole("heading", { name: "Party 1" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Party 2" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Deal terms" }),
    ).toBeInTheDocument();
  });

  it("renders four inputs per Party section", () => {
    render(<Harness />);
    expect(screen.getAllByPlaceholderText("Acme, Inc.")).toHaveLength(2);
    expect(screen.getAllByPlaceholderText("Jane Doe")).toHaveLength(2);
    expect(
      screen.getAllByPlaceholderText("Chief Executive Officer"),
    ).toHaveLength(2);
    expect(
      screen.getAllByPlaceholderText(/legal@acme.com or 123 Main St/),
    ).toHaveLength(2);
  });

  it("propagates typing into Party 1 company through onChange", async () => {
    const user = userEvent.setup();
    const onDataChange = jest.fn();
    render(<Harness onDataChange={onDataChange} />);
    // First "Acme, Inc." placeholder belongs to Party 1
    const input = screen.getAllByPlaceholderText("Acme, Inc.")[0];
    await user.type(input, "Widgetco");
    const last = onDataChange.mock.calls.at(-1)?.[0] as NdaFormData;
    expect(last.party1.company).toBe("Widgetco");
  });

  it("propagates typing into Party 2 company independently", async () => {
    const user = userEvent.setup();
    const onDataChange = jest.fn();
    render(<Harness onDataChange={onDataChange} />);
    const inputs = screen.getAllByPlaceholderText("Acme, Inc.");
    await user.type(inputs[1], "Second");
    const last = onDataChange.mock.calls.at(-1)?.[0] as NdaFormData;
    expect(last.party2.company).toBe("Second");
    expect(last.party1.company).toBe("");
  });

  it("selecting 'Continues until terminated' disables the MNDA years input", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const yearsInputs = screen.getAllByRole("spinbutton");
    // First spinbutton is MNDA term years (initially enabled)
    expect(yearsInputs[0]).toBeEnabled();

    const continuesRadio = screen.getByRole("radio", {
      name: /Continues until terminated/i,
    });
    await user.click(continuesRadio);

    expect(yearsInputs[0]).toBeDisabled();
  });

  it("selecting 'In perpetuity' disables the confidentiality years input", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const yearsInputs = screen.getAllByRole("spinbutton");
    // Second spinbutton is confidentiality years
    expect(yearsInputs[1]).toBeEnabled();

    const perpetuityRadio = screen.getByRole("radio", { name: /In perpetuity/i });
    await user.click(perpetuityRadio);

    expect(yearsInputs[1]).toBeDisabled();
  });

  it("toggling back to 'Expires' re-enables the MNDA years input", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const yearsInputs = screen.getAllByRole("spinbutton");
    await user.click(
      screen.getByRole("radio", { name: /Continues until terminated/i }),
    );
    expect(yearsInputs[0]).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: /Expires after/i }));
    expect(yearsInputs[0]).toBeEnabled();
  });

  it("propagates governing law and jurisdiction edits", async () => {
    const user = userEvent.setup();
    const onDataChange = jest.fn();
    render(<Harness onDataChange={onDataChange} />);
    await user.type(screen.getByPlaceholderText("Delaware"), "California");
    await user.type(
      screen.getByPlaceholderText(/courts located in New Castle, DE/),
      "San Francisco, CA",
    );
    const last = onDataChange.mock.calls.at(-1)?.[0] as NdaFormData;
    expect(last.governingLaw).toBe("California");
    expect(last.jurisdiction).toBe("San Francisco, CA");
  });

  it("populates fields from initial data", () => {
    const initial: NdaFormData = {
      ...defaultFormData("2026-06-01"),
      party1: {
        company: "Foo Corp",
        signatoryName: "Alice",
        title: "Founder",
        noticeAddress: "alice@foo.example",
      },
    };
    render(<Harness initial={initial} />);
    expect(screen.getByDisplayValue("Foo Corp")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Founder")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("alice@foo.example"),
    ).toBeInTheDocument();
  });

  it("renders the MNDA modifications textarea as optional", () => {
    render(<Harness />);
    expect(screen.getByText(/MNDA modifications/i)).toBeInTheDocument();
    expect(screen.getByText(/\(optional\)/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/List any modifications/),
    ).toBeInTheDocument();
  });
});
