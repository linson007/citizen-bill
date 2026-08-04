export type BillResultItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  categoryName: string | null;
  authorName: string;
  publishedAt: string | null;
  votes: number;
  comments: number;
  shares: number;
};

export type BillResultInput = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  publishedAt: Date | null;
  author: {
    name: string | null;
    displayName: string | null;
  };
  category: {
    name: string;
  } | null;
  _count: {
    votes: number;
    comments: number;
    shares: number;
  };
};

export function serializeBillResults(
  bills: BillResultInput[],
): BillResultItem[] {
  return bills.map((bill) => ({
    id: bill.id,
    slug: bill.slug,
    title: bill.title,
    description: bill.description,
    status: bill.status,
    categoryName: bill.category?.name ?? null,
    authorName: bill.author.displayName ?? bill.author.name ?? "Citizen",
    publishedAt: bill.publishedAt ? bill.publishedAt.toISOString() : null,
    votes: bill._count.votes,
    comments: bill._count.comments,
    shares: bill._count.shares,
  }));
}

export function hasBillResultEngagement(bill: BillResultItem): boolean {
  return bill.votes + bill.comments + bill.shares > 0;
}
