import { z } from 'zod';

// ====== AR (Accounts Receivable) ======

export const customerSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email').optional().or(z.literal('')),
	phone: z.string().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	country: z.string().optional(),
	taxId: z.string().optional(),
	creditLimit: z.number().min(0).optional(),
	paymentTerms: z.string().optional(),
	notes: z.string().optional(),
});

export const invoiceLineItemSchema = z.object({
	description: z.string().min(1, 'Description is required'),
	quantity: z.number().positive('Quantity must be positive'),
	unitPrice: z.number().min(0, 'Unit price must be non-negative'),
	taxRate: z.number().min(0).max(100).optional(),
});

export const invoiceSchema = z.object({
	customerId: z.string().min(1, 'Customer is required'),
	issueDate: z.string().min(1, 'Issue date is required'),
	dueDate: z.string().min(1, 'Due date is required'),
	notes: z.string().optional(),
	lineItems: z.array(invoiceLineItemSchema).min(1, 'At least one line item required'),
});

export const paymentSchema = z.object({
	customerId: z.string().min(1, 'Customer is required'),
	amount: z.number().positive('Amount must be positive'),
	paymentDate: z.string().min(1, 'Payment date is required'),
	paymentMethod: z.string().min(1, 'Payment method is required'),
	reference: z.string().optional(),
	notes: z.string().optional(),
});

export const creditNoteSchema = z.object({
	customerId: z.string().min(1, 'Customer is required'),
	invoiceId: z.string().optional(),
	amount: z.number().positive('Amount must be positive'),
	reason: z.string().min(1, 'Reason is required'),
	notes: z.string().optional(),
});

// ====== AP (Accounts Payable) ======

export const vendorSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email').optional().or(z.literal('')),
	phone: z.string().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	country: z.string().optional(),
	taxId: z.string().optional(),
	paymentTerms: z.string().optional(),
	notes: z.string().optional(),
});

export const billLineItemSchema = z.object({
	description: z.string().min(1, 'Description is required'),
	quantity: z.number().positive('Quantity must be positive'),
	unitPrice: z.number().min(0, 'Unit price must be non-negative'),
	accountCode: z.string().optional(),
	taxRate: z.number().min(0).max(100).optional(),
});

export const billSchema = z.object({
	vendorId: z.string().min(1, 'Vendor is required'),
	billDate: z.string().min(1, 'Bill date is required'),
	dueDate: z.string().min(1, 'Due date is required'),
	reference: z.string().optional(),
	notes: z.string().optional(),
	lineItems: z.array(billLineItemSchema).min(1, 'At least one line item required'),
});

export const vendorPaymentSchema = z.object({
	vendorId: z.string().min(1, 'Vendor is required'),
	amount: z.number().positive('Amount must be positive'),
	paymentDate: z.string().min(1, 'Payment date is required'),
	paymentMethod: z.string().min(1, 'Payment method is required'),
	bankAccountId: z.string().optional(),
	reference: z.string().optional(),
	notes: z.string().optional(),
});

// ====== Cash & Treasury ======

export const bankAccountSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	accountNumber: z.string().min(1, 'Account number is required'),
	bankName: z.string().min(1, 'Bank name is required'),
	accountType: z.string().optional(),
	currency: z.string().default('USD'),
	openingBalance: z.number().optional(),
	notes: z.string().optional(),
});

export const transferSchema = z.object({
	fromAccountId: z.string().min(1, 'Source account is required'),
	toAccountId: z.string().min(1, 'Destination account is required'),
	amount: z.number().positive('Amount must be positive'),
	transferDate: z.string().min(1, 'Transfer date is required'),
	reference: z.string().optional(),
	notes: z.string().optional(),
});

// ====== Inventory ======

export const itemSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	sku: z.string().min(1, 'SKU is required'),
	description: z.string().optional(),
	categoryId: z.string().optional(),
	unitOfMeasure: z.string().default('ea'),
	costPrice: z.number().min(0).optional(),
	salePrice: z.number().min(0).optional(),
	reorderPoint: z.number().min(0).optional(),
	isActive: z.boolean().default(true),
});

export const warehouseSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	code: z.string().min(1, 'Code is required'),
	address: z.string().optional(),
	city: z.string().optional(),
	country: z.string().optional(),
	isActive: z.boolean().default(true),
});

export const categorySchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
});

// ====== Financial ======

export const accountSchema = z.object({
	code: z.string().min(1, 'Code is required'),
	name: z.string().min(1, 'Name is required'),
	type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
	parentId: z.string().optional(),
	description: z.string().optional(),
	isActive: z.boolean().default(true),
});

export const journalEntryLineSchema = z.object({
	accountId: z.string().min(1, 'Account is required'),
	debit: z.number().min(0).optional(),
	credit: z.number().min(0).optional(),
	description: z.string().optional(),
});

export const journalEntrySchema = z.object({
	entryDate: z.string().min(1, 'Entry date is required'),
	description: z.string().min(1, 'Description is required'),
	lines: z.array(journalEntryLineSchema).min(2, 'At least two lines required'),
});

// ====== HR ======

export const employeeSchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	email: z.string().email('Invalid email'),
	phone: z.string().optional(),
	departmentId: z.string().optional(),
	designationId: z.string().optional(),
	employmentType: z.enum(['full_time', 'part_time', 'contract', 'intern']).default('full_time'),
	dateOfJoining: z.string().min(1, 'Date of joining is required'),
	salary: z.number().min(0).optional(),
	address: z.string().optional(),
});

export const departmentSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	managerId: z.string().optional(),
});

export const designationSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	level: z.string().optional(),
	description: z.string().optional(),
});

// ====== Settings ======

export const userSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email'),
	username: z.string().min(3, 'Username must be at least 3 characters').optional(),
});

export const roleSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	permissions: z.array(z.string()).optional(),
});

// ====== Tax ======

export const taxCodeSchema = z.object({
	code: z.string().min(1, 'Code is required'),
	name: z.string().min(1, 'Name is required'),
	type: z.enum(['output_tax', 'input_tax', 'exempt', 'zero_rated']),
	rate: z.number().min(0).max(100),
	glAccountId: z.string().optional(),
	postingRule: z.enum(['output_liability', 'input_asset']).default('output_liability'),
	isClaimable: z.boolean().default(false),
	isActive: z.boolean().default(true),
	description: z.string().optional(),
});

export const taxRateSchema = z.object({
	taxCodeId: z.string().min(1, 'Tax code is required'),
	rate: z.number().min(0).max(100),
	effectiveDate: z.string().min(1, 'Effective date is required'),
	expiryDate: z.string().optional(),
});

// ====== Tax Auto-Assignment Rules ======

export const autoAssignmentRuleSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	priority: z.number().int().min(0).default(0),
	taxCodeId: z.string().min(1, 'Tax code is required'),
	entityType: z.string().min(1, 'Entity type is required'),
	regionCode: z.string().optional(),
});

// ====== Asset Categories ======

export const assetCategorySchema = z.object({
	name: z.string().min(1, 'Name is required'),
	code: z.string().min(1, 'Code is required').max(20),
	description: z.string().optional(),
	defaultDepreciationMethod: z.enum(['straight_line', 'declining_balance', 'sum_of_years_digits', 'units_of_activity']).default('straight_line'),
	defaultUsefulLifeMonths: z.number().int().min(1).default(60),
	defaultSalvageValuePercent: z.number().min(0).max(100).default(0),
	isDepreciable: z.boolean().default(true),
});

// ====== Budget ======

export const budgetHeaderSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	period: z.string().min(1, 'Period is required'),
	totalAmount: z.number().min(0, 'Total must be non-negative'),
	startDate: z.string().min(1, 'Start date is required'),
	endDate: z.string().min(1, 'End date is required'),
	notes: z.string().optional(),
});

// ====== Assets ======

export const fixedAssetSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	code: z.string().min(1, 'Code is required'),
	categoryId: z.string().min(1, 'Category is required'),
	purchaseDate: z.string().min(1, 'Purchase date is required'),
	purchasePrice: z.number().positive('Purchase price must be positive'),
	salvageValue: z.number().min(0).default(0),
	usefulLife: z.number().positive('Useful life must be positive'),
	depreciationMethod: z.enum(['straight_line', 'declining_balance', 'units_of_production']).default('straight_line'),
	location: z.string().optional(),
	serialNumber: z.string().optional(),
	notes: z.string().optional(),
});
