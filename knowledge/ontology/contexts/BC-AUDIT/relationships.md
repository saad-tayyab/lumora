# BC-AUDIT Relationships

## Audit Trail Relationships

| ID | Source | Target | Type | Description |
|----|--------|--------|------|-------------|
| REL-AUDIT-001 | CON-AUDIT-001 Audit Log | CON-AUDIT-002 Audit Log Entry | has-many | The audit log owns all entries within the tenant |
| REL-AUDIT-002 | CON-AUDIT-002 Audit Log Entry | CON-AUDIT-003 Entity Change Snapshot | has-one | Each entry contains a structured change snapshot |
| REL-AUDIT-003 | CON-AUDIT-002 Audit Log Entry | CON-AUTH-001 User | uses | Entry references the user who performed the action |
| REL-AUDIT-004 | CON-AUDIT-001 Audit Log | CON-AUTH-001 User | uses | Log tracks actions performed by users |

## Cross-Context Relationships

| ID | Source | Target | Type | Description |
|----|--------|--------|------|-------------|
| REL-AUDIT-CROSS-001 | CON-AUDIT-002 Audit Log Entry | Any bounded context entity | references | Entry references any entity type and entity ID in the system via entityType/entityId |
| REL-AUDIT-CROSS-002 | EVT-011 AuditLogCreated | BC-REPORT | notifies | Audit log creation events feed into reporting and compliance dashboards |
