"use client";

import { useEffect, useState } from "react";

export function CharCount({
  htmlFor,
  max,
}: {
  htmlFor: string;
  max: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const element = document.getElementById(htmlFor);

    if (!(element instanceof HTMLTextAreaElement)) {
      return;
    }

    const update = () => setCount(element.value.length);
    update();
    element.addEventListener("input", update);

    return () => element.removeEventListener("input", update);
  }, [htmlFor]);

  return (
    <span
      className={`text-xs font-medium tabular-nums ${
        count >= max ? "text-danger" : "text-ink-muted"
      }`}
    >
      {count.toLocaleString()} / {max.toLocaleString()}
    </span>
  );
}