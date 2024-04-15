<template>
  <div
    class="w-64 flex flex-wrap justify-between flex-row p-5 rounded-xl drop-shadow-lg"
    :class="{ 'bg-white text-gray-400': !isActive, 'bg-emerald-100': isActive }"
  >
    <div class="py-1">{{ card.subject_id }}</div>
    <div
      class="px-2 py-1 rounded-md"
      :class="{
        'bg-cyan-500': armColor.ctrColor,
        'bg-fuchsia-500': armColor.expColor,
      }"
      :title="armTitle"
    >
      {{ armText }}
    </div>

    <!-- status & titrate badge -->
    <div class="basis-full pt-2 flex justify-between relative" id="status-text">
      <div>Status: {{ status }}</div>
    </div>
    <div
      v-if="
        groupComputed.includes('cdt dev') ||
        groupComputed.includes('cdt technical') ||
        !groupComputed.includes('physician')
      "
      class="basis-full flex justify-between relative"
      id="cgm-availability"
    >
      <ConnStatus24HrChart
        :conn-data="card.cgm_availability"
        :loading="card.loading"
        :active="isActive"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, defineProps, PropType, ref } from "vue";
import { type SubjectCardFrontendType } from "@/types/SubjectCardTypes";
import ConnStatus24HrChart from "./ConnStatus24HrChart.vue";
import { useAuthenticator } from "@aws-amplify/ui-vue";
import { lowerCase } from "lodash";

const props = defineProps({
  card: {
    required: true,
    type: Object as PropType<SubjectCardFrontendType>,
  },
});
// console.log('card props:',props.subject)
const auth = useAuthenticator();
const groupComputed = computed(() => {
  let group = [] as string[];
  if (
    typeof auth.user !== "undefined" &&
    typeof auth.user.signInUserSession !== "undefined" &&
    typeof auth.user.signInUserSession.idToken.payload["cognito:groups"] !==
      "undefined"
  ) {
    group =
      auth.user.signInUserSession.idToken.payload["cognito:groups"].map(
        lowerCase
      );
  }
  console.log(`group: ${group}`);
  return group;
});
const isActive = ref(props.card.active);
const status = computed(() => {
  return props.card.active ? "active" : "inactive";
});
const armColor = computed(() => {
  const retObj = {
    expColor: false,
    ctrColor: false,
  };
  if (props.card.active) {
    if (props.card.interventionArm === 0) {
      retObj.ctrColor = true;
    } else if (props.card.interventionArm === 1) {
      retObj.expColor = true;
    }
  }
  return retObj;
});
const armTitle = computed(() => {
  if (props.card.interventionArm === 0) {
    return "CONTROL ARM";
  } else if (props.card.interventionArm === 1) {
    return "EXPERIMENTAL ARM";
  } else {
    return "N/A";
  }
});
const armText = computed(() => {
  if (props.card.interventionArm === 0) {
    return "CTR";
  } else if (props.card.interventionArm === 1) {
    return "EXP";
  } else {
    return "N/A";
  }
});
</script>
