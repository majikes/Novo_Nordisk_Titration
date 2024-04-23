<template>
  <div class="flex justify-end my-1">
    <div class="flex mr-4">
      <!-- https://feathericons.dev/?search=arrow-down&iconset=feather -->
      <div class="overview-interactive-svg-container force-center-content w-8" @click="reverseSortDir">
        <svg v-if="sortDirDesc" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
          class="overview-interactive-svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
          stroke-width="1.5">
          <line x1="12" x2="12" y1="5" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
        <!-- https://feathericons.dev/?search=arrow-up&iconset=feather -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
          class="overview-interactive-svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
          stroke-width="1.5">
          <line x1="12" x2="12" y1="19" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </div>
      <div class="w-48">
        <select :disabled="loading" class="form-select select-input" name="sort" id="sort-select" v-model="sortVar">
          <option disabled>Sort by...</option>
          <option :value="sortVar" v-for="sortVar in Object.keys(sortables)" :key="sortVar">
            {{ (sortables as any)[sortVar] }}
          </option>
        </select>
      </div>
    </div>

    <div class="flex">
      <svg class="w-5 mr-2" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
          stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
      <div class="w-48">
        <select :disabled="loading" class="form-select select-input" name="filter" id="filter-select"
          v-model="filterVar">
          <option disabled>Filter by...</option>
          <option :value="filterVar" v-for="filterVar in Object.keys(filterables)" :key="filterVar">
            {{ (filterables as any)[filterVar] }}
          </option>
        </select>
      </div>
    </div>
  </div>
  <div v-if="
    groupComputed.includes('cdt dev') ||
    groupComputed.includes('cdt technical') ||
    groupComputed.includes('cdt overseer')
  " class="flex justify-end">
    <div class="flex content-evenly gap-2 p-2">
      <input class="h-5 rounded aspect-square" type="checkbox" v-model="showTestSubjects" />
      Show test participants
    </div>
  </div>
  <div v-if="debugModeStore.debugMode">
    <div>sortDirDesc: {{ sortDirDesc }}</div>
  </div>
  <div class="relative grid grid-cols-3 gap-4 mt-6">
    <LoadingHover v-if="loading">
      <div class="font-semibold">Loading...</div>
    </LoadingHover>
    <div class="w-full force-center-content" v-for="card in filteredByTest" :key="card.subject_id">
      <SubjectCard :card="card" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, defineProps, PropType, ref } from "vue";
import SubjectCard from "@/components/SubjectCard.vue";
import LoadingHover from "./LoadingHover.vue";
import { type SubjectCardFrontendType } from "@/types/SubjectCardTypes";
import { useAuthenticator } from "@aws-amplify/ui-vue";
import { lowerCase } from "lodash";
import { useDebugModeStore } from "@/stores/debugModeStore";

const props = defineProps({
  cards: {
    required: true,
    type: Array as PropType<SubjectCardFrontendType[]>,
  },
  loading: {
    required: true,
    type: Boolean as PropType<boolean>,
  },
});

const auth = useAuthenticator();
const debugModeStore = useDebugModeStore();
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

const studyPrefix = "102";

const sortVar = ref("subject_id");
const sortables = {
  subject_id: "Participant ID",
  // daysToTitrate: "Days to Titrate",
  // 'glycemicRisk': 'Glycemic Risk',
};
const sortDirDesc = ref(true);
function reverseSortDir() {
  sortDirDesc.value = !sortDirDesc.value;
}

const filterVar = ref("none");
const filterables = {
  none: "All",
  active: "Active Only",
  exp: "Experimental Only",
  ctr: "Control Only",
};

const showTestSubjects = ref(false);

const sortedById = computed(() => {
  return [...props.cards].sort((a, b) => {
    if (a.subject_id > b.subject_id) {
      return 1;
    } else {
      return -1;
    }
  });
});

const sortedBySelected = computed(() => {
  return [...sortedById.value].sort((a, b) => {
    if (
      typeof (a as any)[sortVar.value] !== "undefined" &&
      typeof (b as any)[sortVar.value] !== "undefined"
    ) {
      const directionality = sortDirDesc.value ? -1 : 1;
      if ((a as any)[sortVar.value] > (b as any)[sortVar.value]) {
        return 1 * directionality;
      } else {
        return -1 * directionality;
      }
    } else {
      return 1;
    }
  });
});

const filteredBySelected = computed(() => {
  return [...sortedBySelected.value].filter((card) => {
    if (filterVar.value === "none") {
      return true;
    } else if (filterVar.value === "active") {
      return card.active;
    } else if (filterVar.value === "exp") {
      return card.interventionArm === 1;
    } else if (filterVar.value === "ctr") {
      return card.interventionArm === 0;
    }
  });
});

const filteredByTest = computed(() => {
  return [...filteredBySelected.value].filter((card) => {
    if (showTestSubjects.value) {
      return true;
    } else {
      return card.subject_id.startsWith(studyPrefix);
    }
  });
});
</script>
