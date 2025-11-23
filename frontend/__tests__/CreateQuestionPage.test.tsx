import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));

import CreateQuestionPage from '../app/question/create/page';
import { AuthProvider } from '../components/AuthContext';

describe('CreateQuestionPage', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
        pushMock.mockClear();
    });

    it('submits a new question and redirects on success', async () => {
        // set logged in user
        localStorage.setItem('user', JSON.stringify({ userId: 7 }));

        const courses = [{ course_id: 5, name: 'COMP100' }];

        const fetchMock = vi.spyOn(global, 'fetch').mockImplementation((input: RequestInfo, init?: RequestInit) => {
            const url = String(input);
            if (url.endsWith('/api/courses')) {
                return Promise.resolve({ ok: true, json: async () => courses } as any);
            }
            if (url.endsWith('/api/questions/')) {
                // assert payload contains expected fields
                const body = init?.body ? JSON.parse(String(init.body)) : {};
                expect(body.title).toBe('My question');
                expect(body.content).toBe('Details');
                expect(body.userId).toBe(7);
                expect(body.courseId).toBe(5);
                return Promise.resolve({ ok: true, json: async () => ({ questionId: 123 }) } as any);
            }
            return Promise.resolve({ ok: false, json: async () => ({}) } as any);
        });

        render(
            <AuthProvider>
                <CreateQuestionPage />
            </AuthProvider>
        );

        // wait for course option
        expect(await screen.findByRole('option', { name: 'COMP100' })).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/Enter your question title/i), { target: { value: 'My question' } });
        fireEvent.change(screen.getByPlaceholderText(/Describe your question in detail/i), { target: { value: 'Details' } });
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '5' } });

        fireEvent.click(screen.getByRole('button', { name: /Post Question/i }));

        await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/question/123'));

        fetchMock.mockRestore();
    });

    it('alerts when no course is selected', async () => {
        const courses: any[] = [];
        const fetchMock = vi.spyOn(global, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = String(input);
            if (url.endsWith('/api/courses')) return Promise.resolve({ ok: true, json: async () => courses } as any);
            return Promise.resolve({ ok: false, json: async () => ({}) } as any);
        });

        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

        const { container } = render(
            <AuthProvider>
                <CreateQuestionPage />
            </AuthProvider>
        );

        // wait for the form to finish loading (courses fetch)
        await screen.findByRole('combobox');

        fireEvent.change(screen.getByPlaceholderText(/Enter your question title/i), { target: { value: 'My question' } });
        fireEvent.change(screen.getByPlaceholderText(/Describe your question in detail/i), { target: { value: 'Details' } });

        // submit the form directly to ensure onSubmit runs
        const form = container.querySelector('form') as HTMLFormElement;
        fireEvent.submit(form);

        await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Please select a course.'));

        fetchMock.mockRestore();
        alertSpy.mockRestore();
    });

    it('alerts when user is not signed in', async () => {
        const courses = [{ course_id: 5, name: 'COMP100' }];
        const fetchMock = vi.spyOn(global, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = String(input);
            if (url.endsWith('/api/courses')) return Promise.resolve({ ok: true, json: async () => courses } as any);
            return Promise.resolve({ ok: false, json: async () => ({}) } as any);
        });

        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

        render(
            <AuthProvider>
                <CreateQuestionPage />
            </AuthProvider>
        );

        // wait for course options to appear
        expect(await screen.findByRole('option', { name: 'COMP100' })).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/Enter your question title/i), { target: { value: 'My question' } });
        fireEvent.change(screen.getByPlaceholderText(/Describe your question in detail/i), { target: { value: 'Details' } });
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '5' } });

        fireEvent.click(screen.getByRole('button', { name: /Post Question/i }));

        await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('You must be signed in to post a question.'));

        fetchMock.mockRestore();
        alertSpy.mockRestore();
    });

    it('alerts server error message when POST fails', async () => {
        localStorage.setItem('user', JSON.stringify({ userId: 9 }));
        const courses = [{ course_id: 5, name: 'COMP100' }];

        const fetchMock = vi.spyOn(global, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = String(input);
            if (url.endsWith('/api/courses')) return Promise.resolve({ ok: true, json: async () => courses } as any);
            if (url.endsWith('/api/questions/')) return Promise.resolve({ ok: false, json: async () => ({ message: 'Oh no' }) } as any);
            return Promise.resolve({ ok: false, json: async () => ({}) } as any);
        });

        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

        render(
            <AuthProvider>
                <CreateQuestionPage />
            </AuthProvider>
        );

        expect(await screen.findByRole('option', { name: 'COMP100' })).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/Enter your question title/i), { target: { value: 'My question' } });
        fireEvent.change(screen.getByPlaceholderText(/Describe your question in detail/i), { target: { value: 'Details' } });
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '5' } });

        fireEvent.click(screen.getByRole('button', { name: /Post Question/i }));

        await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Oh no'));

        fetchMock.mockRestore();
        alertSpy.mockRestore();
    });

    it('alerts on network error during submit', async () => {
        localStorage.setItem('user', JSON.stringify({ userId: 9 }));
        const courses = [{ course_id: 5, name: 'COMP100' }];

        const fetchMock = vi.spyOn(global, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = String(input);
            if (url.endsWith('/api/courses')) return Promise.resolve({ ok: true, json: async () => courses } as any);
            if (url.endsWith('/api/questions/')) throw new Error('network down');
            return Promise.resolve({ ok: false, json: async () => ({}) } as any);
        });

        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

        render(
            <AuthProvider>
                <CreateQuestionPage />
            </AuthProvider>
        );

        expect(await screen.findByRole('option', { name: 'COMP100' })).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/Enter your question title/i), { target: { value: 'My question' } });
        fireEvent.change(screen.getByPlaceholderText(/Describe your question in detail/i), { target: { value: 'Details' } });
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '5' } });

        fireEvent.click(screen.getByRole('button', { name: /Post Question/i }));

        await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Network error. Please try again.'));

        fetchMock.mockRestore();
        alertSpy.mockRestore();
    });
});
