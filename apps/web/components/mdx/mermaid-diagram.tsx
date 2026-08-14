"use client";

import { useEffect, useId, useState } from "react";

interface MermaidDiagramProps {
  code: string;
}

/**
 * Renders a Mermaid diagram definition (flowchart, timeline, mindmap, etc.)
 * as an inline SVG. Mermaid is dynamically imported so its bundle only loads
 * on pages that actually contain a diagram.
 *
 * Diagram text comes from AI-generated lesson content, so `securityLevel:
 * "strict"` is load-bearing here — it sanitizes any HTML/script Mermaid
 * would otherwise pass through from the diagram source.
 */
export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const rawId = useId();
  const elementId = `mermaid-${rawId.replace(/[^a-zA-Z0-9-]/g, "")}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setError(null);

    import("mermaid").then(async ({ default: mermaid }) => {
      if (cancelled) return;
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "strict",
          fontFamily: "inherit",
        });
        const { svg: rendered } = await mermaid.render(elementId, code.trim());
        if (!cancelled) setSvg(rendered);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [code, elementId]);

  if (error) {
    return (
      <div className="my-4 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
        <p className="font-medium mb-1">Diagram failed to render</p>
        <p className="text-red-400/70 text-xs font-mono">{error}</p>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-6 h-32 rounded-lg border border-slate-800 bg-slate-900/50 animate-pulse flex items-center justify-center text-slate-500 text-sm">
        Rendering diagram…
      </div>
    );
  }

  return (
    <div
      className="my-6 p-4 rounded-lg border border-slate-800 bg-white/5 overflow-x-auto [&_svg]:mx-auto"
      // eslint-disable-next-line react/no-danger -- svg comes from mermaid.render() with securityLevel: "strict"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
