export type EffectDefinition = {
  id: string;
  label: string;
  filename: string;
};

export const EFFECTS: EffectDefinition[] = [
  { id: "zoom", label: "Zoom", filename: "zoom.gif" },
  { id: "wiggle", label: "Wiggle", filename: "wiggle.gif" },
];
