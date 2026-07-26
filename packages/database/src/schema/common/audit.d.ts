export declare const auditFields: {
    id: import("drizzle-orm/pg-core").SetHasRuntimeDefault<import("drizzle-orm/pg-core").SetIsPrimaryKey<import("drizzle-orm/pg-core").PgUUIDBuilder>>;
    createdAt: import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgTimestampBuilder>>;
    updatedAt: import("drizzle-orm/pg-core").SetHasDefault<import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgTimestampBuilder>>;
};
export declare const softDeleteFields: {
    deletedAt: import("drizzle-orm/pg-core").PgTimestampBuilder;
};
export declare const tenantFields: {
    tenantId: import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgUUIDBuilder>;
};
export declare const createdByFields: {
    createdBy: import("drizzle-orm/pg-core").SetNotNull<import("drizzle-orm/pg-core").PgUUIDBuilder>;
};
//# sourceMappingURL=audit.d.ts.map