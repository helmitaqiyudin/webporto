// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import ErrorBoundary from "./errorBoundary";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function Thrower(): never {
  throw new RangeError("Invalid time value");
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

it("renders the fallback instead of letting a widget crash the page", async () => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(() => {
    root.render(
      <div>
        <p>Projects</p>
        <ErrorBoundary fallback={<p>Offline right now</p>}>
          <Thrower />
        </ErrorBoundary>
      </div>,
    );
  });
  expect(container.textContent).toContain("Projects");
  expect(container.textContent).toContain("Offline right now");
  await act(() => root.unmount());
});
