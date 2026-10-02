/**
 * The catalogue of experience types. Adding a new occasion means:
 *   1. add it to EXPERIENCE_TYPES and `experienceRegistry` below,
 *   2. widen the `experiences_type_check` constraint in a new migration,
 *   3. add its UI under src/experiences/<type>/.
 * The creator API, validation and database layer stay unchanged.
 */
export const EXPERIENCE_TYPES = ["valentine"] as const;

export type ExperienceType = (typeof EXPERIENCE_TYPES)[number];

export type ExperienceDefinition = {
  type: ExperienceType;
  /** Human-readable name, e.g. for share titles. */
  label: string;
  /** Shown on the message card when the creator leaves the note empty. */
  defaultMessage: string;
};

export const experienceRegistry: Record<ExperienceType, ExperienceDefinition> =
  {
    valentine: {
      type: "valentine",
      label: "Valentine",
      defaultMessage: "I've been wanting to ask you this for a while.",
    },
  };

export function isExperienceType(value: unknown): value is ExperienceType {
  return (
    typeof value === "string" &&
    (EXPERIENCE_TYPES as readonly string[]).includes(value)
  );
}
