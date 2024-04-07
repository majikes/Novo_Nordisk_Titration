<template>
  <div class="w-64 flex flex-wrap justify-between flex-row p-5 rounded-xl drop-shadow-lg"
    :class="{ 'bg-white text-gray-400': !isActive, 'bg-emerald-100': isActive }">
    <div class="py-1">{{ card.subject_id }}</div>
    <div class="px-2 py-1 rounded-md"
      :class="{ 'bg-cyan-500': armColor.ctrColor, 'bg-fuchsia-500': armColor.expColor }">
      {{ armText }}
    </div>

    <!-- status & titrate badge -->
    <div class="basis-full pt-2 flex justify-between relative" id="status-text">
      <div>Status: {{ status }}</div>
    </div>
    <div class="basis-full flex justify-between relative" id="cgm-availability">
      <div>Conn: Loading...</div>
    </div>

  </div>
</template>
<script setup lang="ts">
import { computed, defineProps, PropType, ref } from "vue";
import { type SubjectCardFrontendType } from "@/types/SubjectCardTypes";

const props = defineProps({
  card: {
    required: true,
    type: Object as PropType<SubjectCardFrontendType>,
  },
});
// console.log('card props:',props.subject)
const loaded = true;
const isActive = ref(props.card.active);
const status = computed(() => { return props.card.active ? 'active' : 'inactive' })
const armColor = computed(() => {
  const retObj = {
    expColor: false,
    ctrColor: false,
  }
  if (props.card.active) {
    if (props.card.interventionArm === 0) {
      retObj.ctrColor = true
    }
    else if (props.card.interventionArm === 1) {
      retObj.expColor = true
    }
  }
  return retObj
})
const armText = computed(() => {
  if (props.card.interventionArm === 0) { return 'CTR' }
  else if (props.card.interventionArm === 1) { return 'EXP' }
  else { return 'N/A' }
})

</script>
