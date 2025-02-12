export default defineEventHandler(async (event) => {
  const { workspaceid } = event.context.params as { workspaceid: string };

  // Check if the workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceid,
    },
  });

  if (!workspace) {
    throw createError({
      message: "Workspace not found",
      statusCode: 404,
    });
  }

  return workspaceid;
});
