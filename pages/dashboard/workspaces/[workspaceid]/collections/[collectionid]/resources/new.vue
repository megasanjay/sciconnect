<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import { faker } from "@faker-js/faker";

import RESOURCE_TYPE_JSON from "@/assets/json/resource-type.json";
import PREFIX_JSON from "@/assets/json/prefix.json";

definePageMeta({
  name: "resource:edit",
  layout: "app-layout",
  middleware: ["auth"],
});

useSeoMeta({
  title: "Edit resource",
});

const toast = useToast();
const route = useRoute();

const resourceTypeOptions = RESOURCE_TYPE_JSON;
const identifierTypeOptions = PREFIX_JSON;

const { collectionid, workspaceid } = route.params as {
  collectionid: string;

  workspaceid: string;
};

const createForm = useTemplateRef("createForm");

const loading = ref(false);

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  identifier: z.string().min(1, "Identifier is required"),
  identifierType: z.string().min(1, "Identifier type is required"),
  resourceType: z.string().min(1, "Resource type is required"),
  versionLabel: z.string().optional(),
});

type Schema = z.output<typeof schema>;

const state = reactive({
  title: faker.commerce.product(),
  description: faker.lorem.paragraph(),
  identifier: faker.internet.url(),
  identifierType: "url",
  resourceType: "other",
  versionLabel: `v${faker.number.int({ max: 10, min: 1 })}.${faker.number.int({
    max: 10,
    min: 1,
  })}.${faker.number.int({ max: 10, min: 1 })}`,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const body = {
    title: event.data.title,
    description: event.data.description,
    identifier: event.data.identifier,
    identifierType: event.data.identifierType,
    resourceType: event.data.resourceType,
    versionLabel: event.data.versionLabel,
  };

  loading.value = true;

  await $fetch(
    `/api/workspaces/${workspaceid}/collections/${collectionid}/resources`,
    {
      body,
      method: "POST",
    },
  )
    .then((response) => {
      loading.value = false;

      toast.add({
        title: "Success",
        color: "success",
        description: "We created a new resource",
        icon: "material-symbols:check-circle-outline",
      });

      // navigate to the new resource
      navigateTo(
        `/dashboard/workspaces/${workspaceid}/collections/${collectionid}/resources/${response.resourceId}`,
      );
    })
    .catch((error) => {
      loading.value = false;

      console.log(error);

      toast.add({
        title: "Something went wrong",
        color: "error",
        description: "We couldn't create a new resource",
        icon: "material-symbols:error",
      });
    })
    .finally(() => {
      loading.value = false;
    });
}

// Reorganize resource type options in alphabetical order
resourceTypeOptions.sort((a, b) => a.label.localeCompare(b.label));

const { collectionPermissionAbility, collectionPermissionGetLoading } =
  await useCollectionPermission(workspaceid, collectionid);

const disableEditing = computed(() => {
  return (
    collectionPermissionGetLoading.value ||
    !collectionPermissionAbility.value.includes("edit")
  );
});
</script>

<template>
  <main class="h-auto flex-1 bg-zinc-50">
    <div class="flex h-36 items-center border-b border-gray-200 bg-white">
      <div
        class="mx-auto flex w-full max-w-screen-xl items-center justify-between px-2.5 lg:px-20"
      >
        <h1 class="text-4xl font-black">Add a new resource</h1>

        <div class="flex items-center space-x-2">
          <UButton
            color="primary"
            icon="humbleicons:save"
            size="lg"
            :loading="loading"
            :disabled="disableEditing"
            @click="createForm?.submit()"
          >
            Save changes
          </UButton>
        </div>
      </div>
    </div>

    <div class="mx-auto w-full max-w-screen-xl px-2.5 py-10 lg:px-20">
      <UForm
        ref="createForm"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Title" name="title">
          <UInput
            v-model="state.title"
            size="lg"
            placeholder="My random resource"
          />
        </UFormField>

        <UFormField label="Description" name="description">
          <UTextarea
            v-model="state.description"
            :maxrows="4"
            size="lg"
            placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae nisi eget nunc ultricies aliquet. Sed vitae nisi eget nunc ultricies aliquet."
          />
        </UFormField>

        <UFormField label="Identifier Type" name="identifierType">
          <USelect
            v-model="state.identifierType"
            :items="identifierTypeOptions"
            placeholder="DOI"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField label="Identifier" name="identifier">
          <UInput
            v-model="state.identifier"
            placeholder="10.1234/abc"
            clearable
            size="lg"
          />
        </UFormField>

        <UFormField label="Resource Type" name="resourceType">
          <USelect
            v-model="state.resourceType"
            :items="resourceTypeOptions"
            placeholder="Other"
            class="w-full"
            size="lg"
          />

          <p class="mt-2 text-sm text-slate-500">
            Select the type of resource you are linking to.
          </p>
        </UFormField>

        <UFormField label="Version" name="version">
          <UInput
            v-model="state.versionLabel"
            placeholder="v1.0.0"
            clearable
            size="lg"
          />

          <p class="mt-2 text-sm text-slate-500">
            Adding a version label will allow you to keep track of changes to
            your resource.
          </p>
        </UFormField>
      </UForm>
    </div>

    <ModalNewCollection />
  </main>
</template>
