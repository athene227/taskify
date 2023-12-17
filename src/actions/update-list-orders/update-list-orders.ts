"use server";

import { auth } from "@clerk/nextjs";

import { db } from "@/lib/db";
import { List } from "@/types/types";

type Props = {
  lists: List[];
};

const updateListOrders = async ({ lists }: Props) => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "Unauthorized",
    };
  }

  try {
    const transaction = lists.map((list) =>
      db.list.update({
        where: {
          id: list.id,
          board: {
            orgId,
          },
        },
        data: {
          order: list.order,
        },
      }),
    );

    const updatedLists = await db.$transaction(transaction);

    return updatedLists;
  } catch (error) {
    return {
      error: "Failed to reorder lists.",
    };
  }
};

export { updateListOrders };
