<script lang="ts" setup>
import { ref, toRef, defineProps, watch } from "vue";
import Dialog from "primevue/dialog";
import InputTextWithValidation from "@/components/molecules/InputTextWithValidation/InputTextWithValidation.vue";
import MessageChat from "@/components/atoms/MessageChat/MessageChat.vue";
import Loading from "@/components/atoms/LoadingMessage/LoadingMessage.vue";
import { sendMessage } from "@/services/gemini/api";
import { useForm } from "vee-validate";
import * as yup from "yup";
import { useMessageStore, Message } from "@/store/chat/messages";

const props = defineProps({
  isVisible: { type: Boolean, required: true, default: false },
  id: { type: String, required: true },
  name: { type: String, required: true },
});
const isVisibleRef = toRef(props, "isVisible");

const isLoading = ref(true);
const messageStore = useMessageStore();
const messages = ref(messageStore.getMessages());

watch(
  () => messageStore.getMessages(),
  (newMessages) => {
    messages.value = newMessages;
  }
);

const addMessage = (message: Message) => messageStore.addMessage(message);
const clearMessages = () => messageStore.clearMessages();

function currentTime() {
  return new Date().toLocaleTimeString([], { 
    hour: "2-digit", 
    minute: "2-digit" 
  });
}

const schema = yup.object({
  message: yup.string().max(255, "Maximum 255 characters").required(" "),
});

const { handleSubmit, setValues } = useForm({
  initialValues: {
    message: "",
  },
  validationSchema: schema,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    const userMsg: Message = {
      type: "text",
      value: values.message,
      time: currentTime(),
      green: true,
    };

    addMessage(userMsg);
    setValues({ message: "" });
    isLoading.value = true;

    const response = await sendMessage(values.message);
    
    setTimeout(() => {
      const assistantMsg: Message = {
        type: "text",
        value: response.message.content,
        time: currentTime(),
        green: false,
      };
      addMessage(assistantMsg);
      isLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error(error);
    const errorMsg: Message = {
      type: "text",
      value: "Sorry, I couldn't process your request. Please try again.",
      time: currentTime(),
      green: false,
    };
    addMessage(errorMsg);
    isLoading.value = false;
  }
});

const onDialogShow = async () => {
  try {
    isLoading.value = true;
    const response = await sendMessage("Hello");
    const welcomeMsg: Message = {
      type: "text",
      value: response.message.content,
      time: currentTime(),
      green: false,
    };
    addMessage(welcomeMsg);
    isLoading.value = false;
  } catch (error) {
    console.error(error);
    isLoading.value = false;
  }
};

const onDialogBeforeHide = () => {
  clearMessages();
  messages.value = [];
};
</script>

<template>
  <Dialog
    :visible="isVisibleRef"
    modal
    dismissableMask
    :style="{ width: '500px' }"
    @update:visible="() => (isVisibleRef = false)"
    @show="onDialogShow"
    @hide="onDialogBeforeHide"
  >
    <template #header>
      <div class="flex">
        <div
          class="flex rounded-full justify-center items-center h-12 w-12 bg-zinc-200"
        >
          <vue-feather type="message-square"></vue-feather>
        </div>
        <div class="ml-4">
          <h2 class="font-semibold">{{ name }}</h2>
          <div class="flex items-center">
            <div class="rounded-full h-1.5 w-1.5 bg-green-400"></div>
            <h5 class="ml-1 text-xs font-light">Online</h5>
          </div>
        </div>
      </div>
    </template>
    <template #default>
      <div
        class="flex justify-end flex-col overflow-y-auto"
        style="height: 500px"
      >
        <MessageChat
          v-for="(message, index) in messages"
          :key="index"
          :type="message.type"
          :value="message.value"
          :time="message.time"
          :green="message.green"
        />
        <Loading v-show="isLoading" />
      </div>
    </template>
    <template #footer>
      <div class="flex">
        <InputTextWithValidation
          v-on:keyup.enter="onSubmit"
          name="message"
          placeholder="Send a message..."
          style="width: 95%"
        />
        <div class="flex justify-center items-center cursor-pointer">
          <vue-feather
            @click="onSubmit"
            type="send"
            class="send flex"
          ></vue-feather>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style lang="scss" scoped>
:global(.p-dialog) {
  border: solid #fff;
  box-shadow: 2px 4px 10px rgba(163, 163, 163, 0.25);
  border-radius: 16px;
}

:global(.p-dialog .p-dialog-header) {
  background: #fff;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
}

:global(.p-dialog .p-dialog-content) {
  background: #f5f5f5;
  color: #495057;
  padding: 0 1.5rem 1rem 1.5rem;
}

:global(.p-dialog .p-dialog-footer) {
  background: #fff;
  padding: 0 1.5rem 0.2rem 1rem;
  text-align: right;
}

.send {
  background-color: white;
  color: black;
  transition: all 0.3s;

  &:hover {
    color: rgb(74 222 128);
  }
}
</style>