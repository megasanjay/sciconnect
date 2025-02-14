export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const { user } = session;
  const userId = user.id;

  const { identifier } = event.context.params as {
    identifier: string;
  };

  // Only collection identifiers are allowed
  const regex = /^[c]\d+/;

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

  if (starred) {
    return {
      statusCode: 200,
    };
  }

  await prisma.starred.create({
    data: {
      collectionId,
      userId,
    },
  });

  return {
    statusCode: 200,
  };
});
