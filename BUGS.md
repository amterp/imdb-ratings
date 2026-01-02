# Known Bugs

## Episode Gap Handling

**Status:** Open
**Discovered:** 2026-01-01

### Problem

The frontend does not handle gaps in episode numbers. When a show has missing episodes (e.g., Sesame Street `tt0063951` Season 6 has episodes `[1, 56, 59, 60, 92]`), the heatmap renders them sequentially as if they were episodes 1-5.

### Current Behavior

- Data contains explicit episode numbers with gaps
- Frontend ignores episode numbers entirely
- Episodes render at positions based on array index, not actual episode number
- Later seasons appear truncated because many episodes lack ratings

### Expected Behavior

Either:
1. Display gaps visually (empty cells for missing episodes), or
2. Show actual episode numbers in tooltips/labels so users know which episode they're looking at

### Affected Shows

39 shows have non-sequential episode numbers, including:
- `tt0063951` (Sesame Street) - severe gaps across multiple seasons
- `tt0458254` - cascading gaps in seasons 3-5
- `tt0983983` - single gap in season 7

### Related

This bug may be addressed as part of the data format changes that make episode numbers implicit via array index, which would naturally require the frontend to handle gaps properly.
