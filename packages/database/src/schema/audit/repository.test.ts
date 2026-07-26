import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as repo from './repository';

vi.mock('../../index', () => {
  const chainable = () => {
    const obj: Record<string, any> = {};
    obj.where = vi.fn().mockReturnValue(obj);
    obj.set = vi.fn().mockReturnValue(obj);
    obj.values = vi.fn().mockReturnValue(obj);
    obj.returning = vi.fn().mockResolvedValue([]);
    obj.limit = vi.fn().mockReturnValue(obj);
    obj.offset = vi.fn().mockReturnValue(obj);
    obj.orderBy = vi.fn().mockReturnValue(obj);
    obj.leftJoin = vi.fn().mockReturnValue(obj);
    return obj;
  };

  const selectChain = () => ({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([{ count: 0 }]),
    }),
  });

  return {
    db: {
      insert: vi.fn().mockReturnValue(chainable()),
      select: vi.fn().mockReturnValue(selectChain()),
      query: {
        auditLogEntries: {
          findFirst: vi.fn().mockResolvedValue(undefined),
          findMany: vi.fn().mockResolvedValue([]),
        },
      },
      update: vi.fn().mockReturnValue(chainable()),
      delete: vi.fn().mockReturnValue(chainable()),
    },
  };
});

const getDb = async () => (await import('../../index')).db;

describe('audit repository', () => {
  beforeEach(() => vi.clearAllMocks());

  // ─── Audit Log Entries ────────────────────────────────────────────────────

  describe('auditLogEntriesRepository', () => {
    it('findById queries correctly', async () => {
      const db = await getDb();
      (db.query.auditLogEntries.findFirst as any).mockResolvedValue({
        id: 'ale-1',
        action: 'create',
        resource: 'invoice',
        resourceId: 'inv-1',
        tenantId: 't-1',
      });
      const result = await repo.auditLogEntriesRepository.findById('ale-1');
      expect(result).toEqual({
        id: 'ale-1',
        action: 'create',
        resource: 'invoice',
        resourceId: 'inv-1',
        tenantId: 't-1',
      });
      expect(db.query.auditLogEntries.findFirst).toHaveBeenCalled();
    });

    it('findById returns undefined when not found', async () => {
      const db = await getDb();
      (db.query.auditLogEntries.findFirst as any).mockResolvedValue(undefined);
      const result = await repo.auditLogEntriesRepository.findById('nonexistent');
      expect(result).toBeUndefined();
    });

    it('create inserts and returns', async () => {
      const db = await getDb();
      const mockReturning = vi.fn().mockResolvedValue([{
        id: 'ale-1',
        action: 'create',
        resource: 'invoice',
        tenantId: 't-1',
      }]);
      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({ returning: mockReturning }),
      });
      const result = await repo.auditLogEntriesRepository.create({
        tenantId: 't-1',
        action: 'create',
        resource: 'invoice',
        resourceId: 'inv-1',
      } as any);
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual([{
        id: 'ale-1',
        action: 'create',
        resource: 'invoice',
        tenantId: 't-1',
      }]);
    });

    it('findByResourceAndId returns paginated entries for resource', async () => {
      const db = await getDb();
      (db.query.auditLogEntries.findMany as any).mockResolvedValue([{
        id: 'ale-1',
        resource: 'invoice',
        resourceId: 'inv-1',
        tenantId: 't-1',
      }]);
      const result = await repo.auditLogEntriesRepository.findByResourceAndId(
        'invoice',
        'inv-1',
        't-1',
      );
      expect(result.data).toEqual([{
        id: 'ale-1',
        resource: 'invoice',
        resourceId: 'inv-1',
        tenantId: 't-1',
      }]);
      expect(result.total).toBe(0);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('findByUserId returns paginated entries for user', async () => {
      const db = await getDb();
      (db.query.auditLogEntries.findMany as any).mockResolvedValue([{
        id: 'ale-1',
        userId: 'u-1',
        tenantId: 't-1',
      }]);
      const result = await repo.auditLogEntriesRepository.findByUserId('u-1', 't-1', {
        limit: 10,
        offset: 5,
      });
      expect(result.data).toEqual([{
        id: 'ale-1',
        userId: 'u-1',
        tenantId: 't-1',
      }]);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(5);
    });

    it('findByUserId uses default pagination', async () => {
      const db = await getDb();
      (db.query.auditLogEntries.findMany as any).mockResolvedValue([]);
      const result = await repo.auditLogEntriesRepository.findByUserId('u-1', 't-1');
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('findByDateRange returns entries within date range', async () => {
      const db = await getDb();
      (db.query.auditLogEntries.findMany as any).mockResolvedValue([{
        id: 'ale-1',
        tenantId: 't-1',
        createdAt: new Date('2024-01-15'),
      }]);
      const result = await repo.auditLogEntriesRepository.findByDateRange(
        't-1',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        { limit: 25 },
      );
      expect(result.data).toEqual([{
        id: 'ale-1',
        tenantId: 't-1',
        createdAt: new Date('2024-01-15'),
      }]);
      expect(result.limit).toBe(25);
    });

    it('findByDateRange uses default pagination', async () => {
      const db = await getDb();
      (db.query.auditLogEntries.findMany as any).mockResolvedValue([]);
      const result = await repo.auditLogEntriesRepository.findByDateRange(
        't-1',
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('findByAction returns entries for action', async () => {
      const db = await getDb();
      (db.query.auditLogEntries.findMany as any).mockResolvedValue([{
        id: 'ale-1',
        action: 'update',
        tenantId: 't-1',
      }]);
      const result = await repo.auditLogEntriesRepository.findByAction('update', 't-1', {
        limit: 5,
      });
      expect(result.data).toEqual([{
        id: 'ale-1',
        action: 'update',
        tenantId: 't-1',
      }]);
      expect(result.limit).toBe(5);
    });

    it('findByAction uses default pagination', async () => {
      const db = await getDb();
      (db.query.auditLogEntries.findMany as any).mockResolvedValue([]);
      const result = await repo.auditLogEntriesRepository.findByAction('delete', 't-1');
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('findMany returns paginated entries for tenant', async () => {
      const db = await getDb();
      (db.query.auditLogEntries.findMany as any).mockResolvedValue([{ id: 'ale-1', tenantId: 't-1' }]);
      const result = await repo.auditLogEntriesRepository.findMany('t-1', {
        limit: 20,
        offset: 10,
      });
      expect(result.data).toEqual([{ id: 'ale-1', tenantId: 't-1' }]);
      expect(result.total).toBe(0);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(10);
    });

    it('findMany uses default pagination', async () => {
      const db = await getDb();
      (db.query.auditLogEntries.findMany as any).mockResolvedValue([]);
      const result = await repo.auditLogEntriesRepository.findMany('t-1');
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });
  });
});
