import type {Locale} from "@/lib/i18n/config";
import type {
  LocalizedText,
  PageSection,
  PageSnapshot,
  ProductDraftContent,
  RichTextDocument,
} from "./types";

export function localizeText(value: LocalizedText, locale: Locale) {
  if (locale === "en" && value.en?.trim()) return value.en;
  return value.it;
}

export function localizeRichText(
  value: Record<Locale, RichTextDocument>,
  locale: Locale,
) {
  if (locale === "en" && value.en.content.length) return value.en;
  return value.it;
}

export function localizeProductDraft(
  content: ProductDraftContent,
  locale: Locale,
) {
  const translation = locale === "en" ? content.translations.en : undefined;
  return {
    ...content,
    name: translation?.name.trim() || content.name,
    eyebrow: translation?.eyebrow.trim() || content.eyebrow,
    description: translation?.description.trim() || content.description,
  };
}

export function visibleSections(snapshot: PageSnapshot): PageSection[] {
  return snapshot.sections.filter((section) => !section.hidden);
}
