"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "motion/react";
import { HiClipboard, HiCheck, HiLightBulb, HiExclamationTriangle } from "react-icons/hi2";
import { useState } from "react";

// Custom components for MDX
const components = {
  // Headings with anchor links
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-3xl font-bold text-white mt-8 mb-4 first:mt-0"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-2xl font-semibold text-white mt-8 mb-3 pb-2 border-b border-slate-800"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-semibold text-white mt-6 mb-2" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-lg font-medium text-white mt-4 mb-2" {...props}>
      {children}
    </h4>
  ),

  // Paragraphs
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-slate-300 leading-relaxed mb-4" {...props}>
      {children}
    </p>
  ),

  // Lists
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2 ml-4" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside text-slate-300 mb-4 space-y-2 ml-4" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-slate-300" {...props}>
      {children}
    </li>
  ),

  // Links
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  ),

  // Blockquote
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-amber-500 pl-4 py-2 my-4 bg-amber-500/5 rounded-r-lg italic text-slate-300"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Tables
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-slate-800" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className="divide-y divide-slate-700" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="hover:bg-slate-800/50" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="px-4 py-3 text-left text-sm font-semibold text-white"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-3 text-sm text-slate-300" {...props}>
      {children}
    </td>
  ),

  // Inline code
  code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    // Check if this is a code block (has language class)
    const match = /language-(\w+)/.exec(className || "");

    if (match && match[1]) {
      return (
        <CodeBlock language={match[1]} {...props}>
          {String(children).replace(/\n$/, "")}
        </CodeBlock>
      );
    }

    // Inline code
    return (
      <code
        className="px-1.5 py-0.5 bg-slate-800 text-amber-400 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },

  // Pre (wrapper for code blocks)
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
    return <>{children}</>;
  },

  // Horizontal rule
  hr: () => <hr className="border-slate-700 my-8" />,

  // Strong and emphasis
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-white" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-slate-200" {...props}>
      {children}
    </em>
  ),

  // Custom components
  Callout,
  Tip,
  Warning,
};

// Code block with copy button
function CodeBlock({
  children,
  language,
}: {
  children: string;
  language: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      {/* Language badge */}
      <div className="absolute top-0 left-4 -translate-y-1/2 px-2 py-0.5 bg-slate-700 text-xs text-slate-300 rounded font-mono">
        {language}
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-lg bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-600"
        title="Copy code"
      >
        {copied ? (
          <HiCheck className="w-4 h-4 text-emerald-400" />
        ) : (
          <HiClipboard className="w-4 h-4 text-slate-400" />
        )}
      </button>

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1.5rem",
          paddingTop: "2rem",
          borderRadius: "0.75rem",
          fontSize: "0.875rem",
          backgroundColor: "#1e1e2e",
        }}
        showLineNumbers={children.split("\n").length > 3}
        lineNumberStyle={{
          color: "#4a4a5a",
          paddingRight: "1rem",
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

// Callout component
function Callout({
  children,
  type = "info",
}: {
  children: React.ReactNode;
  type?: "info" | "warning" | "tip";
}) {
  const styles = {
    info: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    tip: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  };

  const icons = {
    info: "ℹ️",
    warning: "⚠️",
    tip: "💡",
  };

  return (
    <div className={`my-4 p-4 rounded-lg border ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icons[type]}</span>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

// Tip component
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
      <div className="flex items-start gap-3">
        <HiLightBulb className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-emerald-300">{children}</div>
      </div>
    </div>
  );
}

// Warning component
function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
      <div className="flex items-start gap-3">
        <HiExclamationTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-amber-300">{children}</div>
      </div>
    </div>
  );
}

interface MDXContentProps {
  source: MDXRemoteSerializeResult;
}

export function MDXContent({ source }: MDXContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="prose prose-invert max-w-none"
    >
      <MDXRemote {...source} components={components} />
    </motion.div>
  );
}

// Export components for external use
export { components as mdxComponents };





