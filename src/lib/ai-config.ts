export const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

type OpenAiModelEnv = {
  OPENAI_MODEL?: string;
  [key: string]: string | undefined;
};

export function getOpenAiModel(env: OpenAiModelEnv = process.env) {
  const configuredModel = env.OPENAI_MODEL?.trim();

  return configuredModel || DEFAULT_OPENAI_MODEL;
}
