import { useNavigate } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useDocumentStore } from '../../stores/documentStore';

export function PdfUpload() {
  const navigate = useNavigate();
  const loadFile = useDocumentStore((s) => s.loadFile);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.');
      return;
    }
    setIsLoading(true);
    try {
      await loadFile(file);
      navigate({ to: '/read' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load PDF.');
      setIsLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        disabled={isLoading}
        className={`flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 font-mono text-sm transition-colors ${
          isDragging
            ? 'border-accent bg-accent/5 text-accent'
            : 'border-border text-text-secondary hover:border-text-muted hover:text-text-primary'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span>
          {isLoading
            ? 'Loading PDF…'
            : isDragging
              ? 'Drop your PDF here'
              : 'Click to upload or drag a PDF here'}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={onSelect}
        className="hidden"
      />
      {error && <p className="font-mono text-xs text-error">{error}</p>}
    </div>
  );
}
