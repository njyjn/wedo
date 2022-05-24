import { Feature } from ".prisma/client";

export const getFeature = (name: string, features: Feature[]) => {
  return Array.isArray(features)
    ? features.find((f) => f.name == name).value || ""
    : "";
};
