import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));

import SignupPage from '../app/signup/page';

describe('SignupPage', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        pushMock.mockClear();
        // ensure timers are restored after tests that use fake timers
        try {
            vi.useRealTimers();
        } catch (e) {
            // ignore if already real
        }
    });

    it('signs up successfully and redirects to login', async () => {
        // mock successful signup response
        const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: true, json: async () => ({}) } as any);

        render(<SignupPage />);

        fireEvent.change(screen.getByPlaceholderText(/e.g. Sarah Heward/i), { target: { value: 'Sarah Heward' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. sarah.heward@my.bcit.ca/i), { target: { value: 'sarah@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. A01234567/i), { target: { value: 'A01234567' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter a password/i), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByPlaceholderText(/Re-enter your password/i), { target: { value: 'Password123!' } });

        const form = document.querySelector('form') as HTMLFormElement;
        fireEvent.submit(form);

        // wait for success message to appear
        await screen.findByText(/Signup successful! Redirecting.../i);

        // wait for the router push (the component uses a timeout before redirect)
        await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/login'), { timeout: 3000 });

        fetchMock.mockRestore();
    });

    it('shows name validation error', async () => {
        render(<SignupPage />);
        fireEvent.change(screen.getByPlaceholderText(/e.g. Sarah Heward/i), { target: { value: '1' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. sarah.heward@my.bcit.ca/i), { target: { value: 'sarah@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. A01234567/i), { target: { value: 'A01234567' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter a password/i), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByPlaceholderText(/Re-enter your password/i), { target: { value: 'Password123!' } });
        const form = document.querySelector('form') as HTMLFormElement;
        fireEvent.submit(form);
        expect(await screen.findByText(/Please enter a valid name/i)).toBeInTheDocument();
    });

    it('shows email validation error', async () => {
        render(<SignupPage />);
        fireEvent.change(screen.getByPlaceholderText(/e.g. Sarah Heward/i), { target: { value: 'Sarah Heward' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. sarah.heward@my.bcit.ca/i), { target: { value: 'not-an-email' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. A01234567/i), { target: { value: 'A01234567' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter a password/i), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByPlaceholderText(/Re-enter your password/i), { target: { value: 'Password123!' } });
        const form = document.querySelector('form') as HTMLFormElement;
        fireEvent.submit(form);
        expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });

    it('shows student number validation error', async () => {
        render(<SignupPage />);
        fireEvent.change(screen.getByPlaceholderText(/e.g. Sarah Heward/i), { target: { value: 'Sarah Heward' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. sarah.heward@my.bcit.ca/i), { target: { value: 'sarah@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. A01234567/i), { target: { value: 'B01234567' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter a password/i), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByPlaceholderText(/Re-enter your password/i), { target: { value: 'Password123!' } });
        const form = document.querySelector('form') as HTMLFormElement;
        fireEvent.submit(form);
        expect(await screen.findByText(/Student number must start with 'A0'/i)).toBeInTheDocument();
    });

    it('shows password mismatch validation error', async () => {
        render(<SignupPage />);
        fireEvent.change(screen.getByPlaceholderText(/e.g. Sarah Heward/i), { target: { value: 'Sarah Heward' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. sarah.heward@my.bcit.ca/i), { target: { value: 'sarah@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. A01234567/i), { target: { value: 'A01234567' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter a password/i), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByPlaceholderText(/Re-enter your password/i), { target: { value: 'Different1' } });
        const form = document.querySelector('form') as HTMLFormElement;
        fireEvent.submit(form);
        expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
    });

    it('shows missing fields validation error', async () => {
        render(<SignupPage />);
        fireEvent.change(screen.getByPlaceholderText(/e.g. Sarah Heward/i), { target: { value: 'Sarah Heward' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. sarah.heward@my.bcit.ca/i), { target: { value: 'sarah@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. A01234567/i), { target: { value: 'A01234567' } });
        //empty password field
        fireEvent.change(screen.getByPlaceholderText(/Re-enter your password/i), { target: { value: '' } });
        const form = document.querySelector('form') as HTMLFormElement;
        fireEvent.submit(form);
        expect(await screen.findByText(/Please fill in all fields/i)).toBeInTheDocument();
    });

    it('shows server error message when backend returns non-ok', async () => {
        // mock server error
        const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'Email already in use' }) } as any);

        render(<SignupPage />);

        fireEvent.change(screen.getByPlaceholderText(/e.g. Sarah Heward/i), { target: { value: 'Sarah Heward' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. sarah.heward@my.bcit.ca/i), { target: { value: 'sarah@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. A01234567/i), { target: { value: 'A01234567' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter a password/i), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByPlaceholderText(/Re-enter your password/i), { target: { value: 'Password123!' } });

        const form = document.querySelector('form') as HTMLFormElement;
        fireEvent.submit(form);

        expect(await screen.findByText(/Email already in use/i)).toBeInTheDocument();

        fetchMock.mockRestore();
    });

    it('shows network error message when fetch throws', async () => {
        const fetchMock = vi.spyOn(global, 'fetch').mockImplementation(() => { throw new Error('network down'); });

        render(<SignupPage />);

        fireEvent.change(screen.getByPlaceholderText(/e.g. Sarah Heward/i), { target: { value: 'Sarah Heward' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. sarah.heward@my.bcit.ca/i), { target: { value: 'sarah@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/e.g. A01234567/i), { target: { value: 'A01234567' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter a password/i), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByPlaceholderText(/Re-enter your password/i), { target: { value: 'Password123!' } });

        fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

        expect(await screen.findByText(/network|Network error/i)).toBeInTheDocument();

        fetchMock.mockRestore();
    });
});
