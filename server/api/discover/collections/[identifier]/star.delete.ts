export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const { user } = session;
  const userId = user.id;

  const { identifier } = event.context.params as {
    identifier: string;
  };

  // Only collection identifiers are allowed
  const regex = /^[c][a-zA-Z0-9-_]{8,9}$/;

  if (!regex.test(identifier)) {
    throw createError({
      message: "Invalid identifier",
      statusCode: 400,
    });
  }

  const collectionId = parseInt(identifier.slice(1));

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId, private: false },
  });

  if (!collection) {
    throw createError({
      message: "Collection not found",
      statusCode: 404,
    });
  }

  const starred = await prisma.starred.findFirst({
    where: {
      collectionId,
      userId,
    },
  });

  if (!starred) {
    throw createError({
      message: "Star not found",
      statusCode: 404,
    });
  }

  await prisma.starred.delete({
    where: {
      userId_collectionId: {
        collectionId,
        userId,
      },
    },
  });

  return {
    statusCode: 200,
  };
});
