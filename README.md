# J&T Claude Code (JTCC)

> Frontend-focused AI programming assistant for React, Next.js, and TypeScript

**Production-ready** agents, skills, commands, and hooks evolved over 10+ months of intensive daily use building real frontend applications.

---

## Quick Start

### Step 1: Install

```bash
# Global installation
npx jtcc

# Project-level installation
npx jtcc --project

# Selective installation
npx jtcc --with skills:frontend-patterns,tdd-workflow
```

### Step 2: Available Commands

```bash
# Planning and development
/jtcc:plan         # Create implementation plan
/jtcc:tdd          # Test-driven development workflow
/jtcc:code-review  # Code quality review
/jtcc:e2e         # E2E test generation
/jtcc:refactor     # Dead code cleanup
/jtcc:multi        # Frontend multi-service orchestration
```

### Step 3: OpenSpec Commands

```bash
jtcc spec install     # Install openspec-cli
jtcc spec init        # Initialize project
jtcc spec list        # List all changes
jtcc spec show <id>   # Show change details
jtcc spec validate    # Validate change format
jtcc spec help        # Show help
```

---

## What's Included

### Skills (9)

| Skill | Description |
|--------|-------------|
| `frontend-patterns` | React, Next.js patterns and best practices |
| `frontend-slides` | HTML presentation builder |
| `tdd-workflow` | Test-driven development methodology |
| `e2e-testing` | Playwright E2E testing patterns |
| `nextjs-turbopack` | Next.js Turbopack optimization |
| `coding-standards` | General coding standards |
| `search-first` | Research-first development workflow |
| `documentation-lookup` | Documentation search and retrieval |

### Agents (7)

| Agent | Description |
|--------|-------------|
| `planner` | Feature planning and implementation plans |
| `tdd-guide` | Test-driven development guidance |
| `code-reviewer` | Code quality and security review |
| `architect` | System design decisions |
| `security-reviewer` | Vulnerability analysis |
| `e2e-runner` | E2E test execution |
| `refactor-cleaner` | Dead code cleanup |

### Commands (6)

| Command | Description |
|---------|-------------|
| `/jtcc:plan` | Create implementation plan |
| `/jtcc:tdd` | TDD workflow |
| `/jtcc:code-review` | Code review |
| `/jtcc:e2e` | E2E test generation |
| `/jtcc:refactor` | Dead code cleanup |
| `/jtcc:multi` | Frontend multi-service orchestration |

---

## Directory Structure

```
jtcc/
├── agents/              # Specialized subagents
├── commands/            # Slash commands
├── skills/              # Workflow definitions
├── hooks/               # Trigger-based automations
├── rules/               # Always-follow guidelines
├── mcp-configs/         # MCP server configurations
├── scripts/             # Cross-platform Node.js scripts
└── openspec/            # OpenSpec workflow support
```

---

## Common Workflows

### Starting a new feature

```
/jtcc:plan "Add user authentication with OAuth"
        → planner creates implementation blueprint
/jtcc:tdd
        → tdd-guide enforces write-tests-first
/jtcc:code-review
        → code-reviewer checks your work
```

### Fixing a bug

```
/jtcc:tdd
        → tdd-guide: write failing test that reproduces bug
        → implement fix, verify test passes
/jtcc:code-review
        → code-reviewer: catch regressions
```

### Preparing for production

```
/jtcc:e2e
        → e2e-runner: critical user flow tests
```

---

## Installation Options

### Global Installation

Installs to `~/.claude/` for use across all projects:

```bash
npx jtcc
```

### Project-level Installation

Installs to `.claude/` in current project only:

```bash
npx jtcc --project
```

### Selective Installation

Install only specific components:

```bash
npx jtcc --with skills:frontend-patterns,tdd-workflow
npx jtcc --with agents:planner,tdd-guide
npx jtcc --with hooks:session-start,session-end
npx jtcc --with commands:plan,tdd,code-review
```

---

## OpenSpec Integration

JTCC provides OpenSpec CLI integration for structured change management:

```bash
# Install OpenSpec CLI
jtcc spec install

# Initialize project
jtcc spec init

# List changes
jtcc spec list

# Show change details
jtcc spec show <change-id>

# Validate change
jtcc spec validate <change-id>
```

OpenSpec commands are executed via bash passthrough, no additional installation required.

---

## Requirements

- **Node.js**: >=18
- **Claude Code CLI**: v2.1.0 or later

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ideas for Contributions

- Additional frontend framework support (Vue, Svelte, Solid)
- More testing strategies (visual regression, performance)
- Enhanced MCP configurations for frontend tools
- Project templates and scaffolding

---

## License

MIT - Use freely, modify as needed, contribute back if you can.

---

**Built by J&T Team for frontend development excellence.**
