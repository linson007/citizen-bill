import type { Locale } from "@/lib/locale";

type MessageTree = {
  nav: {
    bills: string;
    newBill: string;
    new: string;
    dashboard: string;
    profile: string;
    notifications: string;
    moderation: string;
    account: string;
    signIn: string;
    signOut: string;
    checking: string;
    openMenu: string;
    closeMenu: string;
    language: string;
    english: string;
    malayalam: string;
  };
  home: {
    brand: string;
    tagline: string;
    headline: string;
    support: string;
    ctaPrimary: string;
    ctaSecondary: string;
    howHeading: string;
    howSupport: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    trendingHeading: string;
    trendingSupport: string;
    allProposals: string;
    emptyBills: string;
    snapshotHeading: string;
    snapshotSupport: string;
    thisWeek: string;
    viewBills: string;
    emptyActivity: string;
    emptyActivityCta: string;
    publicBills: string;
    billsInReview: string;
    communityVotes: string;
    publicComments: string;
    trustHeading: string;
    trustSupport: string;
    trustModeration: string;
    trustModerationText: string;
    trustCommunity: string;
    trustCommunityText: string;
    trustWorkflow: string;
    trustWorkflowText: string;
    exampleProblemLabel: string;
    exampleProblem: string;
    howCta: string;
  };
  bills: {
    eyebrow: string;
    heading: string;
    support: string;
    create: string;
    searchPlaceholder: string;
    allCategories: string;
    search: string;
    emptyHeading: string;
    emptySupport: string;
    by: string;
  };
  draft: {
    eyebrow: string;
    heading: string;
    support: string;
  };
};

export const messages: Record<Locale, MessageTree> = {
  en: {
    nav: {
      bills: "Bills",
      newBill: "New bill",
      new: "New",
      dashboard: "Dashboard",
      profile: "Profile",
      notifications: "Notifications",
      moderation: "Moderation",
      account: "Account",
      signIn: "Sign in",
      signOut: "Sign out",
      checking: "Checking",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      language: "Language",
      english: "English",
      malayalam: "Malayalam",
    },
    home: {
      brand: "MattamUndo",
      tagline: "മാറ്റം ഉണ്ടോ?",
      headline: "Turn public problems into bills people can support.",
      support:
        "A Kerala-first civic space to draft, review, vote on, and share public bill proposals—with AI help and community oversight.",
      ctaPrimary: "Draft a bill",
      ctaSecondary: "Browse bills",
      howHeading: "How it works",
      howSupport: "Four steps from a public problem to a shareable draft.",
      step1: "Describe the public problem",
      step2: "Generate a bill outline with AI",
      step3: "Review clauses and a plain-language summary",
      step4: "Publish for voting and comments",
      trendingHeading: "Trending bills",
      trendingSupport: "Ranked by votes, discussion, and recent activity.",
      allProposals: "All proposals",
      emptyBills:
        "No public bills yet. Publish a proposal and it will appear here for review.",
      snapshotHeading: "Community snapshot",
      snapshotSupport: "Live counts across published proposals.",
      thisWeek: "This week",
      viewBills: "View bills",
      emptyActivity:
        "No public activity yet. Votes, comments, and shares will show up here.",
      emptyActivityCta: "Browse published bills",
      howCta: "Start drafting",
      publicBills: "Public bills",
      billsInReview: "Bills in review",
      communityVotes: "Community votes",
      publicComments: "Public comments",
      trustHeading: "Built for public scrutiny",
      trustSupport: "Moderation, community review, and transparent drafts.",
      trustModeration: "Moderation queue",
      trustModerationText:
        "Reports, abuse flags, and policy risks are built into the workflow.",
      trustCommunity: "Community review",
      trustCommunityText:
        "Votes and comments help strong public proposals move forward.",
      trustWorkflow: "Public bill workflow",
      trustWorkflowText:
        "Bills stay focused on discussion, transparent versions, and community support.",
      exampleProblemLabel: "Example problem",
      exampleProblem:
        "Public hospitals should publish monthly availability data for essential medicines and diagnostic services.",
    },
    bills: {
      eyebrow: "Public bills",
      heading: "Published public bills",
      support:
        "Browse bills published for reading, discussion, voting, and sharing.",
      create: "Create bill",
      searchPlaceholder: "Search title, description, or problem",
      allCategories: "All categories",
      search: "Search",
      emptyHeading: "No published bills yet",
      emptySupport:
        "Create a draft, publish it from the bill detail page, and it will appear here for public review.",
      by: "By",
    },
    draft: {
      eyebrow: "New bill draft",
      heading: "Create a structured bill proposal",
      support:
        "Start with the public problem and save a private draft. Publishing, voting, comments, uploads, and AI drafting build on this record.",
    },
  },
  ml: {
    nav: {
      bills: "ബില്ലുകൾ",
      newBill: "പുതിയ ബിൽ",
      new: "പുതിയത്",
      dashboard: "ഡാഷ്‌ബോർഡ്",
      profile: "പ്രൊഫൈൽ",
      notifications: "അറിയിപ്പുകൾ",
      moderation: "മോഡറേഷൻ",
      account: "അക്കൗണ്ട്",
      signIn: "സൈൻ ഇൻ",
      signOut: "സൈൻ ഔട്ട്",
      checking: "പരിശോധിക്കുന്നു",
      openMenu: "മെനു തുറക്കുക",
      closeMenu: "മെനു അടയ്ക്കുക",
      language: "ഭാഷ",
      english: "English",
      malayalam: "മലയാളം",
    },
    home: {
      brand: "MattamUndo",
      tagline: "മാറ്റം ഉണ്ടോ?",
      headline: "പൊതു പ്രശ്നങ്ങളെ ജനങ്ങൾക്ക് പിന്തുണയ്ക്കാവുന്ന ബില്ലുകളാക്കാം.",
      support:
        "കേരളത്തിന് മുൻഗണന നൽകി, AI സഹായത്തോടെയും സമൂഹ നിരീക്ഷണത്തോടെയും പൊതു ബിൽ നിർദേശങ്ങൾ തയ്യാറാക്കാനും ചർച്ച ചെയ്യാനും വോട്ട് ചെയ്യാനും പങ്കിടാനുമുള്ള പൗരസ്ഥലം.",
      ctaPrimary: "ബിൽ തയ്യാറാക്കുക",
      ctaSecondary: "ബില്ലുകൾ കാണുക",
      howHeading: "എങ്ങനെ പ്രവർത്തിക്കുന്നു",
      howSupport: "പൊതു പ്രശ്നത്തിൽ നിന്ന് പങ്കിടാവുന്ന ഡ്രാഫ്റ്റിലേക്ക് നാല് ഘട്ടങ്ങൾ.",
      step1: "പൊതു പ്രശ്നം വിവരിക്കുക",
      step2: "AI ഉപയോഗിച്ച് ബിൽ ഔട്ട്‌ലൈൻ ഉണ്ടാക്കുക",
      step3: "വകുപ്പുകളും ലളിതമായ സംഗ്രഹവും പരിശോധിക്കുക",
      step4: "വോട്ടിനും അഭിപ്രായങ്ങൾക്കുമായി പ്രസിദ്ധീകരിക്കുക",
      trendingHeading: "ട്രെൻഡിംഗ് ബില്ലുകൾ",
      trendingSupport: "വോട്ട്, ചർച്ച, സമീപകാല പ്രവർത്തനം അടിസ്ഥാനമാക്കി.",
      allProposals: "എല്ലാ നിർദേശങ്ങളും",
      emptyBills:
        "ഇതുവരെ പൊതു ബില്ലുകളില്ല. ഒരു നിർദേശം പ്രസിദ്ധീകരിച്ചാൽ അത് ഇവിടെ കാണാം.",
      snapshotHeading: "കമ്മ്യൂണിറ്റി സ്നാപ്പ്ഷോട്ട്",
      snapshotSupport: "പ്രസിദ്ധീകരിച്ച നിർദേശങ്ങളുടെ തത്സമയ കണക്കുകൾ.",
      thisWeek: "ഈ ആഴ്ച",
      viewBills: "ബില്ലുകൾ കാണുക",
      emptyActivity:
        "ഇതുവരെ പൊതു പ്രവർത്തനമില്ല. വോട്ടുകളും അഭിപ്രായങ്ങളും പങ്കിടലുകളും ഇവിടെ കാണാം.",
      emptyActivityCta: "പ്രസിദ്ധീകരിച്ച ബില്ലുകൾ കാണുക",
      howCta: "ഡ്രാഫ്റ്റ് ആരംഭിക്കുക",
      publicBills: "പൊതു ബില്ലുകൾ",
      billsInReview: "പരിശോധനയിലുള്ള ബില്ലുകൾ",
      communityVotes: "കമ്മ്യൂണിറ്റി വോട്ടുകൾ",
      publicComments: "പൊതു അഭിപ്രായങ്ങൾ",
      trustHeading: "പൊതു പരിശോധനയ്ക്കായി രൂപകൽപ്പന ചെയ്തത്",
      trustSupport: "മോഡറേഷൻ, കമ്മ്യൂണിറ്റി അവലോകനം, സുതാര്യമായ ഡ്രാഫ്റ്റുകൾ.",
      trustModeration: "മോഡറേഷൻ ക്യൂ",
      trustModerationText:
        "റിപ്പോർട്ടുകളും ദുരുപയോഗ ഫ്ലാഗുകളും നയ അപകടസാധ്യതകളും വർക്ക്ഫ്ലോയിൽ ഉൾപ്പെടുത്തിയിരിക്കുന്നു.",
      trustCommunity: "കമ്മ്യൂണിറ്റി അവലോകനം",
      trustCommunityText:
        "വോട്ടുകളും അഭിപ്രായങ്ങളും ശക്തമായ പൊതു നിർദേശങ്ങൾ മുന്നോട്ട് കൊണ്ടുപോകാൻ സഹായിക്കുന്നു.",
      trustWorkflow: "പൊതു ബിൽ വർക്ക്ഫ്ലോ",
      trustWorkflowText:
        "ചർച്ച, സുതാര്യമായ പതിപ്പുകൾ, കമ്മ്യൂണിറ്റി പിന്തുണ എന്നിവയിൽ ശ്രദ്ധ കേന്ദ്രീകരിക്കുന്നു.",
      exampleProblemLabel: "ഉദാഹരണ പ്രശ്നം",
      exampleProblem:
        "പൊതു ആശുപത്രികൾ അവശ്യ മരുന്നുകളുടെയും ഡയഗ്നോസ്റ്റിക് സേവനങ്ങളുടെയും മാസിക ലഭ്യത ഡാറ്റ പ്രസിദ്ധീകരിക്കണം.",
    },
    bills: {
      eyebrow: "പൊതു ബില്ലുകൾ",
      heading: "പ്രസിദ്ധീകരിച്ച പൊതു ബില്ലുകൾ",
      support:
        "വായന, ചർച്ച, വോട്ട്, പങ്കിടൽ എന്നിവയ്ക്കായി പ്രസിദ്ധീകരിച്ച ബില്ലുകൾ കാണുക.",
      create: "ബിൽ ഉണ്ടാക്കുക",
      searchPlaceholder: "തലക്കെട്ട്, വിവരണം, അല്ലെങ്കിൽ പ്രശ്നം തിരയുക",
      allCategories: "എല്ലാ വിഭാഗങ്ങളും",
      search: "തിരയുക",
      emptyHeading: "ഇതുവരെ പ്രസിദ്ധീകരിച്ച ബില്ലുകളില്ല",
      emptySupport:
        "ഒരു ഡ്രാഫ്റ്റ് ഉണ്ടാക്കി ബിൽ വിശദാംശ പേജിൽ നിന്ന് പ്രസിദ്ധീകരിച്ചാൽ അത് ഇവിടെ കാണാം.",
      by: "രചയിതാവ്",
    },
    draft: {
      eyebrow: "പുതിയ ബിൽ ഡ്രാഫ്റ്റ്",
      heading: "ഘടനയുള്ള ബിൽ നിർദേശം തയ്യാറാക്കുക",
      support:
        "പൊതു പ്രശ്നത്തിൽ നിന്ന് ആരംഭിച്ച് സ്വകാര്യ ഡ്രാഫ്റ്റ് സേവ് ചെയ്യുക. പ്രസിദ്ധീകരണം, വോട്ട്, അഭിപ്രായങ്ങൾ, അപ്‌ലോഡുകൾ, AI ഡ്രാഫ്റ്റിംഗ് എന്നിവ ഈ റെക്കോർഡിൽ നിർമ്മിക്കപ്പെടും.",
    },
  },
};

export function getMessages(locale: Locale): MessageTree {
  return messages[locale];
}
