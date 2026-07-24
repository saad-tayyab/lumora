# Event Wiring Prompt

> **Prompt ID:** PR-017  
> **Version:** 1.1.0  
> **Agent:** Code Agent  
> **Updated:** 2026-07-25

---

## Purpose

Implement domain event handlers that connect bounded contexts via Encore.ts pub/sub, wiring publishers and subscribers for every event in the Event Catalog.

---

## Prompt

```
# ROLE
You are the Staff Software Engineer for the Lumora ERP system.

# CONTEXT
You are implementing domain event handlers that connect bounded contexts.
Events are defined in knowledge/constitution/DOMAIN.md Section 7 (EVT-001 through EVT-012).
Cross-context communication happens through domain events only (INV-CROSS-002).

# INSTRUCTIONS

## 1. Read Event Catalog
1. Read knowledge/constitution/DOMAIN.md Section 7 — Event Catalog
2. For each event, identify: Event ID, Name, Source Context, Target Contexts, Payload

## 2. Implement Publishers
3. For each source context, implement the event publisher:
   a. Create events/ directory in services/backend/src/features/{context}/
   b. Create publisher.ts with an emit function for the event
   c. Define the event payload type matching the catalog
   d. Wire the publisher into the service layer (emit after state change)
   e. Use Encore.ts Topic and publish pattern

## 3. Implement Subscribers
4. For each target context, implement the event subscriber:
   a. Create events/ directory in services/backend/src/features/{context}/
   b. Create subscriber.ts with a handler function for the event
   c. Define the handler logic (what the target context does on receipt)
   d. Use Encore.ts subscribe pattern

## 4. Event Map

### EVT-001: InvoiceCreated
   - Publisher: BC-AR (services/backend/src/features/accounts-receivable/events/)
   - Subscriber: BC-FIN — Create journal entry (debit AR, credit Revenue)
   - Payload: InvoiceID, Amount, CustomerID

### EVT-002: PaymentReceived
   - Publisher: BC-AR (services/backend/src/features/accounts-receivable/events/)
   - Subscriber: BC-CASH — Update bank account balance
   - Payload: PaymentID, Amount, BankAccountID

### EVT-003: BillReceived
   - Publisher: BC-AP (services/backend/src/features/accounts-payable/events/)
   - Subscriber: BC-FIN — Create journal entry (debit Expense, credit AP)
   - Payload: BillID, Amount, VendorID

### EVT-004: StockAdjusted
   - Publisher: BC-INV (services/backend/src/features/inventory/events/)
   - Subscriber: BC-FIN — Update GL for inventory valuation change
   - Payload: ItemID, Quantity, Reason

### EVT-005: EmployeeHired
   - Publisher: BC-HR (services/backend/src/features/human-resources/events/)
   - Subscriber: BC-AUTH — Create user account with employee role
   - Payload: EmployeeID, UserID

### EVT-006: JournalEntryPosted
   - Publisher: BC-FIN (services/backend/src/features/financial/events/)
   - Subscriber: BC-REPORT — Update report aggregations and dashboards
   - Payload: EntryID, Period

### EVT-007: DepreciationPosted
   - Publisher: BC-ASSET (services/backend/src/features/asset/events/)
   - Subscriber: BC-FIN — Create journal entry (debit Depreciation Expense, credit Accumulated Depreciation)
   - Subscriber: BC-REPORT — Update asset reports
   - Payload: AssetID, PeriodID, Amount

### EVT-008: AssetDisposed
   - Publisher: BC-ASSET (services/backend/src/features/asset/events/)
   - Subscriber: BC-FIN — Create journal entry for gain/loss on disposal
   - Payload: AssetID, Proceeds, GainLoss

### EVT-009: TaxRateCreated
   - Publisher: BC-TAX (services/backend/src/features/tax/events/)
   - Subscriber: BC-FIN — Update tax configuration
   - Payload: TaxCodeID, Rate, EffectiveDate

### EVT-010: BudgetExceeded
   - Publisher: BC-BUDGET (services/backend/src/features/budget/events/)
   - Subscriber: BC-REPORT — Update budget variance reports
   - Subscriber: BC-AI — Trigger anomaly detection
   - Payload: BudgetLineID, Threshold, Actual

### EVT-011: AuditLogCreated
   - Publisher: BC-AUDIT (services/backend/src/features/audit/events/)
   - Subscriber: BC-REPORT — Update compliance reports
   - Payload: EntityType, EntityID, Action

### EVT-012: PeriodClosed
   - Publisher: BC-FIN (services/backend/src/features/financial/events/)
   - Subscriber: BC-ASSET — Trigger depreciation run for closed period
   - Subscriber: BC-BUDGET — Close budget period
   - Subscriber: BC-REPORT — Update period reports
   - Payload: PeriodID, ClosedBy

## 5. Quality
5. Run Biome check
6. Run type check

# CONSTRAINTS
- Always use Encore.ts pub/sub for event communication
- Always define event payload types matching the catalog
- Never publish events before the state change is committed
- Never handle events synchronously across context boundaries
- Always emit events after a successful database transaction
- Never expose internal event details in API responses
- Always log event publish and subscribe for observability

# OUTPUT FORMAT
- Publisher files in services/backend/src/features/{source-context}/events/
- Subscriber files in services/backend/src/features/{target-context}/events/
- Biome check results
- Type check results
```

---

## Skills

Before executing this prompt, load these agent skills:

| Skill | Purpose |
|-------|---------|
| `turborepo` | Task pipeline for building affected packages after event wiring |

---

## Usage

```bash
# Trigger via AI agent
"Wire domain events for the Accounts Receivable and Financial Management contexts"
"Implement all event handlers from the Event Catalog"
```

---

## Related

- Domain Events: `knowledge/constitution/DOMAIN.md` Section 7
- Standards: `engineering/backend/STANDARDS.md`
- Agent: `code-agent.md`
