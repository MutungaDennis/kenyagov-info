export const NOTICE_RELATIONSHIP_TYPES = ["corrects","amends","revokes","partially_revokes","supersedes","replaces","extends","varies","references","reappoints"] as const;
export const PERSON_RELATIONSHIP_TYPES = ["appointing_authority","appointee","reappointee","nominee","elected_person","removed_official","committee_member","chairperson","signatory","issuer","affected_person","mentioned_person"] as const;
export const INSTITUTION_RELATIONSHIP_TYPES = ["subject_institution","appointing_institution","issuing_authority","employer","committee","regulator","regulated_entity","supervising_institution","affected_institution","mentioned_institution"] as const;
export const REVIEW_STATUSES = ["Not reviewed","Partially linked","Reviewed","Needs attention"] as const;

export const relationLabel = (v:string) => v.replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());

export const forwardNoticeRelationLabel = (v:string) => ({
  corrects:"Corrects",amends:"Amends",revokes:"Revokes",partially_revokes:"Partially revokes",
  supersedes:"Supersedes",replaces:"Replaces",extends:"Extends",varies:"Varies",
  references:"References",reappoints:"Reappoints"
} as Record<string,string>)[v] || relationLabel(v);

export const inverseNoticeRelationLabel = (v:string) => ({
  corrects:"Corrected by",amends:"Amended by",revokes:"Revoked by",partially_revokes:"Partially revoked by",
  supersedes:"Superseded by",replaces:"Replaced by",extends:"Extended by",varies:"Varied by",
  references:"Referenced by",reappoints:"Reappointment recorded by"
} as Record<string,string>)[v] || `Related by ${relationLabel(v)}`;
