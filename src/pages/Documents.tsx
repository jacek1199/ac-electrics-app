import { useRef, useState } from 'react'
import { useStore } from '../lib/store'
import type { DocumentCategory, DocumentFile } from '../lib/types'
import { uploadAttachment, deleteAttachmentFile, attachmentKind, formatFileSize } from '../lib/attachments'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { IconInvoice, IconProtocol, IconFolder, IconPaperclip, IconVideo, IconFile, IconTrash } from '../components/layout/icons'
import { confirmAction } from '../components/ui/confirmBus'
import { pushToast } from '../components/ui/toastBus'
import { fmtDate } from '../lib/calc'

const categories: { value: DocumentCategory; label: string; icon: (p: { className?: string }) => React.ReactElement }[] = [
  { value: 'faktura', label: 'Faktury', icon: IconInvoice },
  { value: 'umowa', label: 'Umowy', icon: IconProtocol },
  { value: 'inne', label: 'Inne', icon: IconFolder },
]

function DocIcon({ doc }: { doc: DocumentFile }) {
  const kind = attachmentKind(doc.mimeType)
  if (kind === 'image') return <img src={doc.url} alt={doc.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
  const Icon = kind === 'video' ? IconVideo : IconFile
  return (
    <div className="w-10 h-10 rounded-lg bg-navy-950/60 border border-navy-700 flex items-center justify-center text-ink-500 shrink-0">
      <Icon className="w-5 h-5" />
    </div>
  )
}

function CategoryColumn({ category, label, icon: Icon, docs }: {
  category: DocumentCategory
  label: string
  icon: (p: { className?: string }) => React.ReactElement
  docs: DocumentFile[]
}) {
  const addDocument = useStore((s) => s.addDocument)
  const removeDocument = useStore((s) => s.removeDocument)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    for (const file of Array.from(files)) {
      try {
        const uploaded = await uploadAttachment(file, `documents/${category}`)
        addDocument({ ...uploaded, category })
      } catch {
        pushToast(`Nie udało się przesłać pliku "${file.name}" (za duży lub niedozwolony format)`, 'danger')
      }
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const remove = async (doc: DocumentFile) => {
    const ok = await confirmAction(`Usunąć plik "${doc.name}"?`, 'Usuń plik')
    if (!ok) return
    removeDocument(doc.id)
    deleteAttachmentFile(doc.path)
    pushToast('Plik usunięty', 'info')
  }

  return (
    <Card className="p-5">
      <CardHeader
        title={label}
        subtitle={`${docs.length} ${docs.length === 1 ? 'plik' : 'plików'}`}
        action={<Icon className="w-5 h-5 text-teal-bright" />}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full mb-4 flex items-center justify-center gap-2 text-sm font-medium text-teal-bright border border-teal-bright/40 rounded-xl py-2.5 hover:bg-teal-bright/10 hover:border-teal-bright transition-colors disabled:opacity-50"
      >
        <IconPaperclip className="w-4 h-4" /> {uploading ? 'Przesyłanie…' : 'Dodaj plik'}
      </button>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

      {docs.length === 0 ? (
        <EmptyState icon={<Icon className="w-6 h-6" />} title="Brak plików" hint="Dodaj pierwszy plik w tej kategorii." />
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-navy-950/60 border border-navy-700">
              <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 min-w-0 flex-1">
                <DocIcon doc={doc} />
                <div className="min-w-0">
                  <div className="text-sm text-ink-100 truncate">{doc.name}</div>
                  <div className="text-[11px] text-ink-500">{formatFileSize(doc.size)} · {fmtDate(doc.uploadedAt.slice(0, 10))}</div>
                </div>
              </a>
              <button type="button" onClick={() => remove(doc)} className="text-ink-500 hover:text-danger p-1.5 shrink-0">
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export function Documents() {
  const documents = useStore((s) => s.documents)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokumenty"
        subtitle={`${documents.length} plików łącznie — faktury, umowy i inne dokumenty firmy`}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {categories.map((c) => (
          <CategoryColumn
            key={c.value}
            category={c.value}
            label={c.label}
            icon={c.icon}
            docs={documents.filter((d) => d.category === c.value)}
          />
        ))}
      </div>
    </div>
  )
}
