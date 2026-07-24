# Knowledge Artifact Checklist

> **Checklist ID:** CL-002  
> **Purpose:** Quality gates for knowledge repository artifacts  
> **Version:** 1.0.0

---

## Ontology Concepts
- [ ] Concept ID follows `CON-{CTX}-{NUM}` format
- [ ] File name matches concept name in kebab-case
- [ ] YAML front matter contains all required fields
- [ ] Bounded context exists in DOMAIN.md
- [ ] All relationships reference valid concept IDs
- [ ] No duplicate concept IDs
- [ ] Cross-references are bidirectional
- [ ] Version bumped for any change

## Business Rules
- [ ] Rule ID follows `BR-{NUM}` format
- [ ] All referenced concept IDs exist
- [ ] All referenced rule IDs exist
- [ ] Pseudocode is provided
- [ ] Exceptions are documented
- [ ] Implementation references are provided
- [ ] Version bumped for any change

## Workflows
- [ ] Workflow ID follows `WF-{CTX}-{NUM}` format
- [ ] All steps have Action, Input, Output, On Failure
- [ ] All referenced rule IDs exist
- [ ] Mermaid diagram is valid
- [ ] Exception handling is complete
- [ ] Version bumped for any change

## Glossary
- [ ] Term follows Title Case
- [ ] File name is kebab-case version of term
- [ ] Definition is clear and concise
- [ ] Bounded context exists in DOMAIN.md
- [ ] All concept IDs exist in ontology
- [ ] Related terms cross-reference bidirectionally
- [ ] Version bumped for any change

## General
- [ ] No orphans created
- [ ] No broken links
- [ ] No duplicate concepts
- [ ] Terminology matches glossary
- [ ] YAML front matter is valid
- [ ] Validation checklist completed
