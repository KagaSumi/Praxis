import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './test/setupTests.ts',
        // might fix issues with common js being used by some next internals
        deps: ({
            inline: ['next', 'next/dist/*']
        } as any),
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
        },
    },
});
