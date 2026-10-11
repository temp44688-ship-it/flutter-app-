import * as FileSystem from 'expo-file-system/legacy';

const DIRECTORY_NAME = 'medical-attachments';
function safeFileName(fileName: string): string { return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120) || 'document'; }
async function ensurePrivateDirectory(): Promise<string> { const root = FileSystem.documentDirectory; if (!root) throw new Error('Le stockage privé de l’application est indisponible.'); const directory = `${root}${DIRECTORY_NAME}/`; await FileSystem.makeDirectoryAsync(directory, { intermediates: true }); return directory; }

/** The document directory is private to this app and is not a public media location. */
export async function copyAttachmentToPrivateStorage(sourceUri: string, attachmentId: string, fileName: string): Promise<string> { const directory = await ensurePrivateDirectory(); const destination = `${directory}${attachmentId}-${safeFileName(fileName)}`; await FileSystem.copyAsync({ from: sourceUri, to: destination }); return destination; }
export async function deletePrivateAttachment(fileUri: string): Promise<void> { await FileSystem.deleteAsync(fileUri, { idempotent: true }); }
export async function getPrivateAttachmentInfo(fileUri: string): Promise<FileSystem.FileInfo> { return FileSystem.getInfoAsync(fileUri); }

/** Future hook: replace copyAsync with streaming encryption before writing to disk. */
export async function encryptAttachmentForStorage(sourceUri: string): Promise<string> { // TODO: use a native AES-GCM streaming implementation; never log plaintext or keys.
  return sourceUri;
}
