export interface Presence {
  state: "online" | "offline";
  last_changed: string;
}

export type PresenceState = Record<string, Presence>;
