import { describe, expect, test } from "bun:test";
import type { ExtensionAPI, ExtensionCommandContext } from "@oh-my-pi/pi-coding-agent";
import cuaExtension, { parseCuaCommand } from "./index";

interface RegisteredCommand {
  getArgumentCompletions?: (prefix: string) => Array<{ value: string }> | null;
  handler: (args: string, ctx: ExtensionCommandContext) => Promise<void>;
}

function createHarness(result = { code: 0, stdout: "running", stderr: "" }) {
  let registered: RegisteredCommand | undefined;
  const execCalls: Array<{ command: string; args: string[]; timeout: number | undefined }> = [];
  const notifications: Array<{ message: string; type: string }> = [];

  const pi = {
    setLabel(label: string) {
      expect(label).toBe("Cua Driver");
    },
    registerCommand(name: string, command: RegisteredCommand) {
      expect(name).toBe("cua");
      registered = command;
    },
    async exec(command: string, args: string[], options?: { timeout?: number }) {
      execCalls.push({ command, args, timeout: options?.timeout });
      return result;
    },
  } as unknown as ExtensionAPI;

  const ctx = {
    ui: {
      notify(message: string, type: string) {
        notifications.push({ message, type });
      },
    },
  } as unknown as ExtensionCommandContext;

  cuaExtension(pi);
  if (!registered) throw new Error("extension did not register /cua");
  return { command: registered, ctx, execCalls, notifications };
}

describe("parseCuaCommand", () => {
  test("defaults to status and normalizes input", () => {
    expect(parseCuaCommand("")).toBe("status");
    expect(parseCuaCommand("  PeRmiSsIoNs  ")).toBe("permissions");
  });

  test("rejects arbitrary driver arguments", () => {
    expect(() => parseCuaCommand("update --apply")).toThrow("Usage: /cua");
  });
});

describe("cua extension", () => {
  test("runs fixed driver arguments without a shell", async () => {
    const harness = createHarness();
    await harness.command.handler("permissions", harness.ctx);

    expect(harness.execCalls).toEqual([
      { command: "cua-driver", args: ["permissions", "status", "--json"], timeout: 30_000 },
    ]);
    expect(harness.notifications).toEqual([
      { message: "Cua Driver permissions\nrunning", type: "info" },
    ]);
  });

  test("help is local and does not execute the driver", async () => {
    const harness = createHarness();
    await harness.command.handler("help", harness.ctx);

    expect(harness.execCalls).toHaveLength(0);
    expect(harness.notifications[0]?.message).toContain("on-demand xd:// tools");
  });

  test("reports failed diagnostics with the upstream repair path", async () => {
    const harness = createHarness({ code: 13, stdout: "", stderr: "daemon unavailable" });
    await harness.command.handler("status", harness.ctx);

    expect(harness.notifications).toEqual([
      {
        message: "Cua Driver status\ndaemon unavailable\n\nInstall or repair Cua Driver: https://cua.ai/driver",
        type: "error",
      },
    ]);
  });

  test("offers prefix completions", () => {
    const harness = createHarness();
    expect(harness.command.getArgumentCompletions?.("per")).toEqual([
      { value: "permissions", label: "permissions", description: "Show OS permission grants" },
    ]);
  });
});
