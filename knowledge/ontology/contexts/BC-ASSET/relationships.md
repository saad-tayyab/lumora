# BC-ASSET Relationships

## Asset & Depreciation Relationships

| ID | Source | Target | Type | Description |
|----|--------|--------|------|-------------|
| REL-ASSET-001 | CON-ASSET-001 Fixed Asset Register | CON-ASSET-002 Asset Acquisition | has-many | An asset is created through an acquisition event |
| REL-ASSET-002 | CON-ASSET-001 Fixed Asset Register | CON-ASSET-003 Depreciation Schedule | has-many | Each asset has one depreciation schedule |
| REL-ASSET-003 | CON-ASSET-001 Fixed Asset Register | CON-ASSET-005 Asset Adjustment | has-many | Assets can have multiple adjustments |
| REL-ASSET-004 | CON-ASSET-001 Fixed Asset Register | CON-ASSET-007 Asset Category | belongs-to | Assets belong to exactly one category |
| REL-ASSET-005 | CON-ASSET-001 Fixed Asset Register | CON-ASSET-008 Capex Allocation | has-many | An asset can have multiple capex allocations |
| REL-ASSET-006 | CON-ASSET-003 Depreciation Schedule | CON-ASSET-004 Depreciation Entry | has-many | A schedule produces multiple depreciation entries |
| REL-ASSET-007 | CON-ASSET-004 Depreciation Entry | CON-FIN-011 Journal Entry | uses | Each depreciation entry posts to a journal entry |
| REL-ASSET-008 | CON-ASSET-006 Asset Disposal | CON-ASSET-001 Fixed Asset Register | triggers | Disposal removes asset from active register |
| REL-ASSET-009 | CON-ASSET-006 Asset Disposal | CON-ASSET-004 Depreciation Entry | triggers | Disposal requires depreciation update first |
| REL-ASSET-010 | CON-ASSET-007 Asset Category | CON-FIN-001 Account | uses | Category links to a GL account |
| REL-ASSET-011 | CON-ASSET-004 Depreciation Entry | CON-FIN-055 Accounting Period | uses | Depreciation entry must reference an open period |
| REL-ASSET-012 | CON-ASSET-008 Capex Allocation | CON-FIN-001 Account | uses | Capex allocation references a GL account |
