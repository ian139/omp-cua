# omp-cua

Use [Cua Driver](https://github.com/trycua/cua) as a low-overhead computer-use backend in [Oh My Pi](https://github.com/can1357/oh-my-pi).

`omp-cua` connects OMP to Cua's cross-platform desktop driver. Cua's operations stay mounted behind OMP's `xd://` device boundary, so dozens of computer-use schemas do not occupy every model request. A small `/cua` command handles diagnostics without duplicating Cua's action or permission logic.

## What you get

- Background desktop control through Cua Driver on macOS, Windows, and Linux
- OMP-native MCP discovery from the plugin package
- On-demand Cua tool schemas instead of a permanently expanded tool roster
- `/cua` diagnostics for daemon health, permissions, versions, and available tools
- Cua's upstream skill pack for safe observe, act, and verify workflows

This is an alternative backend to OMP's built-in `/computer` tool. It does not replace or patch OMP internals.

## Install

### 1. Install Cua Driver

Follow the current [Cua Driver installation instructions](https://github.com/trycua/cua/releases?q=cua-driver-rs&expanded=true). The driver publishes native builds for macOS, Windows, and Linux.

Verify the executable is available:

```console
cua-driver --version
```

### 2. Complete driver setup

Install Cua's version-matched agent instructions:

```console
cua-driver skills install
```

On macOS, request and verify the required Accessibility and Screen Recording grants through the signed Cua app:

```console
cua-driver permissions grant
```

The operating system owns these grants. `omp-cua` never bypasses or writes them.

### 3. Install the OMP plugin

```console
omp plugin install github:wolfiesch/omp-cua
```

Restart OMP once so the extension and MCP server are discovered.

## Use

Ask OMP to operate a desktop app normally:

> Open Calculator, enter 144 / 12, and tell me the result.

The Cua skill selects the driver. OMP loads individual Cua schemas through its mounted `xd://` device surface only when needed.

Inspect the integration from the TUI:

```text
/cua status
/cua permissions
/cua doctor
/cua tools
/cua version
/cua updates
```

`/cua` with no argument is equivalent to `/cua status`. Every subcommand is diagnostic and uses fixed driver arguments. It cannot grant permissions, install updates, or forward arbitrary shell input.

## How it works

```text
OMP session
├── omp-cua extension
│   └── /cua diagnostics
└── omp-cua .mcp.json
    └── cua-driver mcp
        └── Cua Driver daemon
            └── native accessibility, capture, and input APIs
```

The plugin has two intentionally narrow responsibilities:

1. Declare `cua-driver mcp` through OMP's package-local `.mcp.json` capability.
2. Register a stateless diagnostics command that invokes a small fixed set of read-only CLI operations.

Cua Driver remains the source of truth for tool schemas, session authorization, platform support, updates, and permission handling. This avoids version-skewed wrappers and keeps the integration maintainable.

## Security model

- Extensions and local MCP servers run with the user's account permissions. They are not sandboxes.
- Cua Driver defaults to its standard authorization mode. Do not use `--dangerously-bypass-approvals` unless you intentionally accept unrestricted desktop control.
- Existing logged-in browser profiles require a separate, explicit Cua approval flow.
- The plugin never installs or updates Cua Driver, changes its configuration, or grants operating-system permissions.
- Review Cua's [security documentation](https://github.com/trycua/cua/security) before using the driver on sensitive machines.

See [SECURITY.md](SECURITY.md) for reporting issues in this integration.

## Troubleshooting

Run the focused diagnostics first:

```text
/cua doctor
```

If OMP cannot find the binary, confirm `cua-driver` is on the `PATH` inherited by the terminal that launches OMP. If the MCP server was installed during an active session, restart OMP or use OMP's MCP reconnect flow.

Check for a current driver release without installing it:

```text
/cua updates
```

Driver defects and platform compatibility issues belong in [trycua/cua](https://github.com/trycua/cua/issues). Plugin discovery or `/cua` command defects belong in this repository.

## Uninstall

```console
omp plugin uninstall omp-cua
```

This removes the OMP plugin. It does not remove Cua Driver or revoke operating-system permissions.

## Development

Requires [Bun](https://bun.sh/):

```console
bun test
```

To test a checkout without installing it:

```console
omp --extension ./index.ts
```

## License

MIT. Cua Driver and Oh My Pi are separate projects with their own licenses.
