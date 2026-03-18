---
name: promote
description: Promote project-scoped instincts to global scope
command: true
---

# Promote Command

## Implementation

Run the instinct CLI using the plugin root path:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" promote "$@"
```

Or if `CLAUDE_PLUGIN_ROOT` is not set (manual installation):

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py promote "$@"
```

Promote project-scoped instincts to global scope for use across all projects.

## Usage

```
/promote                          # Auto-promote qualifying instincts
/promote instinct-id             # Promote specific instinct
/promote --dry-run               # Preview without promoting
/promote --force                 # Skip confirmation prompts
/promote instinct-id --force     # Force promote specific instinct
```

## What It Does

1. **Analyzes project instincts** - Identifies candidates for promotion
2. **Checks qualification criteria** - Confidence levels and evidence
3. **Promotes to global scope** - Moves instincts from project to global
4. **Updates metadata** - Records promotion source and date

## Promotion Criteria

### Auto-Promotion Qualifications
Instincts are automatically considered for promotion if they:
- Have **confidence ≥ 0.8** (high confidence)
- Exist in **≥ 2 projects** with similar patterns
- Have consistent **trigger patterns**
- Show **stable behavior** over time

### Manual Promotion
You can manually promote any instinct using:
```
/promote specific-instinct-id
```

## Example Usage

### Auto-Promotion
```bash
/promote
```

Output:
```
============================================================
  PROMOTION ANALYSIS - my-app (a1b2c3d4e5f6)
============================================================

Candidates for global promotion: 3

[HIGH CONFIDENCE] use-conventional-commits (git)
  Confidence: 0.92
  Found in 3 projects with similar patterns
  ✅ Qualifies for auto-promotion

[HIGH CONFIDENCE] prefer-functional-style (javascript)
  Confidence: 0.85
  Found in 2 projects with identical triggers
  ✅ Qualifies for auto-promotion

[MEDIUM] add-tests-with-features (testing)
  Confidence: 0.75
  Only in current project
  ❌ Does not qualify (needs more projects)

Promote 2 qualified instincts? (y/n): y

✅ Promoted use-conventional-commits to global scope
✅ Promoted prefer-functional-style to global scope

Promoted 2 instincts to global scope.
```

### Specific Promotion
```bash
/promote use-typescript-strict --force
```

Output:
```
✅ Promoted use-typescript-strict to global scope
   Source: my-app (a1b2c3d4e5f6)
   Confidence: 0.65
   Note: Promoted with --force (below auto-promotion threshold)
```

### Dry Run
```bash
/promote --dry-run
```

Output:
```
DRY RUN: Would promote 2 instincts
  - use-conventional-commits (0.92 confidence)
  - prefer-functional-style (0.85 confidence)

No changes made. Run without --dry-run to execute.
```

## Promotion Effects

### What Happens When Promoted
1. **Instinct becomes global** - Available to all projects
2. **Metadata updated** - Records promotion source and date
3. **Project copy remains** - Original project version preserved
4. **Global precedence** - Global version takes priority in conflicts

### Global Instinct Metadata
Promoted instincts include additional metadata:
```yaml
---
id: use-conventional-commits
confidence: 0.92
source: auto-promoted
promoted_from: my-app
promoted_date: 2024-01-15T10:30:00Z
---
```

## Best Practices

### When to Promote
- ✅ **High confidence patterns** (≥0.8) used across multiple projects
- ✅ **Universal best practices** that apply broadly
- ✅ **Stable patterns** that haven't changed recently
- ✅ **Team conventions** everyone should follow

### When NOT to Promote
- ❌ **Project-specific patterns** that don't apply elsewhere
- ❌ **Low confidence instincts** (< 0.8) needing more evidence
- ❌ **Experimental patterns** still being evaluated
- ❌ **Controversial practices** without team consensus

## Related Commands

- `/instinct-status` - View current instincts and promotion candidates
- `/instinct-import --global` - Import instincts directly to global scope
- `/projects` - View instinct statistics across all projects
- `/evolve` - Convert instincts to reusable skills/commands/agents

---

*Part of [Everything Claude Code](https://github.com/Mumu0727/everything-claude-code)*