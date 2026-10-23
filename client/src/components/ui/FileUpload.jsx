import { useRef, useState } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';

export default function FileUpload({
  label,
  id,
  accept,
  maxSize = 5, // MB
  onChange,
  value,
  error,
  preview = false,
  className = '',
}) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState(value?.name || '');

  const handleFile = (file) => {
    if (!file) return;

    // Check size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    setFileName(file.name);
    onChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleClear = () => {
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
    onChange(null);
  };

  const isImage = accept?.includes('image');

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary-700">
          {label}
        </label>
      )}

      {fileName ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary-50">
          {isImage ? <Image className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
          <span className="text-sm text-secondary-700 flex-1 truncate">{fileName}</span>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-lg hover:bg-secondary-200 text-muted transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors duration-150
            ${dragActive
              ? 'border-primary bg-primary-50'
              : 'border-secondary-300 hover:border-primary hover:bg-primary-50/50'
            }`}
        >
          <Upload className="w-8 h-8 text-muted mb-2" />
          <p className="text-sm text-secondary-600">
            <span className="font-medium text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted mt-1">Max size: {maxSize}MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {error && (
        <p className="text-xs text-danger" role="alert">{error}</p>
      )}
    </div>
  );
}
