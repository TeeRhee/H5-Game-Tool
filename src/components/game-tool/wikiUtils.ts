export type WikiVisualState = "default" | "hover" | "active" | "selected";

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
