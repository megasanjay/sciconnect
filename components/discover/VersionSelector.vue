<script setup lang="ts">
import { useClipboard } from "@vueuse/core";

defineProps({
  collectionIdentifier: {
    required: true,
    type: Number,
  },
  selectedVersionIdentifier: {
    required: true,
    type: Number,
  },
  versions: {
    required: true,
    type: Array as PropType<Version[]>,
  },
});

const toast = useToast();

const showCollectionIdentifierQRCodeModal = ref(false);

const handleDownloadQRCode = () => {
  const canvas = document
    .querySelector("#qr-code")
    ?.querySelector<HTMLCanvasElement>("canvas");

  if (canvas) {
    const url = canvas.toDataURL();
    const a = document.createElement("a");

    a.download = "QRCode.png";
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

const copyToClipboard = (input: string) => {
  console.log("Copying to clipboard", input);
  const source = input;

  const { copied, copy, isSupported } = useClipboard({ source });

  if (!isSupported) {
    toast.add({
      title: "The Clipboard API is not supported by your browser",
      color: "error",
      description: "Please use a different browser",
      icon: "material-symbols:error",
    });
  }

  copy(source);

  if (copied) {
    toast.add({
      title: "URL copied to clipboard",
      color: "success",
      description: "The URL has been copied to your clipboard",
      icon: "material-symbols:check-circle",
    });
  }
};
</script>

<template>
  <div>
    <n-alert type="info" class="mt-3 mb-5" title="Info">
      <div class="flex items-center justify-between gap-5">
        <p class="text-base">
          If you want to always link to the latest version, use the
          <NuxtLink
            :to="`/view/c${collectionIdentifier}`"
            class="text-sky-500 transition-all hover:text-sky-400"
          >
            c{{ collectionIdentifier }}</NuxtLink
          >
          identifier.
        </p>

        <n-flex>
          <n-popover trigger="hover">
            <template #trigger>
              <n-button
                color="black"
                class="dark:text-white"
                @click="showCollectionIdentifierQRCodeModal = true"
              >
                <template #icon>
                  <Icon name="fluent:qr-code-20-regular" size="18" />
                </template>
              </n-button>
            </template>

            <span> Create a shareable QR code </span>
          </n-popover>

          <n-popover trigger="hover">
            <template #trigger>
              <n-button
                color="black"
                class="dark:text-white"
                @click="
                  copyToClipboard(
                    `https://scholarstack.io/view/${collectionIdentifier}`,
                  )
                "
              >
                <template #icon>
                  <Icon name="solar:copy-bold" size="18" />
                </template>
              </n-button>
            </template>

            <span> Copy this URL to your clipboard </span>
          </n-popover>

          <n-modal
            v-model:show="showCollectionIdentifierQRCodeModal"
            transform-origin="center"
          >
            <n-card
              style="width: 600px"
              :bordered="false"
              role="dialog"
              size="huge"
              aria-modal="true"
            >
              <n-flex vertical align="center">
                <n-qr-code
                  id="qr-code"
                  :value="`https://scholarstack.io/view/${collectionIdentifier}`"
                  icon-src="/logo/logo.svg"
                  error-correction-level="Q"
                  :size="150"
                  class="!p-0"
                />

                <n-button @click="handleDownloadQRCode"> Download </n-button>
              </n-flex>
            </n-card>
          </n-modal>
        </n-flex>
      </div>
    </n-alert>

    <div class="flex flex-col">
      <div
        v-for="version in versions"
        :key="version.id"
        class="rounded-md px-3 py-3"
        :class="{
          'border border-stone-200 bg-stone-50':
            version.id === selectedVersionIdentifier,
        }"
      >
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <div class="flex">
              <NuxtLink
                :to="`/view/v${version.id}`"
                class="text-base text-sky-500 transition-all hover:text-sky-400"
              >
                Version {{ version.name }}
              </NuxtLink>

              <n-popover trigger="hover">
                <template #trigger>
                  <n-button
                    size="small"
                    class="text-blue-500"
                    text
                    @click="
                      copyToClipboard(
                        `https://scholarstack.io/view/v${version.identifier}`,
                      )
                    "
                  >
                    <template #icon>
                      <Icon name="solar:copy-bold" size="15" />
                    </template>
                  </n-button>
                </template>

                <span> Copy this URL to your clipboard </span>
              </n-popover>
            </div>

            <NuxtLink
              :to="`/view/${version.id}`"
              class="text-sm transition-all hover:text-slate-400 hover:underline"
              :class="{
                'text-stone-600 dark:text-stone-600':
                  version.id === selectedVersionIdentifier,
                'text-stone-500 dark:text-stone-400':
                  version.id !== selectedVersionIdentifier,
              }"
            >
              v{{ version.id }}
            </NuxtLink>
          </div>

          <div class="flex flex-col">
            <time
              class="text-sm"
              :class="{
                'text-stone-900': version.id === selectedVersionIdentifier,
                'text-stone-5 0': version.id !== selectedVersionIdentifier,
              }"
            >
              {{ displayStandardDate(version.publishedOn as string) }}
            </time>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
