export type OnboardingStats = {
  billCount: number;
  publishedCount: number;
  voteCount: number;
  commentCount: number;
  followedCount: number;
};

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
};

export function getOnboardingSteps(stats: OnboardingStats): OnboardingStep[] {
  return [
    {
      id: "create-bill",
      title: "Create your first bill",
      description:
        "Start from a public problem and let the AI assistant draft it with you.",
      href: "/bills/new",
      completed: stats.billCount > 0,
    },
    {
      id: "publish-bill",
      title: "Publish a bill",
      description:
        "Publish a draft so citizens can read, discuss, and support it.",
      href: "/dashboard",
      completed: stats.publishedCount > 0,
    },
    {
      id: "support-bill",
      title: "Support a bill you believe in",
      description: "Browse public bills and back the proposals that matter.",
      href: "/bills",
      completed: stats.voteCount > 0,
    },
    {
      id: "join-discussion",
      title: "Join the discussion",
      description: "Comment on a bill to improve it or raise concerns.",
      href: "/bills",
      completed: stats.commentCount > 0,
    },
    {
      id: "follow-bill",
      title: "Follow a bill",
      description: "Follow a bill to get updates on comments and amendments.",
      href: "/bills",
      completed: stats.followedCount > 0,
    },
  ];
}

export function countCompletedOnboardingSteps(steps: OnboardingStep[]): number {
  return steps.filter((step) => step.completed).length;
}

export function isOnboardingComplete(stats: OnboardingStats): boolean {
  return getOnboardingSteps(stats).every((step) => step.completed);
}
