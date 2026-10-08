import { useState, useRef } from 'react'
import { UploadCloud, CheckCircle2, X, File, Image, Music, AlertCircle } from 'lucide-react'

export default function DropZone({
  accept = '*/*',
  label = 'Upload Document',
  description = 'Drag & drop or browse from device',
  type = 'file', // 'image' | 'pdf' | 'audio' | 'file'
  onFileSelect,
  initialFile = null,
}) {
  const [file, setFile] = useState(initialFile)
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const inputRef = useRef(null)

  const handleFiles = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return
    const f = selectedFiles[0]
    setFile(f)

    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreviewUrl(e.target.result)
      reader.readAsDataURL(f)
    } else {
      setPreviewUrl(null)
    }

    if (onFileSelect) onFileSelect(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setFile(null)
    setPreviewUrl(null)
    if (inputRef.current) inputRef.current.value = ''
    if (onFileSelect) onFileSelect(null)
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div
      onClick={() => !file && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`relative rounded-xl transition-all cursor-pointer overflow-hidden ${
        isDragOver ? 'border-[#84CC16] bg-[#84CC16]/5' : ''
      }`}
      style={{
        background: file ? '#161921' : isDragOver ? 'rgba(132,204,22,0.06)' : '#111318',
        border: isDragOver
          ? '2px dashed #84CC16'
          : file
          ? '1px solid rgba(132,204,22,0.3)'
          : '1px dashed rgba(255,255,255,0.12)',
        minHeight: '140px',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Uploaded state */}
      {file ? (
        <div className="p-4 flex flex-col justify-between h-full">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {previewUrl ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black/40 border border-white/10">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(132,204,22,0.1)', color: '#84CC16' }}
                >
                  <File size={22} />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate max-w-[180px]">
                  {file.name || 'Uploaded Document'}
                </p>
                <p className="font-mono-ck text-[10px]" style={{ color: '#9196B0' }}>
                  {formatFileSize(file.size)} • Ready for OCR
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: '#9196B0' }}
            >
              <X size={15} />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
            <span
              className="font-mono-ck text-[10px] flex items-center gap-1.5"
              style={{ color: '#84CC16' }}
            >
              <CheckCircle2 size={12} /> Ingestion Verified
            </span>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-mono-ck text-[10px] text-white/60 hover:text-white underline"
            >
              Replace
            </button>
          </div>
        </div>
      ) : (
        /* Empty Dropzone State */
        <div className="p-5 flex flex-col items-center justify-center text-center h-full">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105"
            style={{
              background: 'rgba(132,204,22,0.08)',
              color: '#84CC16',
              border: '1px solid rgba(132,204,22,0.15)',
            }}
          >
            <UploadCloud size={20} />
          </div>
          <p className="text-xs font-medium text-white">{label}</p>
          <p className="font-mono-ck text-[10px] mt-1" style={{ color: '#9196B0' }}>
            {description}
          </p>
        </div>
      )}
    </div>
  )
}
