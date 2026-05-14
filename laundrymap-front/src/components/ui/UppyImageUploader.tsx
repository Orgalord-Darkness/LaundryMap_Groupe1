import { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import Uppy, { type UppyFile } from '@uppy/core'

// Uppy v5 requires two generic params; alias pour éviter la verbosité partout
type AnyFile = UppyFile<Record<string, unknown>, Record<string, unknown>>

interface UppyImageUploaderProps {
  mode: 'logo' | 'gallery'
  onFilesChange: (files: File[]) => void
  existingUrls?: string[]
}

const FR_LOCALE = {
  strings: {
    youCanOnlyUploadX: {
      0: 'Vous pouvez uploader au maximum %{smart_count} fichier',
      1: 'Vous pouvez uploader au maximum %{smart_count} fichiers',
    },
    exceedsSize: '%{file} dépasse la taille maximale autorisée de %{size}',
    youCanOnlyUploadFileTypes: 'Formats acceptés : %{types}',
    noMoreFilesAllowed: 'Impossible d\'ajouter davantage de fichiers',
  },
  pluralize: (count: number) => (count === 1 ? 0 : 1),
}

const CONFIG = {
  logo:    { maxFiles: 1, maxFileSize: 2 * 1024 * 1024, note: '1 image max · 2 Mo · JPEG / PNG / WebP', multiple: false },
  gallery: { maxFiles: 8, maxFileSize: 5 * 1024 * 1024, note: '8 images max · 5 Mo/image · JPEG / PNG / WebP', multiple: true  },
}

export default function UppyImageUploader({ mode, onFilesChange, existingUrls = [] }: UppyImageUploaderProps) {
  const config      = CONFIG[mode]
  const callbackRef = useRef(onFilesChange)
  const previewUrls = useRef<Record<string, string>>({})
  const inputRef    = useRef<HTMLInputElement>(null)

  const [fileItems, setFileItems] = useState<AnyFile[]>([])
  const [error,     setError    ] = useState<string | null>(null)

  useEffect(() => { callbackRef.current = onFilesChange }, [onFilesChange])

  const uppy = useMemo(() => new Uppy({
    locale: FR_LOCALE,
    restrictions: {
      maxNumberOfFiles:  config.maxFiles,
      maxFileSize:       config.maxFileSize,
      allowedFileTypes:  ['image/jpeg', 'image/png', 'image/webp'],
    },
    autoProceed: false,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])

  // Révoquer toutes les object URLs au démontage final
  useEffect(() => {
    return () => {
      Object.values(previewUrls.current).forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  useEffect(() => {
    const handleAdded = (file: AnyFile) => {
      previewUrls.current[file.id] = URL.createObjectURL(file.data as File)
      const all = uppy.getFiles()
      setFileItems([...all] as AnyFile[])
      setError(null)
      callbackRef.current(all.map(f => f.data as File))
    }

    const handleRemoved = (file: AnyFile) => {
      if (previewUrls.current[file.id]) {
        URL.revokeObjectURL(previewUrls.current[file.id])
        delete previewUrls.current[file.id]
      }
      const all = uppy.getFiles()
      setFileItems([...all] as AnyFile[])
      setError(null)
      callbackRef.current(all.map(f => f.data as File))
    }

    const handleRestriction = (_file: AnyFile | null, err: Error) => {
      setError(err.message)
    }

    uppy.on('file-added',         handleAdded)
    uppy.on('file-removed',       handleRemoved)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    uppy.on('restriction-failed', handleRestriction as any)

    return () => {
      uppy.off('file-added',         handleAdded)
      uppy.off('file-removed',       handleRemoved)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      uppy.off('restriction-failed', handleRestriction as any)
    }
  }, [uppy])

  const addFiles = useCallback((rawFiles: FileList | File[]) => {
    setError(null)
    Array.from(rawFiles).forEach(file => {
      try {
        uppy.addFile({ name: file.name, type: file.type, data: file, source: 'local' })
      } catch {
        // l'erreur de restriction est gérée par l'événement restriction-failed
      }
    })
  }, [uppy])

  const handleDrop  = useCallback((e: React.DragEvent) => { e.preventDefault(); addFiles(e.dataTransfer.files) }, [addFiles])
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ''
  }, [addFiles])

  const fileCount = fileItems.length

  return (
    <div className="w-full">

      {/* Compteur galerie */}
      {mode === 'gallery' && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Galerie ({config.maxFiles} max)</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            fileCount >= config.maxFiles ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {fileCount}/{config.maxFiles}
          </span>
        </div>
      )}

      {/* Zone de drop */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors select-none"
      >
        <p className="text-sm text-gray-500">
          Glissez vos images ici ou{' '}
          <span className="text-blue-500 underline">parcourez</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">{config.note}</p>
        <input
          ref={inputRef}
          type="file"
          multiple={config.multiple}
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInput}
          className="hidden"
        />
      </div>

      {/* Erreur de restriction Uppy */}
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

      {/* Images existantes (affichées seulement si aucune nouvelle sélection) */}
      {existingUrls.length > 0 && fileCount === 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1">
            {mode === 'logo' ? 'Logo actuel :' : 'Images actuelles :'}
          </p>
          <div className="flex flex-wrap gap-2">
            {existingUrls.map((url, i) => (
              <img key={i} src={url} alt={`Image ${i + 1}`}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm" />
            ))}
          </div>
        </div>
      )}

      {/* Miniatures des nouveaux fichiers */}
      {fileCount > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {fileItems.map(file => (
            <div key={file.id} className="relative">
              <img
                src={previewUrls.current[file.id]}
                alt={file.name ?? ''}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
              />
              <button
                type="button"
                onClick={e => { e.stopPropagation(); uppy.removeFile(file.id) }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center transition-colors shadow"
                aria-label="Supprimer"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
