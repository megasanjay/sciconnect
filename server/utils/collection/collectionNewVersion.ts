import { createId } from "@paralleldrive/cuid2";

/**
 * Create a new unpublished draft version of a collection
 * @param collectionId - The id of the collection to create a new version for
 */

export default async function (collectionId: number) {
  // get the latest version of the collection

  const latestVersion = await prisma.version.findFirst({
    include: {
      ExternalRelation: true,
      InternalRelation: true,
      Resource: true,
    },
    orderBy: { created: "desc" },
    where: { collectionId },
  });

  if (!latestVersion) {
    const draftVersion = await prisma.version.create({
      data: {
        name: "Draft",
        changelog: "xxx",
        collectionId,
      },
    });

    return {
      statusCode: 201,
      version: draftVersion,
    };
  }

  // if the latest version is published clone it into a draft version
  if (latestVersion.published) {
    // Check for other unpublished versions - sanity check
    const unpublishedVersions = await prisma.version.findMany({
      where: {
        collectionId,
        published: false,
      },
    });

    if (unpublishedVersions.length > 0) {
      throw createError({
        message: "There are multiple unpublished versions of this collection",
        statusCode: 422,
      });
    }

    // Get all the resources in the latest version
    const originalResources = latestVersion.Resource;
    const originalExternalRelations = latestVersion.ExternalRelation;
    const originalInternalRelations = latestVersion.InternalRelation;

    // clone each resource;
    const clonedResources = originalResources.map((resource) => {
      return {
        id: createId(),
        title: resource.title,
        action: "clone",
        backLinkId: resource.backLinkId, // todo: check if this is correct
        description: resource.description,
        filledIn: true,
        identifier: resource.identifier,
        identifierType: resource.identifierType,
        originalResourceId: resource.id,
        resourceType: resource.resourceType,
        versionLabel: resource.versionLabel,
      };
    });

    const clonedExternalRelations = originalExternalRelations.map(
      (externalRelation) => {
        const externalRelationClonedSourceResource = clonedResources.find(
          (resource) =>
            resource.originalResourceId === externalRelation.sourceId,
        );

        // todo: what to do if this is not found?
        // This should never happen but we probably need some thing here regardless
        const externalRelationClonedSourceResourceId =
          externalRelationClonedSourceResource?.id as string;

        return {
          id: createId(),
          action: "clone",
          original_relation_id: externalRelation.id,
          resourceType: externalRelation.resourceType || null,
          sourceId: externalRelationClonedSourceResourceId,
          target: externalRelation.target,
          target_type: externalRelation.target_type,
          type: externalRelation.type,
        };
      },
    );

    const clonedInternalRelations = originalInternalRelations.map(
      (internalRelation) => {
        const internalRelationClonedSourceResource = clonedResources.find(
          (resource) =>
            resource.originalResourceId === internalRelation.sourceId,
        );

        const internalRelationClonedSourceResourceId =
          internalRelationClonedSourceResource?.id as string;

        return {
          id: createId(),
          action: "clone",
          mirror: internalRelation.mirror,
          original_relation_id: internalRelation.id,
          resourceType: internalRelation.resourceType,
          sourceId: internalRelationClonedSourceResourceId,
          targetId: internalRelation.targetId,
          type: internalRelation.type,
        };
      },
    );

    const draftVersion = await prisma.version.create({
      data: {
        name: "Draft",
        changelog: "xxx",
        collectionId,
      },
    });

    const clonedResourcesTransaction = prisma.version.update({
      data: {
        Resource: {
          create: clonedResources.map((resource) => {
            return {
              ...resource,
            };
          }),
        },
      },
      where: {
        id: draftVersion.id,
      },
    });

    const clonedRelationsTransaction = prisma.version.update({
      data: {
        ExternalRelation: {
          create: clonedExternalRelations.map((externalRelation) => {
            return {
              ...externalRelation,
            };
          }),
        },
        InternalRelation: {
          create: clonedInternalRelations.map((internalRelation) => {
            return {
              ...internalRelation,
            };
          }),
        },
      },
      where: {
        id: draftVersion.id,
      },
    });

    await prisma.$transaction([
      clonedResourcesTransaction,
      clonedRelationsTransaction,
    ]);

    return {
      statusCode: 201,
      version: draftVersion,
    };
  }

  // if there is a draft version, return it
  return {
    statusCode: 200,
    version: latestVersion,
  };
}
