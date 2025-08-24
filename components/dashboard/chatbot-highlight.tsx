import { useState } from "react";

interface ChatbotHighlightProps {
  answer: string;
  references: { [ref: number]: any } | null;
  onReferenceClick?: (info: any) => void;
}

export function ChatbotHighlight({ answer, references, onReferenceClick }: ChatbotHighlightProps) {
  // Replace [n] with clickable spans
  const parts = answer.split(/(\[\d+\])/g);
  return (
    <div>
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          const refNum = parseInt(match[1], 10);
          const refInfo = references ? references[refNum] : null;
          const click = () => {
            if (refInfo && refInfo.file_id && Array.isArray(refInfo.pages) && refInfo.pages.length > 0) {
              const page = refInfo.pages[0].page || 1;
              const anchor = refInfo.anchor_id !== undefined && refInfo.anchor_id !== null ? `&anchor=${refInfo.anchor_id}` : '';
              // open viewer in a new tab so chat remains
              const url = `/viewer/${refInfo.file_id}#page=${page}${anchor}`;
              window.open(url, '_blank');
              if (onReferenceClick) onReferenceClick(refInfo);
            } else if (refInfo && refInfo.file_id) {
              window.open(`/viewer/${refInfo.file_id}`, '_blank');
              if (onReferenceClick) onReferenceClick(refInfo);
            } else if (onReferenceClick) {
              onReferenceClick(refInfo);
            }
          };

          return (
            <span key={i} className="text-blue-600 cursor-pointer underline mx-1" onClick={click}>
              [{refNum}]
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}
