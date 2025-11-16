import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TagEditor from '../components/TagEditor';
import { vi } from 'vitest';

describe('TagEditor', () => {
    beforeEach(() => {
        // stub fetch to return no tags by default
        (global as any).fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
    });

    it('adds a tag when pressing Enter', async () => {
        const onChange = vi.fn();
        render(<TagEditor value={[]} onChange={onChange} />);

        const input = screen.getByPlaceholderText(/e.g. arrays sorting dp/i);
        fireEvent.change(input, { target: { value: 'react' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        await waitFor(() => expect(onChange).toHaveBeenCalled());
        expect(onChange).toHaveBeenCalledWith(['react']);
    });
});
