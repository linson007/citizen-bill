export function getNextBillResultIndex({
  currentIndex,
  direction,
  total,
}: {
  currentIndex: number;
  direction: -1 | 1;
  total: number;
}) {
  if (total <= 0) {
    return -1;
  }

  return (currentIndex + direction + total) % total;
}

export function isKeyboardShortcutTarget(element: EventTarget | null) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    element.closest(
      'input, textarea, select, button, [contenteditable="true"], [role="textbox"]',
    ),
  );
}
