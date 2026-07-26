import { type APIRequestContext } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:4000';

export class TestDataManager {
  constructor(private request: APIRequestContext) {}

  async createCustomer(data: { name: string; email?: string; phone?: string }) {
    const res = await this.request.post(`${API_URL}/ar/customers`, {
      data: { paymentTerms: 'Net 30', isActive: true, ...data },
    });
    return res.json();
  }

  async createVendor(data: { name: string; code: string; email?: string }) {
    const res = await this.request.post(`${API_URL}/ap/vendors`, {
      data: { isActive: true, ...data },
    });
    return res.json();
  }

  async createItem(data: { sku: string; name: string; categoryId: string; unitOfMeasureId: string }) {
    const res = await this.request.post(`${API_URL}/inv/items`, {
      data: { isActive: true, ...data },
    });
    return res.json();
  }

  async createAccount(data: { code: string; name: string; type: string }) {
    const res = await this.request.post(`${API_URL}/accounts`, {
      data: { isActive: true, ...data },
    });
    return res.json();
  }

  async createEmployee(data: { firstName: string; lastName: string; email: string; departmentId: string; designationId: string; joiningDate: string; employmentType: string }) {
    const res = await this.request.post(`${API_URL}/hr/employees`, {
      data,
    });
    return res.json();
  }

  async cleanup(path: string, id: string) {
    try {
      await this.request.delete(`${API_URL}${path}/${id}`);
    } catch {
      // Ignore cleanup errors
    }
  }
}
