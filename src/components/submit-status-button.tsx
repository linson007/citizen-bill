"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitStatusButton({
  children,
  pending,
  className,
}: {
  children: React.ReactNode;
  pending: React.ReactNode;
  className?: string;
}) {
  const { pending: isSubmitting } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70 ${className ?? ""}`}
    >
      {isSubmitting ? (
        <Loader2 className="animate-spin" size={16} aria-hidden="true" />
      ) : null}
      {isSubmitting ? pending : children}
    </button>
  );
}