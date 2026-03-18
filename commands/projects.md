---
name: projects
description: List known projects and their instinct statistics
command: true
---

# Projects Command

## Implementation

Run the instinct CLI using the plugin root path:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" projects "$@"
```

Or if `CLAUDE_PLUGIN_ROOT` is not set (manual installation):

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py projects "$@"
```

List all known projects in the continuous learning system with their instinct statistics.

## Usage

```
/projects                    # List all projects with stats
/projects --verbose         # Include detailed instinct information
/projects --sort-by count   # Sort by instinct count
/projects --sort-by name    # Sort by project name (default)
```

## What It Shows

For each registered project:
- **Project ID** - Unique identifier (hash-based)
- **Project Name** - Human-readable name
- **Project Path** - Local filesystem location
- **Instinct Count** - Number of learned instincts
- **Last Activity** - Most recent learning session
- **Confidence Stats** - High/medium/low confidence breakdown

## Example Output

```
============================================================
  KNOWN PROJECTS - Continuous Learning Registry
============================================================

📊 Total: 5 projects | Global instincts: 12

## ACTIVE PROJECTS

1. my-ecommerce-app (e8f7a2b9c1d3)
   📁 /Users/dev/projects/my-ecommerce-app
   📚 Instincts: 15 (8 high, 4 medium, 3 low confidence)
   🕒 Last activity: 2 hours ago
   🎯 Domains: javascript, typescript, react, testing

2. logistics-dashboard (a1b2c3d4e5f6)
   📁 /Users/dev/work/logistics-dashboard
   📚 Instincts: 23 (12 high, 7 medium, 4 low confidence)
   🕒 Last activity: 1 day ago
   🎯 Domains: javascript, logistics, charts, api

3. mobile-app-backend (c4d5e6f7a8b9)
   📁 /Users/dev/mobile/backend
   📚 Instincts: 8 (3 high, 3 medium, 2 low confidence)
   🕒 Last activity: 3 days ago
   🎯 Domains: nodejs, express, mongodb, authentication

## INACTIVE PROJECTS

4. old-prototype (f9e8d7c6b5a4)
   📁 /Users/dev/archive/prototype
   📚 Instincts: 5 (1 high, 2 medium, 2 low confidence)
   🕒 Last activity: 2 weeks ago
   🎯 Domains: python, flask

5. experiment-ai-chat (b3c4d5e6f7a8)
   📁 /Users/dev/experiments/ai-chat
   📚 Instincts: 2 (0 high, 1 medium, 1 low confidence)
   🕒 Last activity: 1 month ago
   🎯 Domains: python, ai, websockets

============================================================
Summary:
• Most active: logistics-dashboard (23 instincts)
• Highest confidence: my-ecommerce-app (8 high-confidence instincts)
• Promotion candidates: 4 instincts across 2+ projects
============================================================
```

## Verbose Mode

Using `/projects --verbose` shows detailed instinct information:

```
## PROJECT DETAILS

my-ecommerce-app (e8f7a2b9c1d3)
📁 /Users/dev/projects/my-ecommerce-app

High Confidence Instincts (8):
  • use-conventional-commits (git, 0.92) - commit message patterns
  • prefer-functional-style (javascript, 0.89) - coding patterns
  • add-tests-with-features (testing, 0.85) - TDD workflow
  • use-typescript-strict (typescript, 0.83) - type safety
  • prefer-css-modules (css, 0.81) - styling approach

Medium Confidence Instincts (4):
  • validate-api-inputs (api, 0.75) - input validation
  • use-barrel-exports (javascript, 0.68) - module organization
  • prefer-async-await (javascript, 0.72) - async patterns
  • cache-api-responses (performance, 0.69) - optimization

Low Confidence Instincts (3):
  • use-graphql-over-rest (api, 0.45) - needs more evidence
  • prefer-styled-components (css, 0.52) - conflicting patterns
  • use-jest-over-vitest (testing, 0.38) - insufficient data
```

## Project Registry

Projects are automatically registered when:
- First instinct is observed in a new directory
- `/instinct-status` is run in a new project
- Continuous learning hooks detect new project context

### Project Detection
Projects are identified by:
1. **Git repository root** (if in git repo)
2. **Package.json location** (for Node.js projects)
3. **Working directory** (fallback)

### Project ID Generation
```bash
# Project ID is a hash of the canonical project path
echo "/Users/dev/projects/my-app" | sha256sum | head -c 12
# Result: e8f7a2b9c1d3
```

## Cleanup and Maintenance

### Inactive Projects
Projects are marked inactive if no learning activity for >30 days.

### Registry Cleanup
```bash
# Manual registry cleanup (advanced)
python3 ~/.claude/plugins/continuous-learning-v2/scripts/instinct-cli.py projects --clean-inactive
```

## Integration with Other Commands

- `/instinct-status` - Show instincts for current project
- `/promote` - Promote instincts from project to global scope
- `/evolve` - Create skills/commands/agents from project patterns
- `/instinct-import --project` - Import instincts to current project

## Related Files

- **Registry**: `~/.claude/homunculus/projects.json`
- **Project data**: `~/.claude/homunculus/projects/{project-id}/`
- **Global instincts**: `~/.claude/homunculus/instincts/`

---

*Part of [Everything Claude Code](https://github.com/Mumu0727/everything-claude-code)*