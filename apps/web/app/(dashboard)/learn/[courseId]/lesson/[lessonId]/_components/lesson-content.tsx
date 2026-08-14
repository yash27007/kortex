"use client";

import type { JSX } from "react";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  HiClipboard,
  HiCheck,
  HiLightBulb,
  HiExclamationTriangle,
  HiInformationCircle,
} from "react-icons/hi2";
import { MermaidDiagram } from "@/components/mdx/mermaid-diagram";

interface LessonContentProps {
  content: string;
}

export function LessonContent({ content }: LessonContentProps) {
  // Parse and render markdown content
  const renderedContent = useMemo(() => {
    return parseMarkdown(content);
  }, [content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="lesson-content"
    >
      {renderedContent}
    </motion.div>
  );
}

// Simple markdown parser that returns React elements
function parseMarkdown(content: string): React.ReactNode[] {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLanguage = "";
  let inList = false;
  let listItems: string[] = [];
  let listType: "ul" | "ol" = "ul";
  let inTable = false;
  let tableRows: string[][] = [];
  let inCallout = false;
  let calloutType: "info" | "warning" | "tip" = "info";
  let calloutContent: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(" ").trim();
      if (text) {
        elements.push(
          <p key={key++} className="text-slate-300 leading-relaxed mb-4">
            {parseInline(text)}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      const ListTag = listType === "ol" ? "ol" : "ul";
      const listClass =
        listType === "ol"
          ? "list-decimal list-inside text-slate-300 mb-4 space-y-2 ml-4"
          : "list-disc list-inside text-slate-300 mb-4 space-y-2 ml-4";
      elements.push(
        <ListTag key={key++} className={listClass}>
          {listItems.map((item, i) => (
            <li key={i} className="text-slate-300">
              {parseInline(item)}
            </li>
          ))}
        </ListTag>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const [header, ...body] = tableRows;
      elements.push(
        <div key={key++} className="overflow-x-auto my-6">
          <table className="w-full border-collapse">
            <thead className="bg-slate-800">
              <tr>
                {header?.map((cell, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-sm font-semibold text-white border-b border-slate-700"
                  >
                    {parseInline(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {body.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/50">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-sm text-slate-300">
                      {parseInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const trimmedLine = line.trim();

    // Code blocks
    if (trimmedLine.startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        if (codeBlockLanguage.toLowerCase() === "mermaid") {
          elements.push(
            <MermaidDiagram key={key++} code={codeBlockContent.join("\n")} />
          );
        } else {
          elements.push(
            <CodeBlock
              key={key++}
              code={codeBlockContent.join("\n")}
              language={codeBlockLanguage || "text"}
            />
          );
        }
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        // Start of code block
        flushParagraph();
        flushList();
        flushTable();
        inCodeBlock = true;
        codeBlockLanguage = trimmedLine.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Callout blocks: <Callout type="info|warning|tip">...</Callout>
    if (inCallout) {
      const closeIdx = trimmedLine.indexOf("</Callout>");
      if (closeIdx !== -1) {
        const text = trimmedLine.slice(0, closeIdx).trim();
        if (text) calloutContent.push(text);
        elements.push(
          <Callout key={key++} type={calloutType}>
            {parseInline(calloutContent.join(" ").trim())}
          </Callout>
        );
        calloutContent = [];
        inCallout = false;
      } else if (trimmedLine) {
        calloutContent.push(trimmedLine);
      }
      continue;
    }

    const calloutOpenMatch = trimmedLine.match(
      /^<Callout(?:\s+type=["'](info|warning|tip)["'])?\s*>(.*)$/i
    );
    if (calloutOpenMatch) {
      flushParagraph();
      flushList();
      flushTable();
      calloutType = (calloutOpenMatch[1]?.toLowerCase() as "info" | "warning" | "tip") || "info";
      const rest = calloutOpenMatch[2] ?? "";
      const closeIdx = rest.indexOf("</Callout>");
      if (closeIdx !== -1) {
        const text = rest.slice(0, closeIdx).trim();
        elements.push(
          <Callout key={key++} type={calloutType}>
            {parseInline(text)}
          </Callout>
        );
      } else {
        inCallout = true;
        if (rest.trim()) calloutContent.push(rest.trim());
      }
      continue;
    }

    // Tables
    if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
      flushParagraph();
      flushList();

      // Skip separator row
      if (trimmedLine.includes("---")) {
        inTable = true;
        continue;
      }

      inTable = true;
      const cells = trimmedLine.slice(1, -1).split("|");
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headers
    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch && headerMatch[1] && headerMatch[2]) {
      flushParagraph();
      flushList();
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      const headerClasses = {
        1: "text-3xl font-bold text-white mt-8 mb-4 first:mt-0",
        2: "text-2xl font-semibold text-white mt-8 mb-3 pb-2 border-b border-slate-800",
        3: "text-xl font-semibold text-white mt-6 mb-2",
        4: "text-lg font-medium text-white mt-4 mb-2",
        5: "text-base font-medium text-white mt-4 mb-2",
        6: "text-sm font-medium text-white mt-4 mb-2",
      };
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      elements.push(
        <Tag
          key={key++}
          className={headerClasses[level as keyof typeof headerClasses]}
        >
          {parseInline(text)}
        </Tag>
      );
      continue;
    }

    // Blockquotes
    if (trimmedLine.startsWith(">")) {
      flushParagraph();
      flushList();
      const quoteText = trimmedLine.slice(1).trim();
      elements.push(
        <blockquote
          key={key++}
          className="border-l-4 border-amber-500 pl-4 py-2 my-4 bg-amber-500/5 rounded-r-lg italic text-slate-300"
        >
          {parseInline(quoteText)}
        </blockquote>
      );
      continue;
    }

    // Unordered lists
    if (trimmedLine.match(/^[-*]\s+/)) {
      flushParagraph();
      if (!inList || listType !== "ul") {
        flushList();
        listType = "ul";
      }
      inList = true;
      listItems.push(trimmedLine.replace(/^[-*]\s+/, ""));
      continue;
    }

    // Ordered lists
    const orderedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch && orderedMatch[1]) {
      flushParagraph();
      if (!inList || listType !== "ol") {
        flushList();
        listType = "ol";
      }
      inList = true;
      listItems.push(orderedMatch[1]);
      continue;
    }

    // Horizontal rule
    if (trimmedLine.match(/^[-*_]{3,}$/)) {
      flushParagraph();
      flushList();
      elements.push(<hr key={key++} className="border-slate-700 my-8" />);
      continue;
    }

    // Empty line
    if (trimmedLine === "") {
      flushParagraph();
      flushList();
      continue;
    }

    // Regular paragraph
    currentParagraph.push(trimmedLine);
  }

  // Flush remaining content
  flushParagraph();
  flushList();
  flushTable();

  return elements;
}

// Parse inline markdown (bold, italic, code, links)
function parseInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  // Patterns to match
  const patterns = [
    // Bold + italic
    {
      regex: /\*\*\*(.*?)\*\*\*/,
      render: (match: string) => (
        <strong key={key++} className="font-bold">
          <em>{match}</em>
        </strong>
      ),
    },
    // Bold
    {
      regex: /\*\*(.*?)\*\*/,
      render: (match: string) => (
        <strong key={key++} className="font-semibold text-white">
          {match}
        </strong>
      ),
    },
    // Italic
    {
      regex: /\*(.*?)\*/,
      render: (match: string) => (
        <em key={key++} className="italic text-slate-200">
          {match}
        </em>
      ),
    },
    // Inline code
    {
      regex: /`([^`]+)`/,
      render: (match: string) => (
        <code
          key={key++}
          className="px-1.5 py-0.5 bg-slate-800 text-amber-400 rounded text-sm font-mono"
        >
          {match}
        </code>
      ),
    },
    // Links
    {
      regex: /\[([^\]]+)\]\(([^)]+)\)/,
      render: (text: string, url: string) => (
        <a
          key={key++}
          href={url}
          className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
          target={url.startsWith("http") ? "_blank" : undefined}
          rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {text}
        </a>
      ),
    },
  ];

  while (remaining.length > 0) {
    let earliestMatch: { index: number; length: number; element: React.ReactNode } | null =
      null;

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match && match.index !== undefined && match[0] && match[1]) {
        if (!earliestMatch || match.index < earliestMatch.index) {
          let element: React.ReactNode;
          if (pattern.regex.toString().includes("[^\\]]+") && match[2]) {
            // Link pattern
            element = (pattern.render as (text: string, url: string) => React.ReactNode)(
              match[1],
              match[2]
            );
          } else {
            element = (pattern.render as (match: string) => React.ReactNode)(match[1]);
          }
          earliestMatch = {
            index: match.index,
            length: match[0].length,
            element,
          };
        }
      }
    }

    if (earliestMatch) {
      // Add text before match
      if (earliestMatch.index > 0) {
        parts.push(remaining.slice(0, earliestMatch.index));
      }
      // Add matched element
      parts.push(earliestMatch.element);
      // Continue with remaining text
      remaining = remaining.slice(earliestMatch.index + earliestMatch.length);
    } else {
      // No more matches, add remaining text
      parts.push(remaining);
      break;
    }
  }

  return parts.length === 1 ? parts[0] : parts;
}

// Code block component with syntax highlighting
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      {/* Language badge */}
      <div className="absolute top-0 left-4 -translate-y-1/2 px-2 py-0.5 bg-slate-700 text-xs text-slate-300 rounded font-mono z-10">
        {language}
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-lg bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-600 z-10"
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
        showLineNumbers={code.split("\n").length > 3}
        lineNumberStyle={{
          color: "#4a4a5a",
          paddingRight: "1rem",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// Highlighted aside for an important point — matches AI-authored
// <Callout type="info|warning|tip"> tags in lesson MDX source.
function Callout({
  children,
  type = "info",
}: {
  children: React.ReactNode;
  type?: "info" | "warning" | "tip";
}) {
  const styles = {
    info: "bg-blue-500/10 border-blue-500/30",
    warning: "bg-amber-500/10 border-amber-500/30",
    tip: "bg-emerald-500/10 border-emerald-500/30",
  };

  const icons = {
    info: <HiInformationCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />,
    warning: <HiExclamationTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />,
    tip: <HiLightBulb className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />,
  };

  return (
    <div className={`my-4 p-4 rounded-lg border ${styles[type]}`}>
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1 text-slate-200">{children}</div>
      </div>
    </div>
  );
}



