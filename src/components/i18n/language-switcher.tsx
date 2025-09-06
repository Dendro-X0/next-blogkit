"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import i18nConfig from "@/i18n/config";
import setLocale from "@/i18n/set-locale";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { type ReactElement, useTransition } from "react";

/**
 * LanguageSwitcher renders a compact locale selector and persists the
 * selection in a cookie via a Server Action. No i18n routing required.
 * @returns A select control to switch UI language.
 */
export default function LanguageSwitcher(): ReactElement {
  const router = useRouter();
  const current = useLocale() as (typeof i18nConfig)["locales"][number];
  const [isPending, startTransition] = useTransition();
  const handleChange = (value: string): void => {
    const allowed = i18nConfig.locales as readonly string[];
    const next = (
      allowed.includes(value) ? value : i18nConfig.defaultLocale
    ) as (typeof i18nConfig)["locales"][number];
    const fd = new FormData();
    fd.append("locale", next);
    startTransition(async () => {
      await setLocale(fd);
      router.refresh();
    });
  };

  return (
    <Select value={current} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger size="sm" aria-label="Language">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="de">Deutsch</SelectItem>
        <SelectItem value="es">Español</SelectItem>
        <SelectItem value="fr">Français</SelectItem>
        <SelectItem value="it">Italiano</SelectItem>
        <SelectItem value="ja">日本語</SelectItem>
        <SelectItem value="ko">한국어</SelectItem>
        <SelectItem value="pt">Português</SelectItem>
        <SelectItem value="ru">Русский</SelectItem>
        <SelectItem value="zh">中文</SelectItem>
      </SelectContent>
    </Select>
  );
}
