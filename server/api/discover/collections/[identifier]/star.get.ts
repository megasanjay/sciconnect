export default defineEventHandler(async (event) => {
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

  const returnData = {
    starCount: 0,
    starred: false,
    statusCode: 0,
  };

  const count = await prisma.starred.count({
    where: {
      collectionId,
    },
  });

  returnData.starCount = count;
  returnData.statusCode = 200;

  const session = await getUserSession(event);
  const user = session?.user;

  if (user) {
    const userId = user?.id as string;

    const starredData = await prisma.starred.findFirst({
      where: {
        collectionId,
        userId,
      },
    });

    if (starredData) {
      returnData.starred = true;
    }
  }

  return returnData;
});
