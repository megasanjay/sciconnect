export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const { user } = session;
  const userId = user.id;

  const { collectionid, workspaceid } = event.context.params as {
    collectionid: string;
    workspaceid: string;
  };

  // Check if the user is part of the workspace
  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId: workspaceid,
    },
  });

  if (!workspaceMember) {
    throw createError({
      message: "Unauthorized",
      statusCode: 401,
    });
  }

  const collectionId = parseInt(collectionid);

  // Check if the collection exists in the workspace
  const collection = await prisma.collection.findUnique({
    where: {
      id: collectionId,
      workspaceId: workspaceid,
    },
  });

  if (!collection) {
    throw createError({
      message: "Collection not found",
      statusCode: 404,
    });
  }

  return collectionId;
});
