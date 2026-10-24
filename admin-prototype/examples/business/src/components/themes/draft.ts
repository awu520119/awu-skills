import type { ThemeDraft, ThemeFormValues } from '../../mock/themes';
import { themeTypes } from '../../mock/themes';

const draftKey = 'admin-prototype-theme-draft-v1';
const textFields = [
  'name',
  'spot',
  'route',
  'people',
  'cover',
  'description',
  'guide',
  'packageName',
] as const;

// Local storage may be unavailable, stale or edited. Never pass an unchecked object to Form.
export function loadThemeDraft(): ThemeDraft | null {
  try {
    const raw = localStorage.getItem(draftKey);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (
      !draft ||
      !themeTypes.includes(draft.type) ||
      !draft.values ||
      typeof draft.values !== 'object' ||
      Array.isArray(draft.values)
    )
      return null;
    const values: Partial<ThemeFormValues> = {};
    for (const field of textFields) {
      if (typeof draft.values[field] === 'string') values[field] = draft.values[field];
    }
    for (const field of ['price', 'original'] as const) {
      if (typeof draft.values[field] === 'number' && Number.isFinite(draft.values[field]))
        values[field] = draft.values[field];
    }
    if (Array.isArray(draft.values.tags))
      values.tags = draft.values.tags.filter((tag: unknown) => typeof tag === 'string');
    return {
      values,
      type: draft.type,
      editing: Number.isSafeInteger(draft.editing) ? draft.editing : null,
    };
  } catch {
    return null;
  }
}

export function saveThemeDraft(draft: ThemeDraft): boolean {
  try {
    localStorage.setItem(draftKey, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearThemeDraft(): void {
  try {
    localStorage.removeItem(draftKey);
  } catch {
    /* A completed submission does not depend on local storage. */
  }
}
