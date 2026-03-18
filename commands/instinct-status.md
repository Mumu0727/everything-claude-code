---
name: instinct-status
description: Show learned instincts (project + global) with confidence levels
command: true
---

# Instinct Status Command

## Implementation

Run the instinct CLI using the plugin root path:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" status "$@"
```

Or if `CLAUDE_PLUGIN_ROOT` is not set (manual installation):

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py status "$@"
```

Display all learned instincts with their confidence levels, domains, and scopes.

## Usage

```
/instinct-status                    # Show all instincts
/instinct-status --project         # Show only project-scoped instincts
/instinct-status --global          # Show only global instincts
/instinct-status --domain git      # Filter by domain
/instinct-status --min-confidence 0.8  # Show only high-confidence instincts
```

## What It Shows

### Project Information
- Current project ID and path
- Project-scoped vs global instinct counts
- Last learning activity timestamp

### Instinct Details
For each instinct:
- **ID** - Unique identifier
- **Trigger** - When it activates
- **Confidence** - Learning confidence (0.0-1.0)
- **Domain** - Subject area (git, javascript, testing, etc.)
- **Scope** - Project or global
- **Source** - How it was learned (observation, import, etc.)

## Example Output

```
============================================================
  INSTINCT STATUS - my-app (a1b2c3d4e5f6)
  Project-scoped: 8 | Global: 4 | Total: 12
============================================================

## HIGH CONFIDENCE (>=0.8) - 5 instincts

[PROJECT] use-conventional-commits (git)
  Trigger: when writing a commit message
  Confidence: 0.92
  Source: observation

[GLOBAL] prefer-functional-style (javascript)
  Trigger: when writing JavaScript functions
  Confidence: 0.85
  Source: imported

## MEDIUM CONFIDENCE (0.6-0.8) - 4 instincts

[PROJECT] add-tests-with-features (testing)
  Trigger: when adding new functionality
  Confidence: 0.75
  Source: observation

## LOW CONFIDENCE (<0.6) - 3 instincts

[PROJECT] use-typescript-strict (typescript)
  Trigger: when configuring TypeScript
  Confidence: 0.45
  Source: observation
  Note: Needs more evidence

============================================================
Last activity: 2 hours ago
Ready for evolution: 2 instinct clusters detected
============================================================
```

## Confidence Levels

| Range | Level | Meaning |
|-------|-------|---------|
| 0.8-1.0 | **High** | Strong evidence, ready to use |
| 0.6-0.8 | **Medium** | Some evidence, use with caution |
| 0.0-0.6 | **Low** | Limited evidence, needs more data |

## Filtering Options

### By Scope
- `--project` - Show only project-specific instincts
- `--global` - Show only global instincts

### By Domain
- `--domain git` - Git-related instincts
- `--domain javascript` - JavaScript coding patterns
- `--domain testing` - Testing practices
- `--domain typescript` - TypeScript patterns

### By Confidence
- `--min-confidence 0.8` - High-confidence only
- `--max-confidence 0.6` - Low-confidence only

## Evolution Readiness

The status command also shows:
- **Instinct clusters** - Groups ready for evolution
- **Promotion candidates** - Project instincts ready for global scope
- **Low-confidence items** - Instincts needing more evidence

## Related Commands

- `/instinct-import` - Import instincts from files
- `/evolve` - Convert instincts to skills/commands/agents
- `/promote` - Promote project instincts to global scope
- `/learn-eval` - Evaluate current session for new instincts

---

*Part of [Everything Claude Code](https://github.com/Mumu0727/everything-claude-code)*