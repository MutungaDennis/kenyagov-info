export const PROCEEDING_TYPES = {
  "house-proceeding": "House proceedings",
  "joint-sitting": "Joint sittings",
  "state-opening": "State opening sittings",
  "committee-proceeding": "Committee proceedings (restricted)",
  "bound-volume": "Sessional bound volumes (restricted)",
} as const;
export type ProceedingType = keyof typeof PROCEEDING_TYPES;
export const PUBLIC_PROCEEDINGS: ProceedingType[] = ["house-proceeding", "joint-sitting", "state-opening"];
export const REPOSITORY_COMMUNITIES = [
  { id: "2fa15201-cbe0-4290-9fcb-eed7ffb03c9b", type: "house-proceeding", public: true },
  { id: "1653b0ba-1c30-45fa-be00-98afccf14b49", type: "committee-proceeding", public: false },
  { id: "5e16943d-6a47-4935-8224-bd443a2c93dd", type: "joint-sitting", public: true },
  { id: "22ba6910-3b34-4d7e-a6c5-bd78e25568e2", type: "state-opening", public: true },
  { id: "ab0cdf0a-fcf7-4fec-b07c-63d4d122b379", type: "bound-volume", public: false },
] as const;
