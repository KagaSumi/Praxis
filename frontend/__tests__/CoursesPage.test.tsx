import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));

import CoursesPage from '../app/courses/page';
import { AuthProvider } from '../components/AuthContext';

describe('CoursesPage', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        pushMock.mockClear();
    });

    it('renders course buttons when courses are returned', async () => {
        const courses = [
            { course_id: 101, name: 'COMP101' },
            { course_id: 202, name: 'MATH202' },
        ];

        // questions can be empty for this test
        const fetchMock = vi.spyOn(global, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = String(input);
            if (url.endsWith('/api/questions')) return Promise.resolve({ ok: true, json: async () => [] } as any);
            if (url.endsWith('/api/courses')) return Promise.resolve({ ok: true, json: async () => courses } as any);
            return Promise.resolve({ ok: false, json: async () => ({}) } as any);
        });

        render(
            <AuthProvider>
                <CoursesPage />
            </AuthProvider>
        );

        // course buttons should appear
        expect(await screen.findByRole('button', { name: 'COMP101' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'MATH202' })).toBeInTheDocument();

        fetchMock.mockRestore();
    });

    it('shows posts for a selected course and allows returning back', async () => {
        const courses = [{ course_id: 101, name: 'COMP101' }];

        const posts = [
            { questionId: 1, title: 'Course post 1', courseId: 101, tags: [], content: 'p1', firstname: 'A', lastname: 'B', createdAt: new Date().toISOString(), upVotes: 0, viewCount: 0 },
            { questionId: 2, title: 'Other post', courseId: 999, tags: [], content: 'p2', firstname: 'C', lastname: 'D', createdAt: new Date().toISOString(), upVotes: 0, viewCount: 0 },
        ];

        const fetchMock = vi.spyOn(global, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = String(input);
            if (url.endsWith('/api/questions')) return Promise.resolve({ ok: true, json: async () => posts } as any);
            if (url.endsWith('/api/courses')) return Promise.resolve({ ok: true, json: async () => courses } as any);
            return Promise.resolve({ ok: false, json: async () => ({}) } as any);
        });

        render(
            <AuthProvider>
                <CoursesPage />
            </AuthProvider>
        );

        // wait for course button and click it
        const courseBtn = await screen.findByRole('button', { name: 'COMP101' });
        fireEvent.click(courseBtn);

        // the post belonging to course 101 should appear, other should not
        expect(await screen.findByText('Course post 1')).toBeInTheDocument();
        expect(screen.queryByText('Other post')).not.toBeInTheDocument();

        fireEvent.click(screen.getByText(/Back to courses/i));

        // course list should be visible again
        expect(await screen.findByRole('button', { name: 'COMP101' })).toBeInTheDocument();

        fetchMock.mockRestore();
    });

    it('shows no courses message when courses API returns empty', async () => {
        const fetchMock = vi.spyOn(global, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = String(input);
            if (url.endsWith('/api/questions')) return Promise.resolve({ ok: true, json: async () => [] } as any);
            if (url.endsWith('/api/courses')) return Promise.resolve({ ok: true, json: async () => [] } as any);
            return Promise.resolve({ ok: false, json: async () => ({}) } as any);
        });

        render(
            <AuthProvider>
                <CoursesPage />
            </AuthProvider>
        );

        expect(await screen.findByText(/No courses available./i)).toBeInTheDocument();

        fetchMock.mockRestore();
    });

    it('handles courses API failure gracefully', async () => {
        const fetchMock = vi.spyOn(global, 'fetch').mockImplementation((input: RequestInfo) => {
            const url = String(input);
            if (url.endsWith('/api/questions')) return Promise.resolve({ ok: true, json: async () => [] } as any);
            if (url.endsWith('/api/courses')) return Promise.resolve({ ok: false, json: async () => ({}) } as any);
            return Promise.resolve({ ok: false, json: async () => ({}) } as any);
        });

        render(
            <AuthProvider>
                <CoursesPage />
            </AuthProvider>
        );

        expect(await screen.findByText(/No courses available./i)).toBeInTheDocument();

        fetchMock.mockRestore();
    });
});
