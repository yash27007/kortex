import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";

/**
 * Serialize MDX content for use with next-mdx-remote
 */
export async function serializeMDX(content: string) {
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [
        remarkGfm, // GitHub Flavored Markdown (tables, strikethrough, etc.)
        remarkMath, // Math expressions
      ],
      rehypePlugins: [
        rehypeKatex, // Render math with KaTeX
        rehypeSlug, // Add IDs to headings
      ],
    },
  });

  return mdxSource;
}

/**
 * Simple markdown to HTML for preview/fallback
 * (Used when full MDX processing isn't needed)
 */
export function simpleMarkdownToHtml(content: string): string {
  return content
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-white mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold text-white mt-8 mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-white mt-8 mb-4">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold"><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-800 text-amber-400 rounded text-sm font-mono">$1</code>')
    // Lists
    .replace(/^\- (.*$)/gm, '<li class="text-slate-300">$1</li>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-amber-500 pl-4 py-2 my-4 bg-amber-500/5 rounded-r-lg italic text-slate-300">$1</blockquote>')
    // Paragraphs
    .replace(/^(?!<[hl]|<li|<blockquote)(.+)$/gm, '<p class="text-slate-300 leading-relaxed mb-4">$1</p>')
    // Wrap list items
    .replace(/(<li.*<\/li>)+/gs, '<ul class="list-disc list-inside text-slate-300 mb-4 space-y-2 ml-4">$&</ul>')
    // Line breaks
    .replace(/\n\n/g, '<br/>')
    .replace(/\n/g, '');
}





