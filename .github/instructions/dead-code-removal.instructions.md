---
description: 'Use when modifying, removing, renaming, or replacing code. Enforces cleanup of all code that becomes unused or unnecessary as a result of changes.'
---

# Dead Code Removal

When any change makes existing code unnecessary, **remove it in the same edit session**. Never leave orphaned code behind for "later cleanup."

## Situations Requiring Removal

### Deleted or replaced features

- Remove all components, hooks, utilities, styles, assets, and config entries that exclusively served the removed feature
- Remove route definitions and data files for deleted pages

### Renamed or moved files

- Delete the old file after confirming nothing imports it
- Remove stale re-exports or barrel entries that pointed to the old name

### Changed approach or implementation

- Remove the previous implementation (old helper functions, old state variables, old effects) that the new approach replaces
- Remove imports that are no longer referenced

### Simplified logic

- Remove variables, constants, or memoized values that are no longer read
- Remove callbacks or event handlers that are no longer attached
- Remove conditional branches that can no longer be reached

### Removed dependencies between modules

- If a hook, utility, or component loses its last consumer, delete it
- If a CSS module class is no longer applied anywhere, remove the rule
- If a config constant is no longer imported anywhere, remove it

### Changed component props or signatures

- Remove prop handling code in the component if a prop is dropped
- Remove prop-related types, defaults, or validation that no longer apply

### Removed or replaced imports

- Remove the source file/export if nothing else imports it
- Remove package dependencies from `package.json` if no file imports them

## Verification Steps

Before finishing a task:

1. Check that no import in the changed files references a deleted or renamed export
2. Confirm files you created or modified don't import symbols that no longer exist
3. Search for remaining usages of any deleted function, component, hook, or variable — if zero usages remain, delete the source
4. Verify CSS module files don't contain classes with zero references in their owning component
