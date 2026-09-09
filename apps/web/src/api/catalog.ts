import type { ProductDefinition, Psp } from "../types";
import { PRODUCTS } from "../data/products";
import { PSP_LIST } from "../data/psps";
import { ok } from "./client";

/**
 * Reference data the wizard offers as choices. Read-only here: it is
 * configured by S&B rather than by anyone using the hub.
 */

export function listProducts(): Promise<ProductDefinition[]> {
  return ok(PRODUCTS);
}

export function listPsps(): Promise<Psp[]> {
  return ok(PSP_LIST);
}
