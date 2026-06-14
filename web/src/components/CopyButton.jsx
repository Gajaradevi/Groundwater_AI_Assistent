import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * CopyButton Component (Phase 4.5)
 * Renders a small icon button that copies the provided text to the clipboard.
 * Shows a temporary "Copied!" tooltip for feedback.
 */
export function CopyButton({ textToCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <button
      type="button"
      className={`copy-btn ${copied ? 'copied' : ''}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy response'}
      aria-label={copied ? 'Copied to clipboard' : 'Copy response to clipboard'}
    >
      {copied ? (
        <>
          <Check size={13} />
          <span className="copy-tooltip">Copied!</span>
        </>
      ) : (
        <Copy size={13} />
      )}
    </button>
  );
}

export default CopyButton;
