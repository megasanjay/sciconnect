<script setup lang="ts">
import RESOURCE_TYPE_JSON from "@/assets/json/resource-type.json";

definePageMeta({
  layout: "app-layout",
  middleware: ["auth"],
});

const toast = useToast();
const route = useRoute();

const resourceTypeOptions = RESOURCE_TYPE_JSON;

const { collectionid, workspaceid } = route.params as {
  collectionid: string;
  workspaceid: string;
};

const { data: collection, error } = await useFetch<CollectionGETAPIResponse>(
  `/api/workspaces/${workspaceid}/collections/${collectionid}`,
  {
    headers: useRequestHeaders(["cookie"]),
  },
);

if (error.value) {
  console.log(error.value);

  toast.add({
    title: "Something went wrong",
    color: "error",
    description: "We couldn't load your collectionss",
    icon: "material-symbols:error",
  });

  navigateTo(`/dashboard/workspaces/${workspaceid}`);
}

const { collectionPermissionAbility, collectionPermissionGetLoading } =
  await useCollectionPermission(workspaceid, collectionid);

const selectIcon = (type: string) => {
  const resourceType = resourceTypeOptions.find(
    (resourceType) => resourceType.value === type,
  );

  if (resourceType) {
    return resourceType.icon;
  }

  return "mdi:file-question";
};
</script>

<template>
  <main class="h-screen overflow-auto bg-zinc-50">
    <div class="flex h-36 items-center border-b border-gray-200 bg-white">
      <div
        class="mx-auto flex w-full max-w-screen-xl items-center justify-between px-2 lg:px-20"
      >
        <div class="flex items-center space-x-2">
          <h1 class="text-4xl font-black">Resources</h1>
        </div>
      </div>
    </div>

    <div class="mx-auto w-full max-w-screen-xl px-2.5 pb-10 lg:px-20">
      <div class="flex items-center justify-between gap-4 py-10">
        <UInput
          placeholder="Search..."
          icon="iconamoon:search-duotone"
          size="lg"
          type="search"
        />

        <UButton
          color="primary"
          icon="mdi:plus"
          size="lg"
          :disabled="
            !collection?.version ||
            collection?.version?.published ||
            !collectionPermissionAbility.includes('edit') ||
            collectionPermissionGetLoading
          "
          :to="`/dashboard/workspaces/${workspaceid}/collections/${collection?.id}/resources/new`"
        >
          <span class="w-max"> Add a new resource </span>
        </UButton>
      </div>

      <div
        v-if="collection?.version === null"
        class="rounded-lg border border-dashed px-4 py-8"
      >
        <n-empty size="large" description="No resources found"> </n-empty>
      </div>

      <div
        v-if="collection?.version && collection?.resources"
        class="flex flex-col gap-4"
      >
        <NuxtLink
          v-for="resource in collection?.resources"
          :key="resource.id"
          :to="
            resource.action === 'delete' || resource.action === 'oldVersion'
              ? ''
              : `/dashboard/workspaces/${workspaceid}/collections/${collection?.id}/resources/${resource.id}`
          "
          class="flex w-full flex-grow flex-col rounded-md border px-6 pt-6 shadow-sm transition-all hover:shadow-md"
          :class="{
            'cursor-not-allowed border-red-300 bg-red-50 !shadow-none':
              resource.action === 'delete' || resource.action === 'oldVersion',
            'border-slate-300 bg-white':
              !resource.action || resource.action === 'clone',
            'border-blue-300 bg-cyan-50/20': resource.action === 'create',
            'border-emerald-400 bg-emerald-50/20': resource.action === 'update',
            'border-cyan-400 bg-cyan-50/20': resource.action === 'newVersion',
            'border-red-600 bg-white': resource.filledIn === false,
          }"
        >
          <div class="flex w-full items-center justify-start pb-2">
            <div>
              <Icon :name="selectIcon(resource.resourceType)" size="35" />
            </div>

            <n-divider vertical />

            <div class="flex w-full flex-col space-y-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-lg leading-5 font-medium">
                  {{ resource.title || "No title provided" }}
                </span>

                <div class="flex items-center justify-end space-x-2">
                  <n-tag
                    v-if="resource.filledIn === false"
                    type="error"
                    size="medium"
                  >
                    <Icon name="mdi:alert" size="16" />
                    Needs to be filled in
                  </n-tag>

                  <n-tooltip
                    v-if="
                      resource.action === 'create' ||
                      resource.action === 'update' ||
                      resource.action === 'delete' ||
                      resource.action === 'oldVersion'
                    "
                    trigger="hover"
                    placement="bottom-end"
                  >
                    <template #trigger>
                      <div class="flex gap-2">
                        <n-tag
                          v-if="resource.action === 'create'"
                          type="info"
                          size="medium"
                        >
                          <template #icon>
                            <Icon name="mdi:new-box" size="16" />
                          </template>
                          New Resource
                        </n-tag>

                        <n-tag
                          v-if="
                            resource.action === 'delete' ||
                            resource.action === 'oldVersion'
                          "
                          type="error"
                          size="medium"
                        >
                          <template #icon>
                            <Icon name="jam:delete" size="16" />
                          </template>
                          Marked for deletion
                        </n-tag>

                        <n-tag
                          v-if="resource.action === 'update'"
                          type="success"
                          size="medium"
                        >
                          <template #icon>
                            <Icon name="uil:edit-alt" size="16" />
                          </template>

                          Updated
                        </n-tag>
                      </div>
                    </template>
                    Last modified on {{ displayLongDate(resource.updated) }}
                  </n-tooltip>

                  <n-tag
                    v-if="resource.action === 'oldVersion'"
                    type="warning"
                    size="medium"
                  >
                    <template #icon>
                      <Icon name="ic:round-history" size="16" />
                    </template>
                    Newer Version Available
                  </n-tag>

                  <n-tag
                    v-if="resource.action === 'newVersion'"
                    type="info"
                    size="medium"
                  >
                    <template #icon>
                      <Icon name="clarity:new-solid" size="16" />
                    </template>

                    New Version
                  </n-tag>

                  <n-divider
                    v-if="resource.action && resource.action !== 'oldVersion'"
                    vertical
                  />

                  <n-button
                    v-if="resource.action === 'delete'"
                    type="error"
                    size="small"
                  >
                    <template #icon>
                      <Icon name="mdi:undo" />
                    </template>
                    Undo delete
                  </n-button>

                  <NuxtLink
                    v-if="
                      resource.action !== 'delete' &&
                      resource.action !== 'oldVersion' &&
                      !collection?.version?.published
                    "
                    :to="`/dashboard/workspaces/${workspaceid}/collections/${collection?.id}/resources/${resource.id}/edit`"
                  >
                    <n-button type="info" size="small">
                      <template #icon>
                        <Icon name="akar-icons:edit" />
                      </template>
                      Edit
                    </n-button>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <p class="border-t border-dashed py-3">
            {{ resource.description || "No description provided" }}
          </p>

          <div class="flex w-full items-center space-x-1 border-t pt-3 pb-4">
            <n-tag
              :type="resource.identifierType ? 'info' : 'error'"
              size="small"
              class=""
            >
              {{ resource.identifierType || "No identifier provided" }}
            </n-tag>

            <div>
              <n-divider vertical />
            </div>

            <div class="group w-max">
              <NuxtLink
                :to="
                  resource.identifierType !== 'url'
                    ? `https://identifiers.org/${resource.identifierType}/${resource.identifier}`
                    : resource.identifier
                "
                class="flex items-center font-medium text-blue-600 transition-all group-hover:text-blue-700 group-hover:underline"
                target="_blank"
                @click.stop=""
              >
                {{ resource.identifier }}

                <Icon
                  v-if="resource.identifierType"
                  name="mdi:external-link"
                  size="16"
                  class="ml-1 text-blue-600 transition-all group-hover:text-blue-700 group-hover:underline"
                />
              </NuxtLink>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <ModalNewCollection />
  </main>
</template>
