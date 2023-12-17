"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

import { db } from "@/lib/db";
import { createAuditLog } from "@/actions/create-audit-log/create-audit-log";

type Props = {
  cardId: string;
  boardId: string;
  title?: string;
  description?: string;
};

const updateCard = async ({ cardId, boardId, title, description }: Props) => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  try {
    const card = await db.card.update({
      where: {
        id: cardId,
        list: {
          board: {
            orgId,
          },
        },
      },
      data: {
        title,
        description,
      },
    });

    await createAuditLog({
      entityTitle: card.title,
      entityId: card.id,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.UPDATE,
    });

    revalidatePath(`/board/${boardId}`);
    return card;
  } catch (error) {
    return {
      error: "Failed to update.",
    };
  }
};

export { updateCard };
