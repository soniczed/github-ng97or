<script lang="ts" setup>
import { ref } from "vue";
import ChatDialog from "@/components/organisms/ChatDialog/ChatDialog.vue";

const showChatDialog = ref(false);
</script>

<template>
  <div class="fixed bottom-4 right-4">
    <div
      @click="() => (showChatDialog = true)"
      class="chat-icon flex rounded-full justify-center items-center cursor-pointer w-12 h-12 bg-zinc-200 hover:bg-zinc-300 transition-colors"
    >
      <vue-feather type="message-square"></vue-feather>
    </div>
    <ChatDialog
      :is-visible="showChatDialog"
      :id="'1'"
      :name="'Gemini Assistant'"
      @update:visible="() => (showChatDialog = false)"
    />
  </div>
</template>