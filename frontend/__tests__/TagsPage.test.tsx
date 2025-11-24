import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: pushMock }),
}));

import TagsPage from '../app/tags/page';
import { AuthProvider } from '../components/AuthContext';

describe('TagsPage', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
        pushMock.mockClear();
    });

    it('renders available tags and posts', async () => {
        const questions = [
            { questionId: 1, title: 'First Q', tags: ['alpha', 'beta'], content: 'c1', userId: 10, createdAt: new Date().toISOString(), upVotes: 1, viewCount: 5, answerCount: 0 },
            { questionId: 2, title: 'Second Q', tags: ['beta'], content: 'c2', userId: 11, createdAt: new Date().toISOString(), upVotes: 2, viewCount: 3, answerCount: 1 },
        ];

        const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: true, json: async () => questions } as any);

        render(
            <AuthProvider>
                <TagsPage />
            </AuthProvider>
        );

        expect(await screen.findByRole('button', { name: 'alpha' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'beta' })).toBeInTheDocument();

        expect(screen.getByText('First Q')).toBeInTheDocument();
        expect(screen.getByText('Second Q')).toBeInTheDocument();

        fetchMock.mockRestore();
    });

    it('filters posts when a tag is selected and clears filters', async () => {
        const questions = [
            { questionId: 1, title: 'First Q', tags: ['alpha', 'beta'], content: 'c1', userId: 10, createdAt: new Date().toISOString(), upVotes: 1, viewCount: 5, answerCount: 0 },
            { questionId: 2, title: 'Second Q', tags: ['gamma'], content: 'c2', userId: 11, createdAt: new Date().toISOString(), upVotes: 2, viewCount: 3, answerCount: 1 },
        ];

        const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: true, json: async () => questions } as any);

        render(
            <AuthProvider>
                <TagsPage />
            </AuthProvider>
        );

        expect(await screen.findByRole('button', { name: 'alpha' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'gamma' })).toBeInTheDocument();


        fireEvent.click(screen.getByRole('button', { name: 'alpha' }));

        await waitFor(() => expect(screen.getByText('First Q')).toBeInTheDocument());
        expect(screen.queryByText('Second Q')).not.toBeInTheDocument();


        fireEvent.click(screen.getByRole('button', { name: /Clear filters/i }));

        expect(await screen.findByText('Second Q')).toBeInTheDocument();

        fetchMock.mockRestore();
    });

    it('shows no tags message when no tags present', async () => {
        const questions: any[] = [
            { questionId: 1, title: 'NoTagQ', tags: [], content: 'c', userId: 1, createdAt: new Date().toISOString() }
        ];
        const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: true, json: async () => questions } as any);

        render(
            <AuthProvider>
                <TagsPage />
            </AuthProvider>
        );

        expect(await screen.findByText(/No tags found on posts./i)).toBeInTheDocument();

        fetchMock.mockRestore();
    });

    it('handles fetch failure gracefully', async () => {
        const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: false, json: async () => ({}) } as any);

        render(
            <AuthProvider>
                <TagsPage />
            </AuthProvider>
        );

        expect(await screen.findByText(/No tags found on posts./i)).toBeInTheDocument();

        fetchMock.mockRestore();
    });
});
