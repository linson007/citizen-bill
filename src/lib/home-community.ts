export type CommunityTotals = {
  publicBills: number;
  votes: number;
  comments: number;
};

const MINIMUM_PUBLIC_BILLS = 3;
const MINIMUM_ENGAGEMENT = 10;

export function hasEstablishedCommunity({
  publicBills,
  votes,
  comments,
}: CommunityTotals) {
  return (
    publicBills >= MINIMUM_PUBLIC_BILLS &&
    votes + comments >= MINIMUM_ENGAGEMENT
  );
}
