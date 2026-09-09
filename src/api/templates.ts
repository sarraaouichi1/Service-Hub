import type { CountryTemplate, TemplateDraft } from "../types";
import { fail, ok } from "./client";
import { nextId, store } from "./store";

export function listTemplates(): Promise<CountryTemplate[]> {
  return ok(store.templates);
}

export async function createTemplate(draft: TemplateDraft): Promise<CountryTemplate> {
  if (!draft.title.trim()) return fail(422, "A title is required", { title: "A title is required" });
  const template: CountryTemplate = { ...draft, id: nextId(store.templates), projects: 0 };
  store.templates.push(template);
  return ok(template);
}

export async function updateTemplate(id: number, patch: Partial<CountryTemplate>): Promise<CountryTemplate> {
  const index = store.templates.findIndex((template) => template.id === id);
  if (index === -1) return fail(404, `No template with id ${id}`);
  store.templates[index] = { ...store.templates[index], ...patch, id };
  return ok(store.templates[index]);
}

export async function deleteTemplate(id: number): Promise<void> {
  const index = store.templates.findIndex((template) => template.id === id);
  if (index === -1) return fail(404, `No template with id ${id}`);
  store.templates.splice(index, 1);
  await ok(null);
}
