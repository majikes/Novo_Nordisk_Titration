<template>
  <div v-if="!groupComputed.includes('participant')" class="profile-history">
    <div class="control-row-header" id="header">
      <h1 class="text-2xl font-bold">Basal Dose History</h1>
    </div>
    <div class="flex justify-end my-1">
      <SubjectDropdown v-model="selected" />
    </div>
    <div class="flex justify-end my-1">
      <div class="flex content-evenly gap-2 p-2">
        <input
          class="h-5 rounded aspect-square"
          type="checkbox"
          v-model="onlyParticipantEntries"
        />
        Only participant-added doses
      </div>
    </div>
    <LoadingHover v-if="basalsLoading">Loading basal history...</LoadingHover>
    <BasalDoseHistoryTable v-else :doseHistory="basalDoseHistoryFiltered" />
    <div v-if="debugModeStore.debugMode"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SubjectDropdown from "@/components/SubjectDropdown.vue";
import BasalDoseHistoryTable from "@/components/BasalDoseHistoryTable.vue";
import { api } from "@/functions/GlobalFunctions";
import { useApiURL } from "@/globalConfigPlugin";
import { useDebugModeStore } from "@/stores/debugModeStore";
import { useAuthenticator } from "@aws-amplify/ui-vue";
import { lowerCase } from "lodash";
import { useErrorStore } from "@/stores/ErrorStore";
import { 
  type BasalDoseFromAPIType,
  type BasalDoseType,
  type BasalDoseRecType,
  type BasalDoseHistoryFromAPIType,
} from "@/types/BasalDoseTypes";
import LoadingHover from "@/components/LoadingHover.vue";

const debugModeStore = useDebugModeStore();
const auth = useAuthenticator();
const errors = useErrorStore();
const componentName = "BasalDoseHistory";
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
const tokenComputed = computed(() => {
  // 'Authorization': cognitoUser.signInUserSession.idToken.jwtToken
  let token = "";
  if (
    typeof auth.user.signInUserSession !== "undefined" &&
    typeof auth.user.signInUserSession.idToken.jwtToken !== "undefined"
  ) {
    token = auth.user.signInUserSession.idToken.jwtToken;
  }
  console.log(`token: ${token}`);
  return token;
});
const route = useRoute();
const selected = ref("");
const apiRootURL = useApiURL();
selected.value =
  route.params.subjectId === undefined
    ? ""
    : (route.params.subjectId as string);
watch(selected, () => {
  console.log(`dropdown: ${selected.value}`);
  // console.log(`subjectIdStore: ${subjectIdStore.subjectId}`)
  getBasalDoseHistory();
});

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const minutesRemaining = minutes % 60;

  // Format the hours and minutes to always be two digits
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutesRemaining.toString().padStart(2, "0");

  const retStr = `${formattedHours}:${formattedMinutes}`;

  return retStr;
}

const onlyParticipantEntries = ref(true);

const basalDoseHistory = ref([] as BasalDoseType[]);
const basalsLoading = ref(false);

const basalDoseHistorySortedByTime = computed(() => {
  return [...basalDoseHistory.value].sort((a, b) => {
    if (a.time < b.time) {
      return 1;
    } else {
      return -1;
    }
  });
});

const basalDoseHistoryFiltered = computed(() => {
  return [...basalDoseHistorySortedByTime.value].filter((histEntry) => {
    if (onlyParticipantEntries.value) {
      return histEntry.src_id === "2";
    } else {
      return true;
    }
  });
});

function getBasalDoseHistory() {
  console.log("loading");
  basalsLoading.value = true;
  console.log("clearing displayed basal dose history");
  basalDoseHistory.value = [] as BasalDoseType[];
  const endpoint = "getbasaldosehistory";
  console.log(`GET request to /${endpoint}`);
  const req_url = `${apiRootURL}/${endpoint}?requestor_username=${auth.user.username}&subject_username=${selected.value}`;
  console.log(`request to ${req_url}`);
  // server response:
  // {"id":"103","date":"08/29/2023", "timeOfDayInMinutes":1340, "basalDoseValue":40}
  const APIKEYHARDCODED = "7LiuUEWHXNMCOSZdaCS32DQPme5SYHr7JZlsVk1a";
  api
    .getAPIKeyAuth<BasalDoseHistoryFromAPIType>(req_url, APIKEYHARDCODED)
    .then((doseHistoryObject: BasalDoseHistoryFromAPIType) => {
      console.log("successful basal dose history request");
      console.log(doseHistoryObject);
      for (const dose of doseHistoryObject.basalDoseHistory) {
        const tmpDose = {
          id: "",
          date: "",
          basalDoseTimeOfDayInMinutes: -1,
          basalDoseValue: -1,
          src_id: "-1",
          time: -1,
          formattedTime: "",
        };
        tmpDose.id = dose.id;
        tmpDose.date = dose.date;
        tmpDose.basalDoseTimeOfDayInMinutes = dose.basalDoseTimeOfDayInMinutes;
        tmpDose.basalDoseValue = dose.basalDoseValue;
        tmpDose.src_id = dose.src_id;
        tmpDose.time = dose.time;
        tmpDose.formattedTime = formatTime(dose.basalDoseTimeOfDayInMinutes);
        basalDoseHistory.value.push(tmpDose);
      }
      for (const dose of doseHistoryObject.basalDoseRecHistory) {
        const tmpDose = {
          id: "",
          date: "",
          basalDoseTimeOfDayInMinutes: -1,
          basalDoseValue: -1,
          src_id: "-1",
          time: -1,
          formattedTime: "",
        };
        tmpDose.id = dose.id;
        tmpDose.date = dose.date;
        tmpDose.basalDoseValue = dose.basalDoseRecom;
        tmpDose.src_id = dose.src_id;
        tmpDose.time = dose.time;
        tmpDose.formattedTime = '(Recommendation)';
        basalDoseHistory.value.push(tmpDose);
      }
    })
    .catch((err) => {
      console.log(err.message);
      errors.errorLog(
        `${componentName}; request to ${req_url}: ${err.message}`
      );
    })
    .finally(() => {
      console.log("done");
      basalsLoading.value = false;
    });
}
getBasalDoseHistory();
</script>
