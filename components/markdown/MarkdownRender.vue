<script setup lang="ts">
import sanitizeHtml from "sanitize-html";
import { parse } from "marked";

const renderedMarkdown = ref("");

const props = defineProps({
  content: {
    default: "",
    type: String,
  },
});

const sanitize = (html: string) => sanitizeHtml(html);

const convertMarkdownToHtml = async (
  markdown: string = "No content provided",
) => {
  return sanitize(await parse(markdown));
};

if (props.content) {
  renderedMarkdown.value = await convertMarkdownToHtml(props.content);
}
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    class="prose:stone prose prose-lg dark:prose-invert max-w-none pt-2"
    v-html="renderedMarkdown"
  />
  <!-- eslint-enable vue/no-v-html -->
</template>
