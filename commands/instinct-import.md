---
name: instinct-import
description: Import instincts from file or URL into project/global scope
command: true
---

# Instinct Import Command

## Implementation

Run the instinct CLI using the plugin root path:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" import "$@"
```

Or if `CLAUDE_PLUGIN_ROOT` is not set (manual installation):

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py import "$@"
```

Import instincts from files or URLs into the continuous learning system.

## Usage

```
/instinct-import file.yaml              # Import from local file
/instinct-import https://url/file.yaml  # Import from URL
/instinct-import --global file.yaml     # Import to global scope
/instinct-import --project file.yaml    # Import to project scope (default)
```

## What It Does

1. **Validates the source** - Checks file format and safety
2. **Parses instincts** - Reads YAML or Markdown format instincts
3. **Imports to scope** - Adds to project or global instinct collection
4. **Updates registry** - Records import metadata

## File Formats

### YAML Format
```yaml
---
id: use-conventional-commits
trigger: "when writing a commit message"
confidence: 0.8
domain: git
---

# Use Conventional Commits

## Action
Prefix commits with: feat:, fix:, chore:, docs:, test:, refactor:

## Evidence
- Improves changelog generation
- Makes history searchable
- Follows industry standards
```

### Markdown Format
```markdown
---
instinct_id: prefer-functional-style
trigger: "when writing JavaScript functions"
confidence: 0.9
domain: javascript
---

# Prefer Functional Style

Use functional programming patterns over imperative code when possible.

## Examples
- Use map/filter/reduce over for loops
- Prefer immutable data structures
- Use pure functions without side effects
```

## Import Scopes

### Project Scope (Default)
- Instincts apply only to the current project
- Stored in `~/.claude/homunculus/projects/{project-id}/`
- Automatically detected based on current directory

### Global Scope
- Instincts apply to all projects
- Stored in `~/.claude/homunculus/instincts/personal/`
- Use `--global` flag to import globally

## Safety Features

- **Path validation** - Blocks system directory access
- **Content validation** - Ensures valid YAML/Markdown format
- **ID validation** - Prevents injection attacks
- **Size limits** - Prevents resource exhaustion

## Related Commands

- `/instinct-status` - View imported instincts
- `/evolve` - Convert instincts to skills/commands/agents
- `/skill-create --instincts` - Generate instincts from git history

---

*Part of [Everything Claude Code](https://github.com/Mumu0727/everything-claude-code)*