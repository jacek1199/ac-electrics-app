import { supabase } from './supabaseClient'
import { newId } from './id'
import type { FileAttachment } from './types'

const BUCKET = 'attachments'

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
}

export async function uploadAttachment(file: File, folder: string): Promise<FileAttachment> {
  const id = newId()
  const path = `${folder}/${id}-${sanitizeFileName(file.name)}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return {
    id,
    name: file.name,
    url: data.publicUrl,
    path,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    uploadedAt: new Date().toISOString(),
  }
}

export async function deleteAttachmentFile(path: string): Promise<void> {
  try {
    await supabase.storage.from(BUCKET).remove([path])
  } catch {
    /* best-effort — leaving an orphaned file in storage is harmless */
  }
}

export type AttachmentKind = 'image' | 'video' | 'pdf' | 'other'

export function attachmentKind(mimeType: string): AttachmentKind {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType === 'application/pdf') return 'pdf'
  return 'other'
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
