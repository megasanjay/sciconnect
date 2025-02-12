import collectionExists from "~/server/utils/collection/collectionExists";
import workspacePermission from "~/server/utils/workspace/workspacePermission";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const { user } = session;
  const userId = user.id;

  // Check if the collection exists in the workspace
  const collectionId = await collectionExists(event);

  const { workspaceid } = event.context.params as {
    workspaceid: string;
  };

  // workspace admins also have collection admin permission by default
  const { permission } = await workspacePermission(workspaceid, userId);

  if (permission === "admin" || permission === "owner") {
    return true;
  }

  // Check access table for the workspace
  const collectionAccess = await prisma.collectionAccess.findFirst({
    where: {
      collectionId,
      userId,
    },
  });

  if (!collectionAccess) {
    throw createError({
      message: "Unauthorized - No collection access found",
      statusCode: 401,
    });
  }

  // Check if the user has at least admin permisison
  if (
    collectionAccess?.role !== "admin" &&
    collectionAccess?.role !== "editor"
  ) {
    throw createError({
      message: "Unauthorized",
      statusCode: 401,
    });
  }

  return true;
});
