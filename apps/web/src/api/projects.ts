import type { Project } from "../types";
import { fail, ok } from "./client";
import { store } from "./store";

export function listProjects(): Promise<Project[]> {
  return ok(store.projects);
}

export async function getProject(id: number): Promise<Project> {
  const project = store.projects.find((candidate) => candidate.id === id);
  return project ? ok(project) : fail(404, `No project with id ${id}`);
}
