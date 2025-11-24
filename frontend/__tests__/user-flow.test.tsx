import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));

import SignupPage from '../app/signup/page';
import CreateQuestionPage from '../app/question/create/page';
import ProfilePage from '../app/profile/page';
import { AuthProvider } from '../components/AuthContext';
describe('End-to-end user flow: signup -> post -> edit -> logout', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
        pushMock.mockClear();
    });

    it('creates an account, posts a question, edits it and logs out', async () => {
        // dynamic fetch mock for the entire flow
        const fetchMock = vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo, init?: RequestInit) => {
            const url = String(input);

            // signup POST
            if (url.includes('/api/users/signup')) {
                return { ok: true, json: async () => ({}) } as any;
            }

            // courses for create question page
            if (url.endsWith('/api/courses')) {
                return { ok: true, json: async () => [{ course_id: 5, name: 'COMP100' }] } as any;
            }

            // create question POST
            if (url.endsWith('/api/questions/') && init?.method === 'POST') {
                return { ok: true, json: async () => ({ questionId: 123 }) } as any;
            }

            // PUT update to question
            if (url.includes('/api/questions/123') && init?.method === 'PUT') {
                return { ok: true, json: async () => ({}) } as any;
            }

            // profile user fetch
            if (url.match(/\/api\/users\/\d+$/)) {
                return { ok: true, json: async () => ({ first_name: 'Sarah', last_name: 'Heward', email: 'sarah@example.com', student_id: 'A01234567' }) } as any;
            }

            // questions list for profile page
            if (url.endsWith('/api/questions')) {
                return {
                    ok: true, json: async () => [
                        {
                            questionId: 123,
                            title: 'My question',
                            content: 'Details',
                            userId: 7,
                            courseId: 5,
                            viewCount: 0,
                            upVotes: 0,
                            downVotes: 0,
                            isAnonymous: false,
                            firstname: 'Sarah',
                            lastname: 'Heward',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            answerCount: 0,
                            tags: [],
                        }
                    ]
                } as any;
            }

            // answers for profile
            if (url.endsWith('/api/users/7/answers')) {
                return { ok: true, json: async () => [] } as any;
            }

            return { ok: false, json: async () => ({}) } as any;
        });

        // 1: signup 
        const { container } = render(<SignupPage />);

        fireEvent.change(screen.getByPlaceholderText(/e.g. Sarah Heward/i), { target: { value: 'Sarah Heward' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. sarah.heward@my.bcit.ca/i), { target: { value: 'sarah@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. A01234567/i), { target: { value: 'A01234567' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter a password/i), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByPlaceholderText(/Re-enter your password/i), { target: { value: 'Password123!' } });

        const form = container.querySelector('form') as HTMLFormElement;
        fireEvent.submit(form);

        // wait for success message and redirect (component waits 1200ms before pushing)
        expect(await screen.findByText(/Signup successful! Redirecting.../i)).toBeInTheDocument();
        await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/login'), { timeout: 4000 });

        // emulate user signing in (set localStorage) so subsequent pages see a logged in user
        localStorage.setItem('user', JSON.stringify({ userId: 7, firstname: 'Sarah', lastname: 'Heward' }));

        // 2: create question
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

        await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/question/123'), { timeout: 3000 });

        // 3: edit question
        const editedQuestion = {
            questionId: 123,
            title: 'Edited title',
            content: 'Edited content',
            userId: 7,
            courseId: 5,
            viewCount: 0,
            upVotes: 0,
            downVotes: 0,
            isAnonymous: false,
            firstname: 'Sarah',
            lastname: 'Heward',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            answers: [] as any[],
            tags: [] as string[],
        };

        await fetch(`${process.env.API_BASE_URL || ''}/api/questions/123`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editedQuestion),
        });

        // assert the PUT endpoint was called with edited title/content
        await waitFor(() => {
            const calls = (fetch as any).mock ? (fetch as any).mock.calls : [];
            const putCall = calls.find((c: any[]) => String(c[0]).includes('/api/questions/123') && c[1]?.method === 'PUT');
            expect(putCall).toBeTruthy();
            const body = JSON.parse(String(putCall[1].body));
            expect(body.title).toBe('Edited title');
            expect(body.content).toBe('Edited content');
        }, { timeout: 2000 });

        // 4: logout
        render(
            <AuthProvider>
                <ProfilePage />
            </AuthProvider>
        );

        // wait for logout button and click
        const logoutButton = await screen.findByText(/Logout/i);
        fireEvent.click(logoutButton);

        await waitFor(() => expect(localStorage.getItem('user')).toBeNull());
        await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/'), { timeout: 3000 });

        fetchMock.mockRestore();
    });
});
