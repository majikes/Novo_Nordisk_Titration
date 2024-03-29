<template>
  <div class="p-2 my-2 grid grid-cols-4 rounded-md bg-gray-200 font-mono">
    <div class="m-1 p-1 col-span-4 grid grid-cols-4 justify-between rounded-sm" :class="{
      'bg-emerald-200': validDays.validPcnt >= thresholdTotal,
      'bg-red-300': validDays.validPcnt < thresholdTotal,
    }">
      <h2 class="flex justify-between col-span-3 text-xl font-semibold p-3">
        {{ participantCGMAvail.username }} :
        {{ validDays.validPcnt }}% ({{ validDays.valid }}/{{ validDays.total }} days)
      </h2>
      <div class="text-m font-semibold px-2 pt-1 w-full">
        <h2 class="flex justify-between">
          <div>first:</div>
          <div>{{ dateFormat(participantCGMAvail.firstTimestamp) }}</div>
        </h2>
        <h2 class="flex justify-between">
          <div>last:</div>
          <div>{{ dateFormat(participantCGMAvail.lastTimestamp) }}</div>
        </h2>
      </div>
    </div>
    <div class="p-1 col-span-4 flex flex-wrap w-full gap-1 justify-start">
      <div v-for="(
          cgmDay, index2
        ) in participantCGMAvail.dailyPercentageOfCgmAvailable" :key="index2" :title="`Day start at ${String(
      new Date(cgmDay.dayStartTimestamp * 1000).toLocaleString('en-US')
    )}`" class="aspect-square w-20 force-center-content rounded-sm" :class="{
      'bg-emerald-200': cgmDay.percentageOfCgmAvailable >= thresholdDaily,
      'bg-red-300': cgmDay.percentageOfCgmAvailable < thresholdDaily,
    }">
        {{ cgmDay.percentageOfCgmAvailable }}%
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, defineProps, defineModel, PropType, ref } from "vue";
import { api } from "@/functions/GlobalFunctions";
import { useApiURL } from "@/globalConfigPlugin";
import {
  type CGMDataAvailDayType,
  type CGMDataAvailTypeMinimal,
  type CGMDataAvailFrontendType,
  type CGMDataFromAPIType,
} from "@/types/CGMDataAvailTypes";
import { useAuthenticator } from "@aws-amplify/ui-vue";
import { useDebugModeStore } from "@/stores/debugModeStore";
import { useErrorStore } from "@/stores/ErrorStore";
import { cloneDeep, lowerCase } from "lodash";

const props = defineProps({
  thresholdTotal: {
    required: true,
    type: Number as PropType<number>,
  },
  thresholdDaily: {
    required: true,
    type: Number as PropType<number>,
  },
  timeZone: {
    required: true,
    type: String as PropType<string>,
  },
})
// dope-ass new v-model macro :o
const participantCGMAvail = defineModel(
  'participantCGMAvail',
  {
    required: true,
    type: Object as PropType<CGMDataAvailFrontendType>,
  })

const apiRootURL = useApiURL();
const auth = useAuthenticator();
const errors = useErrorStore();
const componentName = "CGMDataAvailabilityBlock";
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

const validDays = computed(() => {
  const retObj = {
    total: 0,
    valid: 0,
    validPcnt: 0,
  };
  for (const cgmDay of participantCGMAvail.value
    .dailyPercentageOfCgmAvailable) {
    retObj.total++;
    if (cgmDay.percentageOfCgmAvailable >= props.thresholdDaily) {
      retObj.valid++;
    }
  }
  if (retObj.total > 0) {
    retObj.validPcnt = Math.round((retObj.valid / retObj.total) * 100 * 100) / 100;
  }
  return retObj;
});

function loadSubjectCGMAvail() {
  participantCGMAvail.value.loading = true
  console.log(`loading cgm availability for participant ${participantCGMAvail.value.username}`);
  // push new fake obj onto list with username and loading = true
  // const tmpParticipant = {} as CGMDataAvailFrontendType;
  // tmpParticipant.username = participant
  // tmpParticipant.dailyPercentageOfCgmAvailable = [] as CGMDataAvailDayType[]
  // tmpParticipant.firstTimestamp = 0
  // tmpParticipant.lastTimestamp = 0
  // tmpParticipant.loading = true
  // cgmAvailabilityPercentagesValid.value.push(tmpParticipant)

  const endpoint = "getCgmAvailabilityPercentageBySubject";
  const req_username = auth.user.username
  // const req_username = "testuser";
  console.log(`GET request to /${endpoint}`);
  const req_url = `${apiRootURL}/${endpoint}?requestor_username=${req_username}&timezone=${props.timeZone}&subject_id=${participantCGMAvail.value.username}`;
  console.log(`request to ${req_url}`);
  // api.getAuth<any>(req_url, tokenComputed.value).then(
  api
    .get<CGMDataFromAPIType>(req_url)
    .then((response: CGMDataFromAPIType) => {
      console.log(`successful ${endpoint} request`);
      console.log(response);
      const tmpCGMDataAvailMinimal = response.cgmPercentage;
      participantCGMAvail.value.dailyPercentageOfCgmAvailable = tmpCGMDataAvailMinimal.dailyPercentageOfCgmAvailable;
      participantCGMAvail.value.firstTimestamp = tmpCGMDataAvailMinimal.firstTimestamp
      participantCGMAvail.value.lastTimestamp = tmpCGMDataAvailMinimal.lastTimestamp
      if (response.timezone !== participantCGMAvail.value.timezone) {
        errors.errorLog(
          `${componentName}; backend returned a different timezone for participant ${participantCGMAvail.value.username} than expected. Requested: ${props.timeZone}; Returned: ${response.timezone}. Forcibly setting dropdown to ${response.timezone}...`
        );
        participantCGMAvail.value.timezone = response.timezone;
      }
      participantCGMAvail.value.empty = false
    })
    .catch((err) => {
      console.log(err.message);
      errors.errorLog(
        `${componentName}; request to ${req_url}: ${err.message}`
      );
    })
    .finally(() => {
      console.log("done");
      participantCGMAvail.value.loading = false
    });
}

function dateFormat(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hr = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const retStr = `${month}/${day} ${hr}:${min}`;
  return retStr;
}

</script>
