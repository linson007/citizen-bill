import { cookies } from "next/headers";

import { LOCALE_COOKIE, parseLocale, type Locale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}

export async function getRequestMessages() {
  const locale = await getRequestLocale();
  return { locale, t: getMessages(locale) };
}
