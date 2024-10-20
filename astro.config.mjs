// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
    integrations: [
        starlight({
            title: 'Atom Docs',
            social: {
                github: 'https://github.com/withastro/starlight',
            },
            sidebar: [
                {
                    label: 'Algorithm',
                    autogenerate: { directory: 'algorithm' },
                },
                {
                    label: 'Asynchronous Programming',
                    autogenerate: { directory: 'async' },
                },
                {
                    label: 'Connections',
                    autogenerate: { directory: 'connection' },
                },
                {
                    label: 'Error Handling',
                    autogenerate: { directory: 'error' },
                },
                {
                    label: 'Extra Topics',
                    autogenerate: { directory: 'extra' },
                },
                {
                    label: 'Functions',
                    autogenerate: { directory: 'function' },
                },
                {
                    label: 'Input/Output',
                    autogenerate: { directory: 'io' },
                },
                {
                    label: 'Logging',
                    autogenerate: { directory: 'log' },
                },
                {
                    label: 'Memory Management',
                    autogenerate: { directory: 'memory' },
                },
                {
                    label: 'Search Algorithms',
                    autogenerate: { directory: 'search' },
                },
                {
                    label: 'Security',
                    autogenerate: { directory: 'secret' },
                },
                {
                    label: 'System Information',
                    autogenerate: { directory: 'sysinfo' },
                },
                {
                    label: 'System Operations',
                    autogenerate: { directory: 'system' },
                },
                {
                    label: 'Testing',
                    autogenerate: { directory: 'tests' },
                },
                {
                    label: 'Types',
                    autogenerate: { directory: 'type' },
                },
                {
                    label: 'Web Development',
                    autogenerate: { directory: 'web' },
                },
            ],
            defaultLocale: 'en',
            locales: {
              // 英文文档在 `src/content/docs/en/` 中。
              en: {
                label: 'English',
              },
            },
        }),
    ],
});