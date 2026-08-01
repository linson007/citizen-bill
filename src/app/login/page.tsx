import Link from "next/link";
import { Scale } from "lucide-react";

import { AuthButton } from "@/components/auth-button";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f6f2] px-5 text-[#161616]">
      <section className="w-full max-w-md rounded-lg border border-[#d8d2c4] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            className="grid size-11 place-items-center rounded-lg bg-[#123c69] text-white"
            aria-label="MattamUndo home"
          >
            <Scale size={23} aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Sign in to MattamUndo</h1>
            <p className="text-sm text-[#6d6658]">
              Use your Google account to create drafts, vote, and comment.
            </p>
          </div>
        </div>

        <AuthButton />

        <p className="mt-5 text-sm leading-6 text-[#6d6658]">
          AI-generated bill drafts are assistance only and should be reviewed
          before being treated as legal or policy text.
        </p>

        <p className="mt-4 text-sm text-[#6d6658]">
          By continuing you agree to the{" "}
          <Link href="/terms" className="font-semibold text-[#123c69]">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-[#123c69]">
            Privacy policy
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
