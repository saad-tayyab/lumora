import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, describe } from 'vitest';
import CategoryForm from './CategoryForm.svelte';

describe('CategoryForm', () => {
	test('renders name field', () => {
		render(CategoryForm);
		const name = screen.getByLabelText('Name *');
		expect(name).toBeInTheDocument();
		expect(name).toBeRequired();
	});

	test('renders code field', () => {
		render(CategoryForm);
		const code = screen.getByLabelText('Code *');
		expect(code).toBeInTheDocument();
		expect(code).toBeRequired();
	});

	test('renders description textarea', () => {
		render(CategoryForm);
		expect(screen.getByLabelText('Description')).toBeInTheDocument();
	});

	test('renders active checkbox', () => {
		render(CategoryForm);
		expect(screen.getByLabelText('Active')).toBeInTheDocument();
	});

	test('form has POST method', () => {
		const { container } = render(CategoryForm);
		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
	});

	test('submit button shows Create Category for new category', () => {
		render(CategoryForm);
		expect(screen.getByRole('button', { name: 'Create Category' })).toBeInTheDocument();
	});

	test('submit button shows Update Category in edit mode', () => {
		render(CategoryForm, {
			props: { category: { name: 'Raw Materials', code: 'RAW', description: null, isActive: true } },
		});
		expect(screen.getByRole('button', { name: 'Update Category' })).toBeInTheDocument();
	});

	test('cancel link points to categories list', () => {
		render(CategoryForm);
		expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/inv/categories');
	});

	test('prefills fields from category prop', () => {
		render(CategoryForm, {
			props: { category: { name: 'Finished Goods', code: 'FG', description: 'Completed products', isActive: true } },
		});
		expect(screen.getByLabelText('Name *')).toHaveValue('Finished Goods');
		expect(screen.getByLabelText('Code *')).toHaveValue('FG');
	});

	test('displays error messages', () => {
		render(CategoryForm, {
			props: { errors: { name: ['Name is required'], code: ['Code is required'] } },
		});
		expect(screen.getByText('Name is required')).toBeInTheDocument();
		expect(screen.getByText('Code is required')).toBeInTheDocument();
	});
});
