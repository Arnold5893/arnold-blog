// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [mdx()],
  markdown: {
    smartypants: false,
    rehypePlugins: [
      () => tree => {
        const wrapTables = node => {
          if (!Array.isArray(node.children)) return;

          node.children = node.children.flatMap(child => {
            if (child.type === 'element' && child.tagName === 'table') {
              return [{
                type: 'element',
                tagName: 'div',
                properties: { className: ['table-scroll'] },
                children: [child],
              }];
            }

            wrapTables(child);
            return [child];
          });
        };

        wrapTables(tree);
      },
    ],
    shikiConfig: {
      // 粉绿调主题，契合整体配色风格
      theme: 'rose-pine-dawn',
      wrap: true,
      langAlias: { mermaid: 'text' },
      transformers: [
        {
          name: 'mark-mermaid-code-blocks',
          pre(node) {
            if (node.properties.dataLanguage === 'mermaid') {
              this.addClassToHast(node, 'mermaid-source');
            }
          },
        },
      ],
    },
  },
});
