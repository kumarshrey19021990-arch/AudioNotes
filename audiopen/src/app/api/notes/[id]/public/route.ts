import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOwnerKeyFromRequest } from "@/lib/owner";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

const BodySchema = z.object({
  isPublic: z.boolean(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const ownerKey = getOwnerKeyFromRequest(req);
  const body = BodySchema.parse(await req.json());

  const existing = await prisma().note.findFirst({
    where: { id, ownerKey },
    select: { id: true, shareId: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const shareId = body.isPublic ? existing.shareId ?? nanoid(12) : null;

  const updated = await prisma().note.update({
    where: { id },
    data: { isPublic: body.isPublic, shareId },
    select: { isPublic: true, shareId: true },
  });

  return NextResponse.json(updated);
}

