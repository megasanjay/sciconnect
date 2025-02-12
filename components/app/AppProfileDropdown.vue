<script setup lang="ts">
const { clear } = useUserSession();

const logout = async () => {
  clear();
  await navigateTo("/login");
};

const items = ref([
  [
    {
      icon: "uil:dashboard",
      label: "Dashboard",
    },
    {
      icon: "bx:bxs-book-open",
      label: "Catalog",
    },
    {
      icon: "ic:baseline-settings",
      label: "Settings",
    },
    {
      icon: "heroicons-solid:star",
      label: "Starred",
    },
  ],
  [
    {
      icon: "solar:home-bold",
      label: "Home",
    },
    {
      icon: "majesticons:logout",
      label: "Logout",
      onSelect: logout,
    },
  ],
]);
</script>

<template>
  <AuthState>
    <template #default="{ loggedIn, user }">
      <NuxtLink v-if="!loggedIn" to="/login">
        <n-button size="large">
          <span> Log in </span>
        </n-button>
      </NuxtLink>

      <NuxtLink v-if="!loggedIn" to="/register">
        <n-button color="black" size="large"> Get started </n-button>
      </NuxtLink>

      <UDropdownMenu
        :items="items"
        :ui="{
          content: 'w-48',
        }"
      >
        <UButton
          v-if="loggedIn"
          :avatar="{
            src: `https://api.dicebear.com/6.x/shapes/svg?seed=${user?.id}`,
          }"
          size="xl"
          color="neutral"
          variant="ghost"
        />
      </UDropdownMenu>
    </template>

    <template #placeholder>
      <!-- this will be rendered on server side -->
      <n-spin size="small">
        <div class="h-[35px] w-[35px] rounded-full bg-yellow-50"></div>
      </n-spin>
    </template>
  </AuthState>
</template>
