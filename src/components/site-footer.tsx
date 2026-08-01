import Link from "next/link";
import { Scale } from "lucide-react";

import { getRequestMessages } from "@/lib/request-locale";

export async function SiteFooter() {
  const { t } = await getRequestMessages();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-accent text-white">
              <Scale size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="font-display font-semibold tracking-tight">
                MattamUndo
              </p>
              <p className="font-malayalam text-xs font-medium tracking-[0.04em] text-ink-muted">
                മാറ്റം ഉണ്ടോ?
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            {t.home.support}
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm font-medium text-ink-soft sm:grid-cols-3"
        >
          <Link href="/bills" className="hover:text-accent">
            {t.nav.bills}
          </Link>
          <Link href="/bills/new" className="hover:text-accent">
            {t.nav.newBill}
          </Link>
          <Link href="/dashboard" className="hover:text-accent">
            {t.nav.dashboard}
          </Link>
          <Link href="/terms" className="hover:text-accent">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-accent">
            Privacy
          </Link>
          <a
            href="mailto:linsonkurian007@gmail.com"
            className="hover:text-accent"
          >
            Contact
          </a>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-5 py-4 text-xs text-ink-muted sm:px-8">
          © {new Date().getFullYear()} MattamUndo. Open source under the MIT
          License.
        </p>
      </div>
    </footer>
  );
}
