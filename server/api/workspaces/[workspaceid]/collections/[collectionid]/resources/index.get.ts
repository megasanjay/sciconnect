import collectionMinEditorPermission from "~/server/utils/collection/collectionMinEditorPermission";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  await collectionMinEditorPermission(event);

  const { collectionid, workspaceid } = event.context.params as {
    collectionid: string;
    workspaceid: string;
  };

  const collectionId = parseInt(collectionid);

  const { resourceid } = getQuery(event);

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId, workspaceId: workspaceid },
  });

  if (!collection) {
    throw createError({
      message: "Collection not found",
      statusCode: 404,
    });
  }

  // get all the versions for the collection
  const versions = await prisma.version.findMany({
    where: {
      collectionId,
    },
  });

  const response: ResourcesList = [];

  const allResources = [];
  const allResourceIds = [];

  const updatedResources = [];

  // get the resources for each version
  for (const version of versions) {
    const resources = await prisma.resource.findMany({
      where: {
        versions: {
          some: {
            id: version.id,
          },
        },
      },
    });

    for (const resource of resources) {
      if (resource.originalResourceId) {
        // if the resource is an update, add it to the updatedResources list
        if (resource.action === "update") {
          updatedResources.push(resource);
        }

        continue;
      }

      if (resourceid && resource.id === resourceid) {
        continue;
      }

      if (
        resource.action &&
        (resource.action === "delete" || resource.action === "oldVersion")
      ) {
        continue;
      }

      allResources.push({
        ...resource,
        versionName: version.name,
      });
      allResourceIds.push(resource.id);
    }
  }

  for (const resource of updatedResources) {
    // find the original resource
    const originalResource = allResources.find(
      (r) => r.id === resource.originalResourceId,
    );

    if (!originalResource) {
      continue;
    }

    // TODO: Fix this
    // Update the original resource with the updated resource data
    // originalResource.title = resource.title;
    // originalResource.version_label = resource.version_label;
    // originalResource.action = resource.action;
  }

  // Get a unique list of all the resource ids keeping the order of the first occurrence that is not the draft version
  const uniqueResourceIds = allResourceIds.filter(
    (value, index, self) => self.indexOf(value) === index,
  );

  // Remove the resources that are not in the collection
  const filteredResources = allResources.filter((resource) =>
    uniqueResourceIds.includes(resource.id),
  );

  // sort the resources by the version name in descending order
  filteredResources.sort((a, b) => {
    if (a.versionName < b.versionName) {
      return 1;
    }
    if (a.versionName > b.versionName) {
      return -1;
    }

    return 0;
  });

  // remove earlier versions of the same resource
  const seen = new Set();
  const resources = filteredResources.filter((resource) => {
    const duplicate = seen.has(resource.id);

    seen.add(resource.id);

    return !duplicate;
  });

  let currentResource = null;

  if (resourceid) {
    currentResource = await prisma.resource.findUnique({
      where: {
        id: resourceid as string,
      },
    });

    if (!currentResource) {
      throw createError({
        message: "Resource not found",
        statusCode: 404,
      });
    }
  }

  for (const resource of resources) {
    const item = {
      disabled:
        !!(
          currentResource &&
          "original_resource_id" in currentResource &&
          currentResource.original_resource_id === resource.id
        ) ||
        (resource.action && resource.action === "delete"),
      label: resource.title,
      latestCollectionVersionName: resource.versionName,
      orignalResourceId:
        "original_resource_id" in resource
          ? resource.original_resource_id
          : null,
      value: resource.id,
      versionLabel: resource.versionLabel,
    };

    response.push(item);
  }

  return response;
});
