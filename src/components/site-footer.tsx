import Link from "next/link";
import { Scale } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#d8d2c4] bg-[#fbfaf7]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-[#123c69] text-white">
              <Scale size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">MattamUndo</p>
              <p className="text-xs font-medium tracking-[0.04em] text-[#6d6658]">
                മാറ്റം ഉണ്ടോ?
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#6d6658]">
            An open civic platform for drafting, discussing, and supporting
            public bill proposals in Kerala.
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm font-medium text-[#4f4a40] sm:grid-cols-3"
        >
          <Link href="/bills" className="hover:text-[#123c69]">
            Bills
          </Link>
          <Link href="/bills/new" className="hover:text-[#123c69]">
            New bill
          </Link>
          <Link href="/dashboard" className="hover:text-[#123c69]">
            Dashboard
          </Link>
          <Link href="/terms" className="hover:text-[#123c69]">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-[#123c69]">
            Privacy
          </Link>
          <a
            href="mailto:linsonkurian007@gmail.com"
            className="hover:text-[#123c69]"
          >
            Contact
          </a>
        </nav>
      </div>
      <div className="border-t border-[#e7e1d3]">
        <p className="mx-auto max-w-7xl px-5 py-4 text-xs text-[#8a8170] sm:px-8">
          © {new Date().getFullYear()} MattamUndo. Open source under the MIT
          License.
        </p>
      </div>
    </footer>
  );
}
