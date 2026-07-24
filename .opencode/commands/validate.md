---
description: Validate knowledge repository consistency
agent: qa-validator
---

Validate the knowledge repository for consistency and quality:

$ARGUMENTS

## Steps

1. Run `bun run validate`
2. Review validation report
3. Check for:
   - Duplicated concepts
   - Broken links
   - Orphan nodes
   - Missing READMEs
   - Missing metadata
4. Fix any issues found
5. Re-run validation
6. Generate quality report

## Output

Report:
- Total files checked
- Quality gates passed/failed
- Issues found and fixed
- Recommendations
