"use client";

import { useActionState, useSyncExternalStore } from "react";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  FileText,
  History,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Send,
  Save,
  Trash2,
} from "lucide-react";

import { createBillAction, type BillFormState } from "@/app/bills/new/actions";
import {
  AiDraftHelper,
  type AiDraftFields,
} from "@/components/ai-draft-helper";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { billCategories, OTHER_BILL_CATEGORY } from "@/lib/bill-categories";
import {
  clearBillDraft,
  EMPTY_BILL_DRAFT_FIELDS,
  loadBillDraft,
  saveBillDraft,
  type BillDraftFields,
  type StoredBillDraft,
} from "@/lib/draft-storage";
import { formatRelativeTime } from "@/lib/relative-time";
import type { MessageTree } from "@/lib/messages";
import {
  normalizeSuggestedCategory,
  type AiTitleCategorySuggestion,
} from "@/lib/ai-draft-fields";
import type { Locale } from "@/lib/locale";

const initialState: BillFormState = {};
const AUTOSAVE_DELAY_MS = 600;

function subscribeToBillDraft() {
  return () => {};
}

type SuggestionLabels = MessageTree["draft"]["suggestions"];

export function BillForm({
  locale,
  suggestionLabels,
}: {
  locale: Locale;
  suggestionLabels: SuggestionLabels;
}) {
  const snapshotRef = useRef<StoredBillDraft | null | undefined>(undefined);

  const restoredDraft = useSyncExternalStore(
    subscribeToBillDraft,
    () => {
      if (snapshotRef.current === undefined) {
        snapshotRef.current = loadBillDraft();
      }

      return snapshotRef.current;
    },
    () => null,
  );

  return (
    <BillFormEditor
      key={restoredDraft?.savedAt ?? "fresh"}
      restoredDraft={restoredDraft}
      locale={locale}
      suggestionLabels={suggestionLabels}
    />
  );
}

function BillFormEditor({
  restoredDraft,
  locale,
  suggestionLabels,
}: {
  restoredDraft: StoredBillDraft | null;
  locale: Locale;
  suggestionLabels: SuggestionLabels;
}) {
  const ml = locale === "ml";
  const [state, formAction] = useActionState(createBillAction, initialState);
  const [fields, setFields] = useState<BillDraftFields>(() =>
    restoredDraft
      ? restoredDraft.fields
      : {
          title: state.fields?.title ?? "",
          description: state.fields?.description ?? "",
          category: state.fields?.category ?? "",
          categoryOther: state.fields?.categoryOther ?? "",
          tags: state.fields?.tags ?? "",
          problem: state.fields?.problem ?? "",
          proposedSolution: state.fields?.proposedSolution ?? "",
          expectedImpact: state.fields?.expectedImpact ?? "",
          body: state.fields?.body ?? "",
          references: state.fields?.references ?? "",
        },
  );
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [suggestion, setSuggestion] =
    useState<AiTitleCategorySuggestion | null>(null);
  const [suggestionError, setSuggestionError] = useState("");
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"saved" | "saving">(
    "saved",
  );
  const lastSavedSnapshotRef = useRef(JSON.stringify(fields));
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current) {
      return;
    }

    const snapshot = JSON.stringify(fields);

    if (snapshot === lastSavedSnapshotRef.current) {
      return;
    }

    setDraftStatus("saving");
    const timer = setTimeout(() => {
      if (submittedRef.current) {
        return;
      }

      lastSavedSnapshotRef.current = snapshot;
      saveBillDraft(fields);
      setDraftStatus("saved");
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [fields]);

  useEffect(() => {
    if (!state.errors && !state.message) {
      return;
    }

    submittedRef.current = false;
    lastSavedSnapshotRef.current = JSON.stringify(fields);
    saveBillDraft(fields);
  }, [state, fields]);

  function handleSubmit() {
    submittedRef.current = true;
    clearBillDraft();
  }

  function discardDraft() {
    clearBillDraft();
    setFields({ ...EMPTY_BILL_DRAFT_FIELDS });
    setBannerDismissed(true);
    lastSavedSnapshotRef.current = JSON.stringify(EMPTY_BILL_DRAFT_FIELDS);
    setDraftStatus("saved");
  }

  function updateField(name: keyof typeof fields, value: string) {
    setFields((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function insertAiDraft(draft: AiDraftFields) {
    setFields((current) => ({
      ...current,
      title: draft.title || current.title,
      description: draft.description || current.description,
      category: normalizeSuggestedCategory(draft.category) ?? current.category,
      categoryOther: draft.categoryOther || current.categoryOther,
      tags: draft.tags || current.tags,
      problem: draft.problem || current.problem,
      proposedSolution: draft.proposedSolution || current.proposedSolution,
      expectedImpact: draft.expectedImpact || current.expectedImpact,
      body: draft.body || current.body,
      references: draft.references || current.references,
    }));
  }

  async function suggestTitleAndCategory() {
    const problem = fields.problem.trim();

    if (!problem) {
      setSuggestionError(suggestionLabels.problemRequired);
      setSuggestion(null);
      return;
    }

    setSuggestionLoading(true);
    setSuggestionError("");

    try {
      const response = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fields.title,
          prompt: problem,
          mode: "suggest",
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        suggestion?: AiTitleCategorySuggestion;
      };

      if (!response.ok || !data.suggestion) {
        setSuggestionError(data.error ?? suggestionLabels.error);
        return;
      }

      setSuggestion(data.suggestion);
    } catch {
      setSuggestionError(suggestionLabels.error);
    } finally {
      setSuggestionLoading(false);
    }
  }

  const completedFields = [
    fields.title,
    fields.description,
    fields.category,
    fields.problem,
    fields.proposedSolution,
    fields.expectedImpact,
    fields.body,
    fields.references,
  ].filter((value) => value.trim().length > 0).length;
  const completionPercent = Math.round((completedFields / 8) * 100);

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-8">
      {restoredDraft && !bannerDismissed ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#c8c0ae] bg-[#fbfaf7] px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-[#3f3a32]">
            <History
              size={16}
              aria-hidden="true"
              className="shrink-0 text-[#123c69]"
            />
            <span>
              Restored your unsaved draft from{" "}
              <span className="font-semibold">
                {formatRelativeTime(new Date(restoredDraft.savedAt), locale)}
              </span>
              {ml ? ". മാറ്റങ്ങൾ ഈ ഉപകരണത്തിൽ സ്വയമേവ സേവ് ചെയ്യും." : ". Changes autosave on this device."}
            </span>
          </p>
          <button
            type="button"
            onClick={discardDraft}
            className="flex h-8 items-center gap-1.5 rounded-md border border-[#c8c0ae] bg-white px-2.5 text-xs font-semibold text-[#2f2a22]"
          >
            <Trash2 size={14} aria-hidden="true" />
            {ml ? "ഡ്രാഫ്റ്റ് ഒഴിവാക്കുക" : "Discard draft"}
          </button>
        </div>
      ) : null}

      <section
        aria-label={ml ? "ഡ്രാഫ്റ്റ് പുരോഗതി" : "Draft progress"}
        className="rounded-lg border border-border bg-surface-raised p-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink-soft">
              {ml ? "നിങ്ങളുടെ ബിൽ ഡ്രാഫ്റ്റ്" : "Your bill draft"}
            </p>
            <p className="mt-0.5 text-sm text-ink-muted">
              {ml
                ? `${completedFields} / 8 പ്രധാന വിവരങ്ങൾ ചേർത്തു`
                : `${completedFields} of 8 key details added`}
            </p>
          </div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted" aria-live="polite">
            {draftStatus === "saving" ? (
              <Loader2 className="animate-spin text-accent" size={15} aria-hidden="true" />
            ) : (
              <CheckCircle2 className="text-success" size={15} aria-hidden="true" />
            )}
            {draftStatus === "saving"
              ? ml ? "സംരക്ഷിക്കുന്നു…" : "Saving…"
              : ml ? "ഈ ഉപകരണത്തിൽ സംരക്ഷിച്ചു" : "Saved on this device"}
          </p>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-surface"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={8}
          aria-valuenow={completedFields}
          aria-label={ml ? "ഡ്രാഫ്റ്റ് പൂർത്തീകരണം" : "Draft completion"}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </section>

      <section aria-label={ml ? "ഘട്ടം 1: AI ഉപയോഗിച്ച് ഡ്രാഫ്റ്റ്" : "Step 1: Draft with AI"}>
        <StepHeading
          number={1}
          title={ml ? "പ്രശ്നത്തിൽ നിന്ന് തുടങ്ങുക" : "Start with the problem"}
          subtitle={ml ? "പൊതു പ്രശ്നം നിങ്ങളുടെ വാക്കുകളിൽ വിവരിക്കുക. താഴെ മെച്ചപ്പെടുത്താവുന്ന ഒരു ബിൽ AI സഹായി തയ്യാറാക്കും." : "Describe the public problem in your own words. The AI assistant will draft a bill you can refine below."}
        />
        <AiDraftHelper
          title={fields.title || (ml ? "പുതിയ പൊതു ബിൽ" : "New public bill")}
          problem={fields.problem}
          onInsert={insertAiDraft}
          locale={locale}
        />
      </section>

      <section aria-label={ml ? "ഘട്ടം 2: പരിശോധിച്ച് സേവ് ചെയ്യുക" : "Step 2: Review and save"}>
        <StepHeading
          number={2}
          title={ml ? "പരിശോധിച്ച് മെച്ചപ്പെടുത്തുക" : "Review and refine"}
          subtitle={ml ? "തയ്യാറാക്കിയ ഡ്രാഫ്റ്റ് എഡിറ്റ് ചെയ്യുക, ആവശ്യമായ വിവരങ്ങൾ ചേർക്കുക, തുടർന്ന് സേവ് ചെയ്യുകയോ പ്രസിദ്ധീകരിക്കുകയോ ചെയ്യുക." : "Edit the generated draft, add the required details, then save or publish."}
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <FormSection title={ml ? "ബിൽ വിവരങ്ങൾ" : "Bill details"}>
              <div className="rounded-md border border-[#c9d9e8] bg-[#f4f8fb] p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm text-[#3f3a32]">
                    <Lightbulb
                      size={16}
                      aria-hidden="true"
                      className="shrink-0 text-[#123c69]"
                    />
                    {suggestionLabels.help}
                  </p>
                  <button
                    type="button"
                    onClick={suggestTitleAndCategory}
                    disabled={suggestionLoading}
                    className="flex h-9 items-center gap-1.5 rounded-md bg-[#123c69] px-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {suggestionLoading ? (
                      <Loader2
                        className="animate-spin"
                        size={14}
                        aria-hidden="true"
                      />
                    ) : (
                      <Lightbulb size={14} aria-hidden="true" />
                    )}
                    {suggestionLabels.button}
                  </button>
                </div>
                {suggestionError ? (
                  <p className="mt-3 text-sm text-[#8a3b12]" role="status">
                    {suggestionError}
                  </p>
                ) : null}
                {suggestion ? (
                  <div
                    className="mt-3 flex flex-wrap items-center gap-2"
                    role="status"
                  >
                    <span className="text-xs font-semibold text-[#3f3a32]">
                      {suggestionLabels.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateField("title", suggestion.title)}
                      className="rounded-full border border-[#123c69] bg-white px-3 py-1.5 text-xs font-semibold text-[#123c69]"
                    >
                      {suggestion.title} · {suggestionLabels.useTitle}
                    </button>
                    <span className="text-xs font-semibold text-[#3f3a32]">
                      {suggestionLabels.category}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateField("category", suggestion.category)
                      }
                      className="rounded-full border border-[#123c69] bg-white px-3 py-1.5 text-xs font-semibold text-[#123c69]"
                    >
                      {suggestion.category === OTHER_BILL_CATEGORY
                        ? "Other"
                        : suggestion.category}{" "}
                      · {suggestionLabels.useCategory}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuggestion(null)}
                      className="px-1 text-xs font-semibold text-[#6d6658] underline underline-offset-2"
                    >
                      {suggestionLabels.dismiss}
                    </button>
                  </div>
                ) : null}
              </div>
              <Field
                label={ml ? "തലക്കെട്ട്" : "Title"}
                name="title"
                placeholder={ml ? "കേരള പൊതു ആരോഗ്യ ഡാറ്റ സുതാര്യതാ ബിൽ" : "Kerala Public Health Data Transparency Bill"}
                value={fields.title}
                onChange={(value) => updateField("title", value)}
                error={state.errors?.title?.[0]}
              />
              <TextArea
                label={ml ? "ഹ്രസ്വ വിവരണം" : "Short description"}
                name="description"
                rows={3}
                placeholder={ml ? "ഈ ബിൽ ചെയ്യേണ്ടതിന്റെ ഹ്രസ്വ പൊതു സംഗ്രഹം." : "A short public summary of what this bill should do."}
                value={fields.description}
                onChange={(value) => updateField("description", value)}
                error={state.errors?.description?.[0]}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <CategorySelect
                  label={ml ? "വിഭാഗം" : "Category"}
                  name="category"
                  value={fields.category}
                  onChange={(value) => updateField("category", value)}
                  error={state.errors?.category?.[0]}
                />
                <Field
                  label={ml ? "ടാഗുകൾ" : "Tags"}
                  name="tags"
                  placeholder={ml ? "ആരോഗ്യം, ഡാറ്റ, ആശുപത്രികൾ" : "health, data, hospitals"}
                  value={fields.tags}
                  onChange={(value) => updateField("tags", value)}
                  error={state.errors?.tags?.[0]}
                />
              </div>
              {fields.category === OTHER_BILL_CATEGORY ? (
                <Field
                  label={ml ? "മറ്റു വിഭാഗം" : "Other category"}
                  name="categoryOther"
                  placeholder={ml ? "വകുപ്പോ വിഷയമോ നൽകുക" : "Enter the department or topic"}
                  value={fields.categoryOther}
                  onChange={(value) => updateField("categoryOther", value)}
                  error={state.errors?.categoryOther?.[0]}
                />
              ) : null}
            </FormSection>

            <FormSection title={ml ? "നയ ഉള്ളടക്കം" : "Policy content"}>
              <TextArea
                label={ml ? "പ്രശ്ന പ്രസ്താവന" : "Problem statement"}
                name="problem"
                rows={5}
                placeholder={ml ? "പൊതു പ്രശ്നം, ബാധിക്കപ്പെടുന്നവർ, നിയമനിർമ്മാണ ശ്രദ്ധ ആവശ്യമായ കാരണം എന്നിവ വിവരിക്കുക." : "Describe the public problem, who is affected, and why this needs legislative attention."}
                value={fields.problem}
                onChange={(value) => updateField("problem", value)}
                error={state.errors?.problem?.[0]}
              />
              <TextArea
                label={ml ? "നിർദേശിക്കുന്ന പരിഹാരം" : "Proposed solution"}
                name="proposedSolution"
                rows={5}
                placeholder={ml ? "ഇടപെടൽ, ബാധ്യതകൾ, അവകാശങ്ങൾ, ചുമതലകൾ, മാനദണ്ഡങ്ങൾ, റിപ്പോർട്ടിംഗ് ആവശ്യകതകൾ എന്നിവ വിവരിക്കുക." : "Describe the intervention, obligations, rights, duties, standards, or reporting requirements."}
                value={fields.proposedSolution}
                onChange={(value) => updateField("proposedSolution", value)}
                error={state.errors?.proposedSolution?.[0]}
              />
              <TextArea
                label={ml ? "പ്രതീക്ഷിക്കുന്ന പൊതു പ്രഭാവം" : "Expected public impact"}
                name="expectedImpact"
                rows={4}
                placeholder={ml ? "ജനങ്ങൾക്കും സ്ഥാപനങ്ങൾക്കും തദ്ദേശ സ്ഥാപനങ്ങൾക്കും ലഭിക്കേണ്ട ഗുണം വിശദീകരിക്കുക." : "Explain how people, institutions, or local bodies should benefit."}
                value={fields.expectedImpact}
                onChange={(value) => updateField("expectedImpact", value)}
                error={state.errors?.expectedImpact?.[0]}
              />
              <TextArea
                label={ml ? "ബിൽ ഡ്രാഫ്റ്റ് വാചകം" : "Draft bill text"}
                name="body"
                rows={10}
                placeholder={ml ? "വകുപ്പുകൾ ഇവിടെ ചേർക്കുക അല്ലെങ്കിൽ ഡ്രാഫ്റ്റ് ചെയ്യുക. ഈ ഭാഗം ഘടനയാക്കാൻ AI സഹായി പിന്നീട് സഹായിക്കും." : "Paste or draft clauses here. The AI assistant will later help structure this section."}
                value={fields.body}
                onChange={(value) => updateField("body", value)}
                error={state.errors?.body?.[0]}
              />
              <TextArea
                label={ml ? "അവലംബങ്ങളും അനുബന്ധ ലിങ്കുകളും" : "References and supporting links"}
                name="references"
                rows={4}
                placeholder={ml ? "ഈ ബില്ലിനെ പിന്തുണയ്ക്കുന്ന സ്രോതസ് ലിങ്കുകൾ, റിപ്പോർട്ടുകൾ, വാർത്തകൾ, സർക്കാർ പേജുകൾ, കുറിപ്പുകൾ എന്നിവ ചേർക്കുക." : "Add source links, reports, news articles, government pages, or notes that support this bill."}
                value={fields.references}
                onChange={(value) => updateField("references", value)}
                error={state.errors?.references?.[0]}
              />
            </FormSection>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-[#e4eef6] text-[#123c69]">
                  <FileText size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-semibold">{ml ? "ബിൽ സേവ് ചെയ്യുക" : "Save bill"}</h2>
                  <p className="text-sm text-[#6d6658]">
                    {ml ? "സ്വകാര്യമായി സൂക്ഷിക്കുകയോ ഉടൻ പ്രസിദ്ധീകരിക്കുകയോ ചെയ്യുക." : "Keep it private or publish immediately."}
                  </p>
                </div>
              </div>
              {state.message ? (
                <p className="mb-4 rounded-md bg-[#fff3d7] px-3 py-2 text-sm font-medium text-[#6b4e16]">
                  {state.message}
                </p>
              ) : null}
              <div className="space-y-2">
                <SubmitButton intent="draft" locale={locale} />
                <SubmitButton intent="publish" locale={locale} />
              </div>
              <p className="mt-3 text-xs leading-5 text-[#6d6658]">
                {ml ? "പ്രസിദ്ധീകരിക്കാൻ വിവരണം, പ്രശ്ന പ്രസ്താവന, നിർദേശിക്കുന്ന പരിഹാരം, ബിൽ ഡ്രാഫ്റ്റ് വാചകം എന്നിവ ആവശ്യമാണ്. സേവ് ചെയ്യാത്ത മാറ്റങ്ങൾ ഈ ഉപകരണത്തിൽ സ്വയമേവ സൂക്ഷിക്കും." : "Publishing requires a description, problem statement, proposed solution, and draft bill text. Unsaved changes are kept on this device automatically."}
              </p>
            </div>

            <LegalDisclaimer compact locale={locale} />
          </aside>
        </div>
      </section>
    </form>
  );
}

function StepHeading({
  number,
  title,
  subtitle,
}: {
  number: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#123c69] text-sm font-semibold text-white">
        {number}
      </span>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-0.5 max-w-2xl text-sm leading-6 text-[#6d6658]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function SubmitButton({ intent, locale }: { intent: "draft" | "publish"; locale: Locale }) {
  const { pending } = useFormStatus();
  const isPublish = intent === "publish";

  return (
    <button
      type="submit"
      name="intent"
      value={intent}
      className={`flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-70 ${
        isPublish
          ? "bg-[#123c69] text-white"
          : "border border-[#c8c0ae] bg-white text-[#2f2a22]"
      }`}
      disabled={pending}
    >
      {isPublish ? (
        <Send size={17} aria-hidden="true" />
      ) : (
        <Save size={17} aria-hidden="true" />
      )}
      {pending
        ? isPublish
          ? locale === "ml" ? "പ്രസിദ്ധീകരിക്കുന്നു" : "Publishing"
          : locale === "ml" ? "ഡ്രാഫ്റ്റ് സേവ് ചെയ്യുന്നു" : "Saving draft"
        : isPublish
          ? locale === "ml" ? "സേവ് ചെയ്ത് പ്രസിദ്ധീകരിക്കുക" : "Save and publish"
          : locale === "ml" ? "ഡ്രാഫ്റ്റ് സേവ് ചെയ്യുക" : "Save draft"}
    </button>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#d8d2c4] bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function CategorySelect({
  label,
  name,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#3f3a32]">{label}</span>
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-[#c8c0ae] bg-white px-3 text-sm outline-none focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/15"
      >
        <option value="">Select category</option>
        {billCategories.map((category) => (
          <option key={category} value={category}>
            {category === OTHER_BILL_CATEGORY ? "Other" : category}
          </option>
        ))}
      </select>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </label>
  );
}

function Field({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  onChange?: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#3f3a32]">{label}</span>
      <input
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-[#c8c0ae] bg-white px-3 text-sm outline-none focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/15"
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </label>
  );
}

function TextArea({
  label,
  name,
  rows,
  placeholder,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  rows: number;
  placeholder: string;
  value: string;
  onChange?: (value: string) => void;
  error?: string;
}) {
  const snippets =
    name === "body"
      ? [
          {
            label: "Section",
            value: "\n\n## Section title\n\nDraft the section text here.",
          },
          {
            label: "Clause",
            value: "\n\n1. Clause heading\n   Clause text here.",
          },
          {
            label: "Note",
            value: "\n\nNote: Add drafting note or reference here.",
          },
        ]
      : [];

  return (
    <div className="block">
      <span className="flex items-center justify-between gap-3">
        <label htmlFor={name} className="text-sm font-semibold text-[#3f3a32]">
          {label}
        </label>
        {snippets.length > 0 ? (
          <span className="flex gap-1">
            {snippets.map((snippet) => (
              <button
                key={snippet.label}
                type="button"
                onClick={() => onChange?.(`${value}${snippet.value}`)}
                className="rounded-md border border-[#c8c0ae] bg-white px-2 py-1 text-xs font-semibold text-[#2f2a22]"
              >
                {snippet.label}
              </button>
            ))}
          </span>
        ) : null}
      </span>
      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="mt-2 w-full resize-y rounded-md border border-[#c8c0ae] bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/15"
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-sm font-medium text-[#a33a2a]">{children}</p>;
}
