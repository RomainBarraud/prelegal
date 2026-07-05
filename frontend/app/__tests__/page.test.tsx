import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "../page";

describe("<Page /> integration", () => {
  it("shows the header and download button", () => {
    render(<Page />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Mutual NDA creator/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Download \.md/i }),
    ).toBeInTheDocument();
  });

  it("initial preview contains the default Common Paper title", () => {
    render(<Page />);
    const preview = screen.getByLabelText(/Preview/i);
    expect(
      within(preview).getByText(/# Mutual Non-Disclosure Agreement/),
    ).toBeInTheDocument();
  });

  it("live-updates the preview when Party 1 company changes", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const companyInputs = screen.getAllByPlaceholderText("Acme, Inc.");
    await user.type(companyInputs[0], "Foocorp");
    const preview = screen.getByLabelText(/Preview/i);
    expect(preview.textContent).toContain("Foocorp");
  });

  it("live-updates the preview when governing law changes", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const govInput = screen.getByPlaceholderText("Delaware");
    await user.type(govInput, "California");
    const preview = screen.getByLabelText(/Preview/i);
    expect(preview.textContent).toContain("Governing Law: California");
    expect(preview.textContent).toContain("laws of the State of California");
  });

  it("live-updates term checkbox rendering when 'Continues until terminated' is chosen", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(
      screen.getByRole("radio", { name: /Continues until terminated/i }),
    );
    const preview = screen.getByLabelText(/Preview/i);
    expect(preview.textContent).toContain(
      "- [x]     Continues until terminated",
    );
    expect(preview.textContent).toContain("- [ ]     Expires");
  });

  describe("Download .md button", () => {
    const createObjectURL = jest.fn(
      (_obj: Blob | MediaSource): string => "blob:fake",
    );
    const revokeObjectURL = jest.fn((_url: string): void => {});
    let originalCreate: typeof URL.createObjectURL;
    let originalRevoke: typeof URL.revokeObjectURL;
    let clickSpy: jest.SpyInstance;

    beforeEach(() => {
      originalCreate = URL.createObjectURL;
      originalRevoke = URL.revokeObjectURL;
      URL.createObjectURL = createObjectURL as unknown as typeof URL.createObjectURL;
      URL.revokeObjectURL = revokeObjectURL as unknown as typeof URL.revokeObjectURL;
      clickSpy = jest
        .spyOn(HTMLAnchorElement.prototype, "click")
        .mockImplementation(() => {});
      createObjectURL.mockClear();
      revokeObjectURL.mockClear();
    });

    afterEach(() => {
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
      clickSpy.mockRestore();
    });

    it("creates a Blob, clicks a link, and revokes the URL", async () => {
      const user = userEvent.setup();
      render(<Page />);
      await user.click(screen.getByRole("button", { name: /Download \.md/i }));

      expect(createObjectURL).toHaveBeenCalledTimes(1);
      const blob = createObjectURL.mock.calls[0][0] as Blob;
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toContain("text/markdown");
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:fake");
    });

    it("uses filename derived from the party companies", async () => {
      const user = userEvent.setup();
      render(<Page />);
      const companyInputs = screen.getAllByPlaceholderText("Acme, Inc.");
      await user.type(companyInputs[0], "Acme Inc");
      await user.type(companyInputs[1], "Widgetco");

      // Capture the download attribute at click time.
      let capturedDownload = "";
      clickSpy.mockImplementation(function (this: HTMLAnchorElement) {
        capturedDownload = this.download;
      });

      await user.click(screen.getByRole("button", { name: /Download \.md/i }));
      expect(capturedDownload).toBe("Mutual-NDA-acme-inc-widgetco.md");
    });

    it("falls back to party1/party2 slugs when company fields are empty", async () => {
      const user = userEvent.setup();
      render(<Page />);
      let capturedDownload = "";
      clickSpy.mockImplementation(function (this: HTMLAnchorElement) {
        capturedDownload = this.download;
      });
      await user.click(screen.getByRole("button", { name: /Download \.md/i }));
      expect(capturedDownload).toBe("Mutual-NDA-party1-party2.md");
    });

    it("Blob contains the current markdown", async () => {
      const user = userEvent.setup();
      render(<Page />);
      const govInput = screen.getByPlaceholderText("Delaware");
      await user.type(govInput, "Delaware");

      await user.click(screen.getByRole("button", { name: /Download \.md/i }));
      const blob = createObjectURL.mock.calls[0][0] as Blob;
      // jsdom's Blob is missing .text(); read via FileReader.
      const text: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
      });
      expect(text).toContain("# Mutual Non-Disclosure Agreement");
      expect(text).toContain("Governing Law: Delaware");
    });
  });
});
