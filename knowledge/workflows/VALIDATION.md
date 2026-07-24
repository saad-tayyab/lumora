# Workflow Validation Report

> **Generated:** 2026-07-24  
> **Total Workflows:** 7  
> **Status:** PASS

---

## Validation Summary

| Check | Result |
|-------|--------|
| All workflow IDs follow WF-{CTX}-{NUM} format | PASS |
| All file names match workflow name convention | PASS |
| All YAML front matter contains required fields | PASS |
| All steps have Action, Input, Output, On Failure | PASS |
| All Mermaid diagrams are valid | PASS |
| All exception handling is complete | PASS |
| All referenced rule IDs exist | PASS |
| All referenced concept IDs exist | PASS |
| INDEX.md workflow count matches actual count | PASS |
| manifests/workflows.yml contains all workflows | PASS |

---

## Per-Workflow Results

### WF-AR-001: Invoice Creation Workflow
| Check | Status |
|-------|--------|
| ID format | PASS |
| File name | PASS |
| YAML front matter | PASS |
| Step definitions | PASS |
| Mermaid diagram | PASS |
| Exception handling | PASS |
| Rule references (BR-002, BR-044) | PASS |
| Concept references (CON-AR-001, CON-AR-002) | PASS |

### WF-AR-002: Payment Receipt Workflow
| Check | Status |
|-------|--------|
| ID format | PASS |
| File name | PASS |
| YAML front matter | PASS |
| Step definitions | PASS |
| Mermaid diagram | PASS |
| Exception handling | PASS |
| Rule references (BR-002, BR-044) | PASS |
| Concept references (CON-AR-001, CON-AR-002) | PASS |

### WF-FIN-001: Journal Entry Posting Workflow
| Check | Status |
|-------|--------|
| ID format | PASS |
| File name | PASS |
| YAML front matter | PASS |
| Step definitions | PASS |
| Mermaid diagram | PASS |
| Exception handling | PASS |
| Rule references (BR-002, BR-044, BR-051) | PASS |
| Concept references (CON-FIN-011, CON-FIN-056) | PASS |

### WF-INV-001: Stock Reorder Automation
| Check | Status |
|-------|--------|
| ID format | PASS |
| File name | PASS |
| YAML front matter | PASS |
| Step definitions | PASS |
| Mermaid diagram | PASS |
| Exception handling | PASS |
| Rule references (BR-005) | PASS |
| Concept references (CON-INV-001, CON-INV-002) | PASS |

### WF-PROC-001: Purchase Order Workflow
| Check | Status |
|-------|--------|
| ID format | PASS |
| File name | PASS |
| YAML front matter | PASS |
| Step definitions | PASS |
| Mermaid diagram | PASS |
| Exception handling | PASS |
| Rule references | PASS |
| Concept references (CON-PROC-001, CON-PROC-002, CON-PROC-003) | PASS |

### WF-AP-001: Bill Processing Workflow
| Check | Status |
|-------|--------|
| ID format | PASS |
| File name | PASS |
| YAML front matter | PASS |
| Step definitions | PASS |
| Mermaid diagram | PASS |
| Exception handling | PASS |
| Rule references (BR-004) | PASS |
| Concept references (CON-AP-001, CON-AP-003, CON-AP-006) | PASS |

### WF-HR-001: Leave Request Approval Workflow
| Check | Status |
|-------|--------|
| ID format | PASS |
| File name | PASS |
| YAML front matter | PASS |
| Step definitions | PASS |
| Mermaid diagram | PASS |
| Exception handling | PASS |
| Rule references (BR-623) | PASS |
| Concept references (CON-HR-001, CON-HR-005, CON-HR-006, CON-HR-017) | PASS |

---

## Diagram Inventory

| Workflow | Diagram File | Status |
|----------|-------------|--------|
| WF-AR-001 | diagrams/invoice-creation.mermaid | PASS |
| WF-AR-002 | diagrams/payment-receipt.mermaid | PASS |
| WF-FIN-001 | diagrams/journal-posting.mermaid | PASS |
| WF-INV-001 | diagrams/stock-reorder.mermaid | PASS |
| WF-PROC-001 | diagrams/purchase-order.mermaid | PASS |
| WF-AP-001 | diagrams/bill-processing.mermaid | PASS |
| WF-HR-001 | diagrams/leave-request.mermaid | PASS |
| Cross-workflow | diagrams/order-to-cash.mermaid | PASS |

---

*This report is auto-generated. Re-run validation after any workflow changes.*
