import React, { useState } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  title: string;
  content: string;
  contentType: 'json' | 'widget';
  onClose: () => void;
  onDownload?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  title,
  content,
  contentType,
  onClose,
  onDownload,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: '10px', color: '#aaa', fontSize: '12px' }}>
            {contentType === 'json'
              ? 'Below is the JSON representation of your current animation configuration.'
              : 'Paste this HTML snippet into any website to embed your interactive 3D scene widget.'}
          </p>
          <textarea readOnly value={content} onClick={(e) => (e.target as HTMLTextAreaElement).select()} />
        </div>

        <div className="modal-footer">
          {contentType === 'json' && onDownload && (
            <button className="btn btn-secondary" onClick={onDownload} style={{ width: 'auto' }}>
              Download .json File
            </button>
          )}
          <button className="btn btn-regenerate" onClick={handleCopy} style={{ width: 'auto' }}>
            {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
};
