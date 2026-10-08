import { useRef, useState, useEffect } from 'react'

export default function DropZone({
  label,
  description,
  accept,
  file,
  onFileSelect,
  onClear,
  icon = '📁',
}) {
  const inputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    if (file && file.type?.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl(null)
    }
  }, [file])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0])
    }
  }

  const formatSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span>{icon}</span> {label}
        </label>
        {file && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer"
          >
            Remove
          </button>
        )}
      </div>

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-950/40 scale-[1.01]'
              : 'border-slate-700 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-900'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl mb-3 shadow-inner text-slate-300">
            {icon}
          </div>
          <p className="text-sm font-medium text-slate-200 mb-1">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-slate-400 max-w-xs">{description}</p>
        </div>
      ) : (
        <div className="border border-slate-700 bg-slate-900 rounded-xl p-4 flex items-center gap-4">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-16 h-16 rounded-lg object-cover border border-slate-700 bg-slate-950 flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-indigo-950/70 border border-indigo-700/50 flex flex-col items-center justify-center text-indigo-400 flex-shrink-0">
              <span className="text-2xl">📄</span>
              <span className="text-[10px] font-bold uppercase mt-0.5">
                {file.name?.split('.').pop() || 'FILE'}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatSize(file.size)}</p>
            <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Ready for upload
            </span>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            Change
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}
