<template>
  <div v-if="participantlistitems" class="flex flex-wrap justify-between mt-4">
    <ParticipantManagementListItem
      v-for="participantlistitem in participantlistitems"
      :key="participantlistitem.id"
      :participantlistitem="participantlistitem"
      :disabled="true"
    />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, defineProps, PropType, ref } from "vue";
import ParticipantManagementListItem from "./ParticipantManagementListItem.vue";
import ParticipantListItem from "@/types/ParticipantListItem";

const props = defineProps({
  participantlistitems: {
    required: true,
    type: Array as PropType<ParticipantListItem[]>,
  },
});
</script>
