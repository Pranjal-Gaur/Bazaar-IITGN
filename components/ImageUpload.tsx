'use client';

import { useState, useRef } from 'react';

interface Props {
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onChange, maxImages = 5 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    if (!files.length) return;
    const remaining = maxImages - images.length;
    if (remaining <= 0) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      Array.from(files)
        .slice(0, remaining)
        .forEach((f) => formData.append('images', f));

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');

      onChange([...images, ...data.urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((url, i) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {images.length < maxImages && (
        <div
          className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
          style={{ borderColor: uploading ? '#079BD8' : '#e2e8f0' }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#079BD8', borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: '#079BD8' }}>Uploading…</p>
            </div>
          ) : (
            <>
              <svg className="w-10 h-10 mx-auto mb-2" style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: '#163850' }}>
                Click or drag to upload photos
              </p>
              <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                {images.length}/{maxImages} photos · JPG, PNG · Max 10MB each
              </p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  );
}
