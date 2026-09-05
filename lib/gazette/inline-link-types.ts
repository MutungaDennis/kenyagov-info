export const INLINE_PERSON_SEMANTIC_ROLES = [
  "establishing_authority",
  "exercising_authority",
  "appointing_authority",
  "revoking_authority",
  "approving_authority",
  "signatory",
  "issuer",
  "appointee",
  "committee_member",
  "chairperson",
  "affected_person",
  "mentioned_person",
] as const;

export const INLINE_INSTITUTION_SEMANTIC_ROLES = [
  "subject_institution",
  "established_institution",
  "issuing_authority",
  "supervisory_institution",
  "appointing_institution",
  "regulator",
  "regulated_entity",
  "affected_institution",
  "mentioned_institution",
] as const;

export const inlineRoleLabel = (value: string) =>
  value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
