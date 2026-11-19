import { PRODUCT_REQUIRED_FIELDS } from "@service-hub/shared";
import type { FormTextKey, ProductId } from "../../../../types";

/**
 * Whether a product's onboarding sheet marks a field required, so the label
 * gets its asterisk. The schema enforces the same list (`crossStepChecks`) —
 * this only decides what to draw.
 */
export function requiredBy(product: ProductId) {
  const keys = new Set((PRODUCT_REQUIRED_FIELDS[product] ?? []).map((f) => f.key));
  return (key: FormTextKey) => keys.has(key);
}
