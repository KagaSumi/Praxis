import React from 'react';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Expose a push mock so tests can assert navigation
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: pushMock }),
}));

import ProfilePage from '../app/profile/page';
import { AuthProvider } from '../components/AuthContext';

describe('ProfilePage', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        localStorage.clear();
    });

    test('renders user, questions and answers when logged in', async () => {
        const storedUser = { userId: 2 };
        localStorage.setItem('user', JSON.stringify(storedUser));

        // fake fetch responses
        const user = {
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'jane@example.com',
            score: 42,
            student_id: 'A0123456',
        };

        const questions = [
            { questionId: 11, title: 'Q by me', content: 'content', userId: 2, upVotes: 3, viewCount: 10, answerCount: 1, createdAt: new Date().toISOString(), tags: ['tag1'] },
            { questionId: 12, title: 'Other Q', content: 'other', userId: 99, upVotes: 0, viewCount: 0, answerCount: 0, createdAt: new Date().toISOString(), tags: [] },
        ];

        const answers = [
            { answerId: 21, questionId: 11, questionTitle: 'Q by me', content: 'an answer', isAnonymous: false, createdAt: new Date().toISOString(), upVotes: 2 },
        ];

        const fetchMock = vi.spyOn(global, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = String(input);
            if (url.endsWith('/api/users/2')) {
                return Promise.resolve({ ok: true, json: async () => user } as any);
            }
            if (url.endsWith('/api/questions')) {
                return Promise.resolve({ ok: true, json: async () => questions } as any);
            }
            if (url.endsWith('/api/users/2/answers')) {
                return Promise.resolve({ ok: true, json: async () => answers } as any);
            }
            return Promise.resolve({ ok: false, json: async () => ({}) } as any);
        });

        render(
            <AuthProvider>
                <ProfilePage />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.queryByText(/Loading posts.../i)).not.toBeInTheDocument());

        // check profile header
        expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();

        // q&a + rep should show
        expect(screen.getByText(/Questions 1/)).toBeInTheDocument();
        expect(screen.getByText(/Answers 1/)).toBeInTheDocument();
        expect(screen.getByText(/Reputation 42/)).toBeInTheDocument();

        // question title should show in recent posts
        expect(screen.getAllByText('Q by me').length).toBeGreaterThan(0);

        // answer content should appear in recent answers
        expect(screen.getAllByText('an answer').length).toBeGreaterThan(0);

        fetchMock.mockRestore();
    });

    test('navigates to edit page when Edit Details is clicked', async () => {
        const storedUser = { userId: 2 };
        localStorage.setItem('user', JSON.stringify(storedUser));

        // mock fetch
        const user = { first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com', score: 42, student_id: 'A0123456' };
        const fetchMock = vi.spyOn(global, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = String(input);
            if (url.endsWith('/api/users/2')) return Promise.resolve({ ok: true, json: async () => user } as any);
            if (url.endsWith('/api/questions')) return Promise.resolve({ ok: true, json: async () => [] } as any);
            if (url.endsWith('/api/users/2/answers')) return Promise.resolve({ ok: true, json: async () => [] } as any);
            return Promise.resolve({ ok: false, json: async () => ({}) } as any);
        });

        render(
            <AuthProvider>
                <ProfilePage />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.queryByText(/Loading posts.../i)).not.toBeInTheDocument());

        const editButton = screen.getByText('Edit Details');
        fireEvent.click(editButton);

        expect(pushMock).toHaveBeenCalledWith('/profile/edit');

        fetchMock.mockRestore();
    });

    test('test logout button removing user and redirecting to home', async () => {
        const storedUser = { userId: 2 };
        localStorage.setItem('user', JSON.stringify(storedUser));

        const user = { first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com', score: 42, student_id: 'A0123456' };
        const fetchMock = vi.spyOn(global, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = String(input);
            if (url.endsWith('/api/users/2')) return Promise.resolve({ ok: true, json: async () => user } as any);
            if (url.endsWith('/api/questions')) return Promise.resolve({ ok: true, json: async () => [] } as any);
            if (url.endsWith('/api/users/2/answers')) return Promise.resolve({ ok: true, json: async () => [] } as any);
            return Promise.resolve({ ok: false, json: async () => ({}) } as any);
        });

        render(
            <AuthProvider>
                <ProfilePage />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.queryByText(/Loading posts.../i)).not.toBeInTheDocument());

        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        // localStorage should no longer contain the user
        expect(localStorage.getItem('user')).toBeNull();

        // router should have been asked to navigate home
        expect(pushMock).toHaveBeenCalledWith('/');

        fetchMock.mockRestore();
    });

    test('question title and Answer button link to question page', async () => {
        const storedUser = { userId: 2 };
        localStorage.setItem('user', JSON.stringify(storedUser));

        const user = {
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'jane@example.com',
            score: 42,
            student_id: 'A0123456',
        };

        const questions = [
            { questionId: 11, title: 'Q by me', content: 'content', userId: 2, upVotes: 3, viewCount: 10, answerCount: 1, createdAt: new Date().toISOString(), tags: ['tag1'] },
        ];

        const answers = [
            { answerId: 21, questionId: 11, questionTitle: 'Q by me', content: 'an answer', isAnonymous: false, createdAt: new Date().toISOString(), upVotes: 2 },
        ];

        const fetchMock = vi.spyOn(global, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = String(input);
            if (url.endsWith('/api/users/2')) {
                return Promise.resolve({ ok: true, json: async () => user } as any);
            }
            if (url.endsWith('/api/questions')) {
                return Promise.resolve({ ok: true, json: async () => questions } as any);
            }
            if (url.endsWith('/api/users/2/answers')) {
                return Promise.resolve({ ok: true, json: async () => answers } as any);
            }
            return Promise.resolve({ ok: false, json: async () => ({}) } as any);
        });

        render(
            <AuthProvider>
                <ProfilePage />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.queryByText(/Loading posts.../i)).not.toBeInTheDocument());

        // there should be at least one question title link that points to the question
        const titleLinks = screen.getAllByRole('link', { name: /Q by me/i });
        expect(titleLinks.length).toBeGreaterThan(0);
        const hasTitleLinkToQuestion = titleLinks.some((l) => l.getAttribute('href') === '/question/11');
        expect(hasTitleLinkToQuestion).toBeTruthy();

        // there should be at least one answer link that points to the same question
        const answerLinks = screen.getAllByRole('link', { name: /Answer/i });
        expect(answerLinks.length).toBeGreaterThan(0);
        const hasAnswerLinkToQuestion = answerLinks.some((a) => a.getAttribute('href') === '/question/11');
        expect(hasAnswerLinkToQuestion).toBeTruthy();

        fetchMock.mockRestore();
    });

    test('both title and answer link for question appear and point to same route', async () => {
        const storedUser = { userId: 2 };
        localStorage.setItem('user', JSON.stringify(storedUser));

        const user = { first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com', score: 42, student_id: 'A0123456' };
        const questions = [ { questionId: 11, title: 'Q by me', content: 'content', userId: 2, upVotes: 3, viewCount: 10, answerCount: 1, createdAt: new Date().toISOString(), tags: [] } ];
        const answers = [ { answerId: 21, questionId: 11, questionTitle: 'Q by me', content: 'an answer', isAnonymous: false, createdAt: new Date().toISOString(), upVotes: 2 } ];

        const fetchMock = vi.spyOn(global, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = String(input);
            if (url.endsWith('/api/users/2')) return Promise.resolve({ ok: true, json: async () => user } as any);
            if (url.endsWith('/api/questions')) return Promise.resolve({ ok: true, json: async () => questions } as any);
            if (url.endsWith('/api/users/2/answers')) return Promise.resolve({ ok: true, json: async () => answers } as any);
            return Promise.resolve({ ok: false, json: async () => ({}) } as any);
        });

        render(
            <AuthProvider>
                <ProfilePage />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.queryByText(/Loading posts.../i)).not.toBeInTheDocument());

        // collect all anchors pointing to the question route
        const anchors = Array.from(document.querySelectorAll('a')) as HTMLAnchorElement[];
        const linksToQuestion = anchors.filter((a) => a.getAttribute('href') === '/question/11');
        expect(linksToQuestion.length).toBeGreaterThanOrEqual(2);

        fetchMock.mockRestore();
    });

    
});
