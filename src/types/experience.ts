import type { ExperienceType } from "@/experiences/registry";

export type { ExperienceType };

/** A stored experience, as the server sees it. */
export type Experience = {
  id: string;
  slug: string;
  type: ExperienceType;
  senderName: string;
  recipientName: string;
  message: string | null;
  createdAt: string;
  updatedAt: string;
};

/** The fields a creator supplies. */
export type NewExperience = Pick<
  Experience,
  "type" | "senderName" | "recipientName" | "message"
>;

/** What the public recipient page is allowed to see — no id, no timestamps. */
export type PublicExperience = Pick<
  Experience,
  "slug" | "type" | "senderName" | "recipientName" | "message"
>;
