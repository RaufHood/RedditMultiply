"use client";

import { cn } from "@/lib/utils";
import { FileIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";

interface CodeComparisonProps {
  beforeCode: string;
  afterCode: string;
  language: string;
  filename: string;
  lightTheme: string;
  darkTheme: string;
  highlightColor?: string;
  onAfterCodeChange?: (code: string) => void;
  editable?: boolean;
}

export function CodeComparison({
  beforeCode,
  afterCode,
  language,
  filename,
  lightTheme,
  darkTheme,
  highlightColor = "#ff3333",
  onAfterCodeChange,
  editable = false,
}: CodeComparisonProps) {
  const { theme, systemTheme } = useTheme();
  const [highlightedBefore, setHighlightedBefore] = useState("");
  const [highlightedAfter, setHighlightedAfter] = useState("");
  const [hasLeftFocus, setHasLeftFocus] = useState(false);
  const [hasRightFocus, setHasRightFocus] = useState(false);
  const [editableAfterCode, setEditableAfterCode] = useState(afterCode);
  const [isEditing, setIsEditing] = useState(false);

  const selectedTheme = useMemo(() => {
    const currentTheme = theme === "system" ? systemTheme : theme;
    return currentTheme === "dark" ? darkTheme : lightTheme;
  }, [theme, systemTheme, darkTheme, lightTheme]);

  useEffect(() => {
    if (highlightedBefore || highlightedAfter) {
      setHasLeftFocus(highlightedBefore.includes('class="line focused"'));
      setHasRightFocus(highlightedAfter.includes('class="line focused"'));
    }
  }, [highlightedBefore, highlightedAfter]);

  // Generate diff highlighting with manual styling
  const generateDiffCode = (before: string, after: string) => {
    const beforeLines = before.split('\n');
    const afterLines = after.split('\n');
    
    // Simple diff logic
    const maxLines = Math.max(beforeLines.length, afterLines.length);
    let beforeHtml = '<pre class="diff-container"><code>';
    let afterHtml = '<pre class="diff-container"><code>';
    
    for (let i = 0; i < maxLines; i++) {
      const beforeLine = beforeLines[i] || '';
      const afterLine = afterLines[i] || '';
      
      if (beforeLine !== afterLine) {
        if (beforeLine) {
          beforeHtml += `<span class="diff-line removed" style="background-color: rgba(248, 113, 113, 0.2); display: block; padding: 2px 8px;">${beforeLine}</span>\n`;
        }
        if (afterLine) {
          afterHtml += `<span class="diff-line added" style="background-color: rgba(34, 197, 94, 0.2); display: block; padding: 2px 8px;">${afterLine}</span>\n`;
        }
      } else {
        beforeHtml += `<span class="diff-line unchanged" style="display: block; padding: 2px 8px;">${beforeLine}</span>\n`;
        afterHtml += `<span class="diff-line unchanged" style="display: block; padding: 2px 8px;">${afterLine}</span>\n`;
      }
    }
    
    beforeHtml += '</code></pre>';
    afterHtml += '</code></pre>';
    
    return { beforeDiff: beforeHtml, afterDiff: afterHtml };
  };

  useEffect(() => {
    const { beforeDiff, afterDiff } = generateDiffCode(beforeCode, editableAfterCode);
    setHighlightedBefore(beforeDiff);
    setHighlightedAfter(afterDiff);
  }, [beforeCode, editableAfterCode]);

  useEffect(() => {
    setEditableAfterCode(afterCode);
  }, [afterCode]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onAfterCodeChange) {
      onAfterCodeChange(editableAfterCode);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableAfterCode(afterCode);
  };

  const renderCode = (code: string, highlighted: string, isAfter: boolean = false) => {
    // If it's the after code, editable, and in editing mode - show textarea
    if (isAfter && editable && isEditing) {
      return (
        <div className="h-full w-full bg-background p-2 flex flex-col">
          <textarea
            value={editableAfterCode}
            onChange={(e) => {
              setEditableAfterCode(e.target.value);
              if (onAfterCodeChange) {
                onAfterCodeChange(e.target.value);
              }
            }}
            className="w-full flex-1 bg-transparent border border-gray-300 rounded p-2 outline-none resize-none font-mono text-xs text-foreground"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
            placeholder="Edit the content here..."
          />
        </div>
      );
    }

    if (highlighted) {
      return (
        <div
          style={{ "--highlight-color": highlightColor } as React.CSSProperties}
          className={cn(
            "h-full w-full overflow-auto bg-background font-mono text-xs",
            "[&>pre]:h-full [&>pre]:!w-screen [&>pre]:py-2",
            "[&>pre>code]:!inline-block [&>pre>code]:!w-full",
            "[&>pre>code>span]:!inline-block [&>pre>code>span]:w-full [&>pre>code>span]:px-4 [&>pre>code>span]:py-0.5",
            "[&>pre>code>.highlighted]:inline-block [&>pre>code>.highlighted]:w-full [&>pre>code>.highlighted]:!bg-[var(--highlight-color)]",
            "group-hover/left:[&>pre>code>:not(.focused)]:!opacity-100 group-hover/left:[&>pre>code>:not(.focused)]:!blur-none",
            "group-hover/right:[&>pre>code>:not(.focused)]:!opacity-100 group-hover/right:[&>pre>code>:not(.focused)]:!blur-none",
            "[&>pre>code>.add]:bg-[rgba(16,185,129,.16)] [&>pre>code>.remove]:bg-[rgba(244,63,94,.16)]",
            "[&>pre>code>.diff.add]:bg-[rgba(16,185,129,.2)] [&>pre>code>.diff.remove]:bg-[rgba(244,63,94,.2)]",
            "group-hover/left:[&>pre>code>:not(.focused)]:transition-all group-hover/left:[&>pre>code>:not(.focused)]:duration-300",
            "group-hover/right:[&>pre>code>:not(.focused)]:transition-all group-hover/right:[&>pre>code>:not(.focused)]:duration-300",
          )}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      );
    } else {
      return (
        <pre className="h-full overflow-auto break-all bg-background p-4 font-mono text-xs text-foreground">
          {code}
        </pre>
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="group relative w-full overflow-hidden rounded-md border border-border">
        <div className="relative grid md:grid-cols-2">
          <div
            className={cn(
              "leftside group/left border-primary/20 md:border-r",
              hasLeftFocus &&
                "[&>div>pre>code>:not(.focused)]:!opacity-50 [&>div>pre>code>:not(.focused)]:!blur-[0.095rem]",
              "[&>div>pre>code>:not(.focused)]:transition-all [&>div>pre>code>:not(.focused)]:duration-300",
            )}
          >
            <div className="flex items-center border-b border-primary/20 bg-accent p-2 text-sm text-foreground">
              <FileIcon className="mr-2 h-4 w-4" />
              {filename}
              <span className="ml-auto hidden md:block">before</span>
            </div>
            {renderCode(beforeCode, highlightedBefore, false)}
          </div>
          <div
            className={cn(
              "rightside group/right border-t border-primary/20 md:border-t-0",
              hasRightFocus &&
                "[&>div>pre>code>:not(.focused)]:!opacity-50 [&>div>pre>code>:not(.focused)]:!blur-[0.095rem]",
              "[&>div>pre>code>:not(.focused)]:transition-all [&>div>pre>code>:not(.focused)]:duration-300",
            )}
          >
            <div className="flex items-center justify-between border-b border-primary/20 bg-accent p-2 text-sm text-foreground">
              <div className="flex items-center">
                <FileIcon className="mr-2 h-4 w-4" />
                {filename}
                <span className="ml-2 hidden md:block">after</span>
              </div>
              {editable && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'View' : 'Edit'}
                </button>
              )}
            </div>
            {renderCode(editableAfterCode, highlightedAfter, true)}
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border border-primary/20 bg-accent text-xs text-foreground md:flex">
          VS
        </div>
      </div>
    </div>
  );
}
