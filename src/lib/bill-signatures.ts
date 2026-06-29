export function getSignatureButtonLabel(hasSigned: boolean) {
  return hasSigned ? "Update signature" : "Sign petition";
}

export function normalizeSignatureNote(note: string) {
  const trimmed = note.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, 280);
}
