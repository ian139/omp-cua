# Security policy

## Reporting an issue

Do not open a public issue for a vulnerability that could enable unauthorized desktop input, screen capture, permission bypass, command execution, or disclosure of sensitive local data.

Report integration-specific vulnerabilities through [GitHub private vulnerability reporting](https://github.com/wolfiesch/omp-cua/security/advisories/new).

Report vulnerabilities in the driver itself to the [Cua project](https://github.com/trycua/cua/security). Report vulnerabilities in OMP's extension or MCP runtime to the [Oh My Pi project](https://github.com/can1357/oh-my-pi/security).

Include the operating system, OMP version, Cua Driver version, exact command or tool involved, expected authorization boundary, and a minimal reproduction. Remove credentials, screenshots containing private data, local usernames, and absolute home-directory paths.

## Scope

This repository owns only:

- OMP's package-local Cua MCP declaration
- The `/cua` diagnostics extension
- Installation and usage documentation for that integration

Cua Driver owns desktop automation, tool schemas, runtime authorization, capture, input, browser attachment, and operating-system permission handling.
