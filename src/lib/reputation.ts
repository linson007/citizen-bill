export type ReputationInput = {
  publishedBills: number;
  votesReceived: number;
  commentsMade: number;
  suggestionsMade: number;
  acceptedSuggestions: number;
};

export function calculateReputationScore(input: ReputationInput) {
  return (
    input.publishedBills * 20 +
    input.votesReceived * 2 +
    input.commentsMade +
    input.suggestionsMade * 3 +
    input.acceptedSuggestions * 8
  );
}

export function getReputationLevel(score: number) {
  if (score >= 250) {
    return "Civic leader";
  }

  if (score >= 100) {
    return "Trusted contributor";
  }

  if (score >= 40) {
    return "Active citizen";
  }

  return "New contributor";
}
