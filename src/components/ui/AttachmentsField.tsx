import { useRef, useState } from 'react'
import type { FileAttachment } from '../../lib/types'
import { uploadAttachment, deleteAttachmentFile, attachmentKind, formatFileSize } from '../../lib/attachments'
import { IconPaperclip, IconVideo, IconFile, IconTrash } from '../layout/icons'
import { pushToast } from './toastBus'

const ACCEPT = 'image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx'

export function AttachmentsField({
  value,
  onChange,
  folder,
  label = 'Załączniki',
}: {
  value: FileAttachment[]
  onChange: (list: FileAttachment[]) => void
  folder: string
  label?: string
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    const uploaded: FileAttachment[] = []
    for (const file of Array.from(files)) {
      try {
        uploaded.push(await uploadAttachment(file, folder))
      } catch {
        pushToast(`Nie udało się przesłać pliku "${file.name}" (za duży lub niedozwolony format)`, 'danger')
      }
    }
    if (uploaded.length > 0) onChange([...value, ...uploaded])
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const remove = (a: FileAttachment) => {
    onChange(value.filter((x) => x.id !== a.id))
    deleteAttachmentFile(a.path)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-ink-300">{label}</span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-teal-bright hover:text-gold flex items-center gap-1 disabled:opacity-50"
        >
          <IconPaperclip className="w-3.5 h-3.5" /> {uploading ? 'Przesyłanie…' : 'Dodaj plik'}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {value.length === 0 ? (
        <p className="text-xs text-ink-500">Brak załączników.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {value.map((a) => (
            <AttachmentThumb key={a.id} attachment={a} onRemove={() => remove(a)} />
          ))}
        </div>
      )}
    </div>
  )
}

function AttachmentThumb({ attachment, onRemove }: { attachment: FileAttachment; onRemove: () => void }) {
  const kind = attachmentKind(attachment.mimeType)
  return (
    <div className="relative rounded-lg border border-navy-600 bg-navy-950/60 overflow-hidden">
      <a href={attachment.url} target="_blank" rel="noreferrer" className="block">
        {kind === 'image' ? (
          <img src={attachment.url} alt={attachment.name} className="w-full h-20 object-cover" />
        ) : (
          <div className="w-full h-20 flex flex-col items-center justify-center gap-1 text-ink-500">
            {kind === 'video' ? <IconVideo className="w-6 h-6" /> : <IconFile className="w-6 h-6" />}
          </div>
        )}
        <div className="px-1.5 py-1 border-t border-navy-700">
          <div className="text-[10px] text-ink-300 truncate">{attachment.name}</div>
          <div className="text-[9px] text-ink-500">{formatFileSize(attachment.size)}</div>
        </div>
      </a>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 w-5 h-5 rounded-md bg-navy-950/80 text-ink-300 hover:text-danger flex items-center justify-center"
      >
        <IconTrash className="w-3 h-3" />
      </button>
    </div>
  )
}
