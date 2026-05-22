import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { BillForm } from "@/app/bills/new/bill-form";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";

export default async function NewBillPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#161616]">
      <SiteHeader />
      <section className="border-b border-[#d8d2c4] bg-[#fbfaf7]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#6d6658]">
            New bill draft
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Create a structured bill proposal
          </h1>
          <p className="mt-2 max-w-2xl text-[#4f4a40]">
            Start with the public problem and save a private draft. Publishing,
            voting, comments, uploads, and AI drafting will build on this
            record.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <BillForm />
      </section>
    </main>
  );
}
