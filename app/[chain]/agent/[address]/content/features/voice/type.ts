export const genders = ["male", "female", "non-binary"] as const;
export type Gender = (typeof genders)[number];
export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description: null;
  preview_url: string;
  labels: {
    accent: string;
    description: string;
    age: string;
    gender: Gender;
  };
}
