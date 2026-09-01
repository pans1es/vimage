import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { API } from "@/api";
import { AboutSection } from "./AboutSection";

globalThis.URL.createObjectURL ??= vi.fn();
globalThis.URL.revokeObjectURL ??= vi.fn();

describe("AboutSection diagnostics download", () => {
  beforeEach(() => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-diagnostics");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  it("defers URL.revokeObjectURL past the click, still revokes after the deferred timer fires", async () => {
    vi.spyOn(API, "downloadDiagnostics").mockResolvedValue({
      blob: new Blob(["zip-bytes"]),
      filename: "arcreel-diagnostics.zip",
    });

    render(<AboutSection />);
    const button = screen.getByRole("button", { name: "下载诊断日志" });

    vi.useFakeTimers();
    try {
      fireEvent.click(button);
      for (let i = 0; i < 5; i++) {
        await Promise.resolve();
      }

      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(0);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-diagnostics");
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps the download filename unchanged", async () => {
    vi.spyOn(API, "downloadDiagnostics").mockResolvedValue({
      blob: new Blob(["zip-bytes"]),
      filename: "custom-diagnostics.zip",
    });
    const user = userEvent.setup();
    const createdAnchors: HTMLAnchorElement[] = [];
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName === "a") createdAnchors.push(el as HTMLAnchorElement);
      return el;
    });

    render(<AboutSection />);

    const button = await screen.findByRole("button", { name: "下载诊断日志" });
    await user.click(button);

    await waitFor(() => {
      const target = createdAnchors.find((a) => a.download === "custom-diagnostics.zip");
      expect(target).toBeDefined();
    });
  });
});
