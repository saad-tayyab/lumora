---
id: CTR-CASH-001
concept: CON-CASH-001
attribute: current_balance
type: invariant
scope: tenant_id
description: "Bank account balance must be numeric with decimal precision (never floating point)"
severity: error
version: 1.0.0
---

# BC-CASH Constraints

## Overview
This file defines all constraints for the BC-CASH (Cash & Treasury) bounded context. Constraints enforce data integrity and business invariants.

---

## Constraints

### CTR-CASH-001: Balance Decimal Precision
| Field | Value |
|-------|-------|
| Concept | CON-CASH-001 (BankAccount) |
| Attribute | current_balance |
| Type | invariant |
| Scope | tenant_id |
| Severity | error |
| Description | Bank account balance must be numeric with decimal precision (never floating point) |

### CTR-CASH-002: Account Number Encryption
| Field | Value |
|-------|-------|
| Concept | CON-CASH-001 (BankAccount) |
| Attribute | account_number |
| Type | invariant |
| Scope | tenant_id |
| Severity | error |
| Description | Account number must be encrypted at rest |

### CTR-CASH-003: Transfer Amount Positive
| Field | Value |
|-------|-------|
| Concept | CON-CASH-002 (BankTransfer) |
| Attribute | amount |
| Type | range |
| Scope | tenant_id |
| Severity | error |
| Description | Transfer amount must be greater than zero |

### CTR-CASH-004: Source Different From Destination
| Field | Value |
|-------|-------|
| Concept | CON-CASH-002 (BankTransfer) |
| Attribute | source_account_id, destination_account_id |
| Type | invariant |
| Scope | tenant_id |
| Severity | error |
| Description | Source and destination accounts must be different |

### CTR-CASH-005: Statement Period Order
| Field | Value |
|-------|-------|
| Concept | CON-CASH-003 (BankStatement) |
| Attribute | period_start, period_end |
| Type | invariant |
| Scope | tenant_id |
| Severity | error |
| Description | Statement period end must be after period start |

### CTR-CASH-006: Match Confidence Range
| Field | Value |
|-------|-------|
| Concept | CON-CASH-004 (ReconciliationEntry) |
| Attribute | match_confidence |
| Type | range |
| Scope | tenant_id |
| Severity | error |
| Description | Match confidence must be between 0.0 and 1.0 |

### CTR-CASH-007: Match Amount Non-Negative
| Field | Value |
|-------|-------|
| Concept | CON-CASH-005 (ReconciliationMatch) |
| Attribute | amount_difference |
| Type | range |
| Scope | tenant_id |
| Severity | error |
| Description | Amount difference must be non-negative |

### CTR-CASH-008: Tolerance Non-Negative
| Field | Value |
|-------|-------|
| Concept | CON-CASH-005 (ReconciliationMatch) |
| Attribute | tolerance_applied |
| Type | range |
| Scope | tenant_id |
| Severity | error |
| Description | Tolerance applied must be non-negative |

### CTR-CASH-009: Currency Code Format
| Field | Value |
|-------|-------|
| Concept | CON-CASH-006 (Currency) |
| Attribute | code |
| Type | pattern |
| Scope | global |
| Severity | error |
| Description | Currency code must be a valid ISO 4217 code (3 uppercase letters) |

### CTR-CASH-010: Access Token Encryption
| Field | Value |
|-------|-------|
| Concept | CON-CASH-007 (BankConnection) |
| Attribute | access_token |
| Type | invariant |
| Scope | tenant_id |
| Severity | error |
| Description | Access tokens must be encrypted at rest |

### CTR-CASH-011: Policy Tolerance Non-Negative
| Field | Value |
|-------|-------|
| Concept | CON-CASH-015 (ReconciliationTolerancePolicy) |
| Attribute | tolerance_value |
| Type | range |
| Scope | tenant_id |
| Severity | error |
| Description | Tolerance value must be non-negative |

### CTR-CASH-012: Policy Confidence Range
| Field | Value |
|-------|-------|
| Concept | CON-CASH-015 (ReconciliationTolerancePolicy) |
| Attribute | max_auto_match_confidence |
| Type | range |
| Scope | tenant_id |
| Severity | error |
| Description | Max auto-match confidence must be between 0.0 and 1.0 |

### CTR-CASH-013: Policy Effective Date Order
| Field | Value |
|-------|-------|
| Concept | CON-CASH-015 (ReconciliationTolerancePolicy) |
| Attribute | effective_from, effective_to |
| Type | invariant |
| Scope | tenant_id |
| Severity | error |
| Description | Effective from must be before effective to (if provided) |

### CTR-CASH-014: Single Active Tolerance Policy
| Field | Value |
|-------|-------|
| Concept | CON-CASH-015 (ReconciliationTolerancePolicy) |
| Attribute | effective_to |
| Type | unique |
| Scope | tenant_id |
| Severity | error |
| Description | Only one policy can be active per tenant at a time |

### CTR-CASH-015: Fee Policy Effective Date Order
| Field | Value |
|-------|-------|
| Concept | CON-CASH-016 (BankFeePolicy) |
| Attribute | effective_from, effective_to |
| Type | invariant |
| Scope | tenant_id |
| Severity | error |
| Description | Effective from must be before effective to (if provided) |

### CTR-CASH-016: Single Active Fee Policy
| Field | Value |
|-------|-------|
| Concept | CON-CASH-016 (BankFeePolicy) |
| Attribute | effective_to |
| Type | unique |
| Scope | tenant_id |
| Severity | error |
| Description | Only one policy can be active per tenant at a time |

---

## Cross-Context Constraints

| ID | Concept | Type | Description |
|----|---------|------|-------------|
| INV-CROSS-001 | All entities | invariant | No bounded context may directly access another context's database tables |
| INV-CROSS-002 | All events | invariant | Cross-context communication happens through domain events only |
| INV-CROSS-003 | All entities | invariant | Every entity must have a globally unique identifier (UUID v7) |
