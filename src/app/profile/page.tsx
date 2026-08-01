import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  FileText,
  MessageSquare,
  Save,
  ShieldCheck,
  ThumbsUp,
  UserCircle,
} from "lucide-react";

import {
  deleteAiSessionAction,
  updateProfileAction,
} from "@/app/profile/actions";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { PUBLIC_BILL_STATUSES } from "@/lib/bill-visibility";
import { prisma } from "@/lib/prisma";
import { calculateReputationScore, getReputationLevel } from "@/lib/reputation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [
    user,
    bills,
    votes,
    comments,
    publishedBillCount,
    commentCount,
    suggestionCount,
    acceptedSuggestions,
    votesReceived,
    aiSessions,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
    }),
    prisma.bill.findMany({
      where: { authorId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.vote.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { bill: true },
    }),
    prisma.comment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { bill: true },
    }),
    prisma.bill.count({
      where: {
        authorId: session.user.id,
        status: {
          in: [...PUBLIC_BILL_STATUSES],
        },
      },
    }),
    prisma.comment.count({
      where: {
        userId: session.user.id,
      },
    }),
    prisma.amendmentSuggestion.count({
      where: {
        userId: session.user.id,
      },
    }),
    prisma.amendmentSuggestion.count({
      where: {
        userId: session.user.id,
        status: "ACCEPTED",
      },
    }),
    prisma.vote.count({
      where: {
        bill: {
          authorId: session.user.id,
        },
      },
    }),
    prisma.aiConversation.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 6,
      include: {
        bill: true,
      },
    }),
  ]);

  const reputationScore = calculateReputationScore({
    publishedBills: publishedBillCount,
    votesReceived,
    commentsMade: commentCount,
    suggestionsMade: suggestionCount,
    acceptedSuggestions,
  });

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#161616]">
      <SiteHeader />
      <section className="border-b border-[#d8d2c4] bg-[#fbfaf7]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-lg bg-[#e4eef6] text-[#123c69]">
              <UserCircle size={26} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#6d6658]">
                Profile
              </p>
              <h1 className="text-3xl font-semibold">
                {user?.displayName ?? user?.name ?? "Citizen"}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <section className="mb-6 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Public identity</h2>
            <div className="mt-4 flex items-center gap-3">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt=""
                  className="size-12 rounded-lg object-cover"
                />
              ) : (
                <span className="grid size-12 place-items-center rounded-lg bg-[#e4eef6] text-[#123c69]">
                  <UserCircle size={26} aria-hidden="true" />
                </span>
              )}
              <div>
                <p className="font-semibold">
                  {user?.displayName ?? user?.name ?? "Citizen"}
                </p>
                <p className="text-sm text-[#6d6658]">{user?.email}</p>
              </div>
            </div>
            <form action={updateProfileAction} className="mt-5 space-y-3">
              <label className="block">
                <span className="text-sm font-semibold text-[#3f3a32]">
                  Public display name
                </span>
                <input
                  name="displayName"
                  defaultValue={user?.displayName ?? ""}
                  placeholder={user?.name ?? "Citizen"}
                  maxLength={80}
                  className="mt-2 h-10 w-full rounded-md border border-[#c8c0ae] bg-white px-3 text-sm outline-none focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/15"
                />
              </label>
              <button
                type="submit"
                className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#123c69] px-4 text-sm font-semibold text-white shadow-sm"
              >
                <Save size={16} aria-hidden="true" />
                Save profile
              </button>
            </form>
          </div>

          <section className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Bot size={18} aria-hidden="true" />
              <h2 className="font-semibold">Saved AI sessions</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {aiSessions.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-[#e7e1d3] px-3 py-3"
                >
                  <Link
                    href={`/profile/ai-sessions/${item.id}`}
                    className="font-semibold text-[#123c69]"
                  >
                    {item.title ?? "AI drafting session"}
                  </Link>
                  <p className="mt-1 text-xs text-[#6d6658]">
                    {item.bill ? item.bill.title : "General bill session"} ·{" "}
                    {item.updatedAt.toLocaleDateString("en-IN")}
                  </p>
                  <div className="mt-3 flex gap-2">
                    {item.bill ? (
                      <Link
                        href={`/bills/${item.bill.slug}/edit`}
                        className="flex h-8 items-center rounded-md border border-[#c8c0ae] px-2.5 text-xs font-semibold text-[#2f2a22]"
                      >
                        Continue
                      </Link>
                    ) : (
                      <Link
                        href="/bills/new"
                        className="flex h-8 items-center rounded-md border border-[#c8c0ae] px-2.5 text-xs font-semibold text-[#2f2a22]"
                      >
                        New bill
                      </Link>
                    )}
                    <form action={deleteAiSessionAction}>
                      <input type="hidden" name="sessionId" value={item.id} />
                      <button
                        type="submit"
                        className="h-8 rounded-md border border-[#c8c0ae] px-2.5 text-xs font-semibold text-[#8a3a2f]"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
              {aiSessions.length === 0 ? (
                <p className="text-sm text-[#6d6658]">
                  No saved AI sessions yet.
                </p>
              ) : null}
            </div>
          </section>
        </section>

        <section className="mb-6 rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <ShieldCheck size={18} aria-hidden="true" />
                Reputation
              </div>
              <p className="text-sm leading-6 text-[#6d6658]">
                Public contribution score based on published bills, support
                received, comments, and amendment suggestions.
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-3xl font-semibold text-[#123c69]">
                {reputationScore}
              </p>
              <p className="text-sm font-medium text-[#3f3a32]">
                {getReputationLevel(reputationScore)}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-5">
            <ReputationMetric label="Published" value={publishedBillCount} />
            <ReputationMetric label="Votes received" value={votesReceived} />
            <ReputationMetric label="Comments" value={commentCount} />
            <ReputationMetric label="Suggestions" value={suggestionCount} />
            <ReputationMetric label="Accepted" value={acceptedSuggestions} />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <ActivityPanel icon={FileText} title="My bills">
            {bills.map((bill) => (
              <ActivityLink key={bill.id} href={`/bills/${bill.slug}`}>
                {bill.title}
              </ActivityLink>
            ))}
            {bills.length === 0 ? <EmptyText>No bills yet.</EmptyText> : null}
          </ActivityPanel>

          <ActivityPanel icon={ThumbsUp} title="Votes">
            {votes.map((vote) => (
              <ActivityLink key={vote.id} href={`/bills/${vote.bill.slug}`}>
                {vote.bill.title}
              </ActivityLink>
            ))}
            {votes.length === 0 ? <EmptyText>No votes yet.</EmptyText> : null}
          </ActivityPanel>

          <ActivityPanel icon={MessageSquare} title="Comments">
            {comments.map((comment) => (
              <ActivityLink
                key={comment.id}
                href={`/bills/${comment.bill.slug}`}
              >
                {comment.bill.title}
              </ActivityLink>
            ))}
            {comments.length === 0 ? (
              <EmptyText>No comments yet.</EmptyText>
            ) : null}
          </ActivityPanel>
        </div>
      </section>
    </main>
  );
}

function ReputationMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[#e7e1d3] px-3 py-2">
      <p className="text-lg font-semibold text-[#123c69]">
        {value.toLocaleString()}
      </p>
      <p className="text-xs font-medium text-[#6d6658]">{label}</p>
    </div>
  );
}

function ActivityPanel({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof FileText;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={18} aria-hidden="true" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ActivityLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-md border border-[#e7e1d3] px-3 py-2 text-sm font-medium text-[#123c69]"
    >
      {children}
    </Link>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#6d6658]">{children}</p>;
}
