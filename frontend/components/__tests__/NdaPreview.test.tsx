import React from "react";
import { render, screen } from "@testing-library/react";
import NdaPreview from "../NdaPreview";

describe("<NdaPreview />", () => {
  it("renders the markdown content verbatim inside a <pre>", () => {
    const md = "# Hello\n\nBody line.";
    const { container } = render(<NdaPreview markdown={md} />);
    const pre = container.querySelector("pre");
    expect(pre).not.toBeNull();
    expect(pre!.textContent).toBe(md);
  });

  it("does not interpret markdown as HTML (renders raw < characters)", () => {
    const md = "Line with <script>alert('x')</script> markup.";
    const { container } = render(<NdaPreview markdown={md} />);
    // No actual <script> element should be created — the string is inside a text node.
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("pre")!.textContent).toBe(md);
  });

  it("renders empty markdown without error", () => {
    const { container } = render(<NdaPreview markdown="" />);
    const pre = container.querySelector("pre");
    expect(pre).not.toBeNull();
    expect(pre!.textContent).toBe("");
  });

  it("updates when the markdown prop changes", () => {
    const { rerender, container } = render(<NdaPreview markdown="first" />);
    expect(container.querySelector("pre")!.textContent).toBe("first");
    rerender(<NdaPreview markdown="second" />);
    expect(container.querySelector("pre")!.textContent).toBe("second");
  });
});
