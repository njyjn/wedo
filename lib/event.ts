import "server-only";
import { cache } from "react";
import prisma from "@/lib/prisma";

/** The event named by the defaultEventId setting, or null. Cached per request. */
export const getDefaultEvent = cache(async (defaultEventId: string) => {
  const id = Number.parseInt(defaultEventId, 10);
  if (!Number.isSafeInteger(id)) return null;
  return prisma.event.findUnique({
    where: { id },
    select: { startTime: true, location: true, sublocation: true },
  });
});
