import { describe, it, expect } from 'vitest';
import { formatDate } from '../helpers/formatDate';

describe('formatDate', () => {
    it('returns a non-empty string for now', () => {
        const res = formatDate(new Date().toISOString());
        expect(typeof res).toBe('string');
        expect(res.length).toBeGreaterThan(0);
    });

    it('formats an old date including year', () => {
        const res = formatDate('2000-01-02T15:04:00Z');
        expect(res).toContain('2000');
    });
});
