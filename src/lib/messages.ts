import type { Locale } from "@/lib/locale";

export type MessageTree = {
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
    eyebrow: string;
    headline: string;
    support: string;
    heroNote: string;
    independence: string;
    ctaPrimary: string;
    ctaSecondary: string;
    heroHowLink: string;
    howHeading: string;
    howSupport: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    trendingHeading: string;
    trendingSupport: string;
    proposalsHeading: string;
    proposalsSupport: string;
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
    sort: string;
    published: string;
    newest: string;
    mostActive: string;
    mostSupported: string;
    mostDiscussed: string;
    newProposal: string;
    votes: string;
    comments: string;
    shares: string;
    results: string;
    clearFilters: string;
    emptyHeading: string;
    emptySupport: string;
    by: string;
    layoutLabel: string;
    layoutList: string;
    layoutGrid: string;
    keyboardHint: string;
  };
  draft: {
    eyebrow: string;
    heading: string;
    support: string;
    suggestions: {
      button: string;
      help: string;
      problemRequired: string;
      title: string;
      category: string;
      useTitle: string;
      useCategory: string;
      dismiss: string;
      error: string;
    };
  };
  footer: {
    terms: string;
    privacy: string;
    contact: string;
    copyright: string;
  };
  login: {
    home: string;
    heading: string;
    support: string;
    checking: string;
    signIn: string;
    signOut: string;
    disclaimer: string;
    agreement: string;
    privacyPolicy: string;
  };
};

export const messages: Record<Locale, MessageTree> = {
  en: {
    nav: {
      bills: "Bills",
      newBill: "Start a bill",
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
      eyebrow: "A civic platform for Kerala",
      headline: "Turn public problems into bills people can support.",
      support:
        "A Kerala-first civic space to draft, review, vote on, and share public bill proposals—with AI help and community oversight.",
      heroNote: "No legal expertise needed—start with the problem you see.",
      independence:
        "Independent civic platform — not a government service. Published drafts are public proposals, not official legislation.",
      ctaPrimary: "Start a bill",
      ctaSecondary: "Browse bills",
      heroHowLink: "See how it works",
      howHeading: "How it works",
      howSupport: "Four steps from a public problem to a shareable draft.",
      step1: "Describe the public problem",
      step2: "Generate a bill outline with AI",
      step3: "Review clauses and a plain-language summary",
      step4: "Publish for voting and comments",
      trendingHeading: "Trending bills",
      trendingSupport: "Ranked by votes, discussion, and recent activity.",
      proposalsHeading: "Public proposals",
      proposalsSupport:
        "Explore the first public proposals and help shape the discussion.",
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
      howCta: "Start a bill",
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
      create: "Start a bill",
      searchPlaceholder: "Search title, description, or problem",
      allCategories: "All categories",
      search: "Search",
      sort: "Sort bills",
      published: "Published",
      newest: "Newest",
      mostActive: "Most active",
      mostSupported: "Most supported",
      mostDiscussed: "Most discussed",
      newProposal: "New public proposal",
      votes: "votes",
      comments: "comments",
      shares: "shares",
      results: "proposals",
      clearFilters: "Clear filters",
      emptyHeading: "No published bills yet",
      emptySupport:
        "Create a draft, publish it from the bill detail page, and it will appear here for public review.",
      by: "By",
      layoutLabel: "Layout",
      layoutList: "List view",
      layoutGrid: "Grid view",
      keyboardHint:
        "Keyboard: arrow keys move between bills; Enter or Space opens one. G = grid, L = list, / = search.",
    },
    draft: {
      eyebrow: "New bill draft",
      heading: "Create a structured bill proposal",
      support:
        "Start with the public problem and save a private draft. Publishing, voting, comments, uploads, and AI drafting build on this record.",
      suggestions: {
        button: "Suggest title & category",
        help: "Use your problem statement to get optional ideas. Nothing changes until you choose a suggestion.",
        problemRequired:
          "Add a problem statement before asking for suggestions.",
        title: "Suggested title",
        category: "Suggested category",
        useTitle: "Use title",
        useCategory: "Use category",
        dismiss: "Dismiss suggestions",
        error: "Unable to suggest a title and category right now.",
      },
    },
    footer: {
      terms: "Terms",
      privacy: "Privacy",
      contact: "Contact",
      copyright: "Open source under the MIT License.",
    },
    login: {
      home: "MattamUndo home",
      heading: "Sign in to MattamUndo",
      support: "Use your Google account to create drafts, vote, and comment.",
      checking: "Checking",
      signIn: "Sign in",
      signOut: "Sign out",
      disclaimer:
        "AI-generated bill drafts are assistance only and should be reviewed before being treated as legal or policy text.",
      agreement: "By continuing you agree to the",
      privacyPolicy: "Privacy policy",
    },
  },
  ml: {
    nav: {
      bills: "ബില്ലുകൾ",
      newBill: "ബിൽ ആരംഭിക്കുക",
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
      eyebrow: "കേരളത്തിനായുള്ള പൗര വേദി",
      headline:
        "പൊതു പ്രശ്നങ്ങളെ ജനങ്ങൾക്ക് പിന്തുണയ്ക്കാവുന്ന ബില്ലുകളാക്കാം.",
      support:
        "കേരളത്തിന് മുൻഗണന നൽകി, AI സഹായത്തോടെയും സമൂഹ നിരീക്ഷണത്തോടെയും പൊതു ബിൽ നിർദേശങ്ങൾ തയ്യാറാക്കാനും ചർച്ച ചെയ്യാനും വോട്ട് ചെയ്യാനും പങ്കിടാനുമുള്ള പൗരസ്ഥലം.",
      heroNote:
        "നിയമ പരിജ്ഞാനം ആവശ്യമില്ല—നിങ്ങൾ കാണുന്ന പ്രശ്നത്തിൽ നിന്ന് തുടങ്ങാം.",
      independence:
        "സ്വതന്ത്ര പൗര വേദി — സർക്കാർ സേവനമല്ല. പ്രസിദ്ധീകരിച്ച ഡ്രാഫ്റ്റുകൾ പൊതു നിർദേശങ്ങളാണ്; ഔദ്യോഗിക നിയമനിർമ്മാണമല്ല.",
      ctaPrimary: "ബിൽ ആരംഭിക്കുക",
      ctaSecondary: "ബില്ലുകൾ കാണുക",
      heroHowLink: "എങ്ങനെ പ്രവർത്തിക്കുന്നു എന്ന് കാണുക",
      howHeading: "എങ്ങനെ പ്രവർത്തിക്കുന്നു",
      howSupport:
        "പൊതു പ്രശ്നത്തിൽ നിന്ന് പങ്കിടാവുന്ന ഡ്രാഫ്റ്റിലേക്ക് നാല് ഘട്ടങ്ങൾ.",
      step1: "പൊതു പ്രശ്നം വിവരിക്കുക",
      step2: "AI ഉപയോഗിച്ച് ബിൽ ഔട്ട്‌ലൈൻ ഉണ്ടാക്കുക",
      step3: "വകുപ്പുകളും ലളിതമായ സംഗ്രഹവും പരിശോധിക്കുക",
      step4: "വോട്ടിനും അഭിപ്രായങ്ങൾക്കുമായി പ്രസിദ്ധീകരിക്കുക",
      trendingHeading: "ട്രെൻഡിംഗ് ബില്ലുകൾ",
      trendingSupport: "വോട്ട്, ചർച്ച, സമീപകാല പ്രവർത്തനം അടിസ്ഥാനമാക്കി.",
      proposalsHeading: "പൊതു നിർദേശങ്ങൾ",
      proposalsSupport:
        "ആദ്യ പൊതു നിർദേശങ്ങൾ കാണുക; ചർച്ച രൂപപ്പെടുത്തുന്നതിൽ പങ്കാളിയാകുക.",
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
      howCta: "ബിൽ ആരംഭിക്കുക",
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
      create: "ബിൽ ആരംഭിക്കുക",
      searchPlaceholder: "തലക്കെട്ട്, വിവരണം, അല്ലെങ്കിൽ പ്രശ്നം തിരയുക",
      allCategories: "എല്ലാ വിഭാഗങ്ങളും",
      search: "തിരയുക",
      sort: "ബില്ലുകൾ ക്രമീകരിക്കുക",
      published: "പ്രസിദ്ധീകരിച്ചത്",
      newest: "ഏറ്റവും പുതിയത്",
      mostActive: "ഏറ്റവും സജീവം",
      mostSupported: "ഏറ്റവും പിന്തുണയുള്ളത്",
      mostDiscussed: "ഏറ്റവും ചർച്ച ചെയ്യപ്പെട്ടത്",
      newProposal: "പുതിയ പൊതു നിർദേശം",
      votes: "വോട്ടുകൾ",
      comments: "അഭിപ്രായങ്ങൾ",
      shares: "പങ്കിടലുകൾ",
      results: "നിർദേശങ്ങൾ",
      clearFilters: "ഫിൽട്ടറുകൾ മായ്ക്കുക",
      emptyHeading: "ഇതുവരെ പ്രസിദ്ധീകരിച്ച ബില്ലുകളില്ല",
      emptySupport:
        "ഒരു ഡ്രാഫ്റ്റ് ഉണ്ടാക്കി ബിൽ വിശദാംശ പേജിൽ നിന്ന് പ്രസിദ്ധീകരിച്ചാൽ അത് ഇവിടെ കാണാം.",
      by: "രചയിതാവ്",
      layoutLabel: "കാഴ്ച രീതി",
      layoutList: "ലിസ്റ്റ് കാഴ്ച",
      layoutGrid: "ഗ്രിഡ് കാഴ്ച",
      keyboardHint:
        "കീബോർഡ്: അമ്പടയാള കീകൾ ബില്ലുകൾക്കിടയിൽ നീങ്ങും; Enter അല്ലെങ്കിൽ Space തുറക്കും. G = ഗ്രിഡ്, L = ലിസ്റ്റ്, / = തിരയൽ.",
    },
    draft: {
      eyebrow: "പുതിയ ബിൽ ഡ്രാഫ്റ്റ്",
      heading: "ഘടനയുള്ള ബിൽ നിർദേശം തയ്യാറാക്കുക",
      support:
        "പൊതു പ്രശ്നത്തിൽ നിന്ന് ആരംഭിച്ച് സ്വകാര്യ ഡ്രാഫ്റ്റ് സേവ് ചെയ്യുക. പ്രസിദ്ധീകരണം, വോട്ട്, അഭിപ്രായങ്ങൾ, അപ്‌ലോഡുകൾ, AI ഡ്രാഫ്റ്റിംഗ് എന്നിവ ഈ റെക്കോർഡിൽ നിർമ്മിക്കപ്പെടും.",
      suggestions: {
        button: "തലക്കെട്ടും വിഭാഗവും നിർദേശിക്കുക",
        help: "നിങ്ങളുടെ പ്രശ്ന പ്രസ്താവന ഉപയോഗിച്ച് ഐച്ഛിക നിർദേശങ്ങൾ നേടുക. നിങ്ങൾ തിരഞ്ഞെടുക്കുന്നതുവരെ ഒന്നും മാറില്ല.",
        problemRequired:
          "നിർദേശങ്ങൾ ചോദിക്കുന്നതിന് മുമ്പ് ഒരു പ്രശ്ന പ്രസ്താവന ചേർക്കുക.",
        title: "നിർദേശിച്ച തലക്കെട്ട്",
        category: "നിർദേശിച്ച വിഭാഗം",
        useTitle: "തലക്കെട്ട് ഉപയോഗിക്കുക",
        useCategory: "വിഭാഗം ഉപയോഗിക്കുക",
        dismiss: "നിർദേശങ്ങൾ ഒഴിവാക്കുക",
        error: "ഇപ്പോൾ തലക്കെട്ടും വിഭാഗവും നിർദേശിക്കാൻ കഴിയുന്നില്ല.",
      },
    },
    footer: {
      terms: "നിബന്ധനകൾ",
      privacy: "സ്വകാര്യത",
      contact: "ബന്ധപ്പെടുക",
      copyright: "MIT ലൈസൻസിന് കീഴിലുള്ള ഓപ്പൺ സോഴ്സ്.",
    },
    login: {
      home: "MattamUndo ഹോം",
      heading: "MattamUndo-ലേക്ക് സൈൻ ഇൻ ചെയ്യുക",
      support:
        "ഡ്രാഫ്റ്റുകൾ ഉണ്ടാക്കാനും വോട്ട് ചെയ്യാനും അഭിപ്രായം രേഖപ്പെടുത്താനും Google അക്കൗണ്ട് ഉപയോഗിക്കുക.",
      checking: "പരിശോധിക്കുന്നു",
      signIn: "സൈൻ ഇൻ",
      signOut: "സൈൻ ഔട്ട്",
      disclaimer:
        "AI സൃഷ്ടിക്കുന്ന ബിൽ ഡ്രാഫ്റ്റുകൾ സഹായത്തിനായി മാത്രമാണ്; നിയമമോ നയമോ ആയി പരിഗണിക്കുന്നതിന് മുമ്പ് അവ പരിശോധിക്കണം.",
      agreement: "തുടരുന്നതിലൂടെ നിങ്ങൾ",
      privacyPolicy: "സ്വകാര്യതാ നയം",
    },
  },
};

export function getMessages(locale: Locale): MessageTree {
  return messages[locale];
}
