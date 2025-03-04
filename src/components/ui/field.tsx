import { AnyFieldApi } from "@tanstack/react-form";

export function isFieldInvalid(field: AnyFieldApi) {
  return field.state.meta.isTouched && field.state.meta.errors.length;
}

export function buildFieldErrorId(field: AnyFieldApi) {
  return `error-${field.name}`;
}

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  return isFieldInvalid(field) ? (
    <span
      id={buildFieldErrorId(field)}
      className="text-sm font-medium text-destructive"
    >
      {field.state.meta.errors.map((err) => err.message).join(",")}
    </span>
  ) : null;
}

FieldInfo.displayName = "FieldInfo";
