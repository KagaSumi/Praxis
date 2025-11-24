import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation push
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: pushMock }),
}));

vi.mock('../components/AuthContext', () => ({
    useAuth: vi.fn(),
}));

import LoginPage from '../app/login/page';
import { useAuth } from '../components/AuthContext';

describe('LoginPage', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
        pushMock.mockClear();
    });

    it('logs in successfully and redirects home', async () => {
        const loginMock = vi.fn();
        (useAuth as any).mockReturnValue({ login: loginMock });

        const userResponse = { userId: 5, first_name: 'Test', last_name: 'User', email: 't@example.com' };

        const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => userResponse,
        } as any);

        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 't@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'password' } });

        const loginButton = screen.getByRole('button', { name: /login/i });
        fireEvent.click(loginButton);

        expect(await screen.findByText(/Login successful!/i)).toBeInTheDocument();

        await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/'), { timeout: 2000 });

        expect(loginMock).toHaveBeenCalledWith(userResponse);

        expect(JSON.parse(String(localStorage.getItem('user')))).toEqual(userResponse);

        fetchMock.mockRestore();
    });

    it('shows an error message on failed login', async () => {
        const loginMock = vi.fn();
        (useAuth as any).mockReturnValue({ login: loginMock });

        const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Invalid credentials' }),
        } as any);

        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'bad@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'bad' } });

        const loginButton = screen.getByRole('button', { name: /login/i });
        fireEvent.click(loginButton);

        expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();

        expect(loginMock).not.toHaveBeenCalled();
        expect(pushMock).not.toHaveBeenCalled();

        fetchMock.mockRestore();
    });

    it('handles non-JSON success response by still redirecting and calling login with null', async () => {
        const loginMock = vi.fn();
        (useAuth as any).mockReturnValue({ login: loginMock });

        // simulate json() throwing (non-JSON body)
        const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => { throw new Error('Unexpected token'); },
        } as any);

        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 't@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'password' } });

        const loginButton = screen.getByRole('button', { name: /login/i });
        fireEvent.click(loginButton);

        // success UI still shows because res.ok is true
        expect(await screen.findByText(/Login successful!/i)).toBeInTheDocument();

        await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/'), { timeout: 2000 });

        // login called with null (parse failed)
        expect(loginMock).toHaveBeenCalledWith(null);

        // localStorage should contain the string 'null'
        expect(localStorage.getItem('user')).toBe('null');

        fetchMock.mockRestore();
    });

    it('shows an error if fetch throws a network error', async () => {
        const loginMock = vi.fn();
        (useAuth as any).mockReturnValue({ login: loginMock });

        const fetchMock = vi.spyOn(global, 'fetch').mockImplementationOnce(() => { throw new Error('network down'); });

        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 't@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'password' } });

        const loginButton = screen.getByRole('button', { name: /login/i });
        fireEvent.click(loginButton);

        expect(await screen.findByText(/network down/i)).toBeInTheDocument();

        expect(loginMock).not.toHaveBeenCalled();
        expect(pushMock).not.toHaveBeenCalled();

        fetchMock.mockRestore();
    });
});
