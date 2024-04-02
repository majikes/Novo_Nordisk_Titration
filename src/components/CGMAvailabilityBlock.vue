<template>
  <div class="p-2 my-2 grid grid-cols-4 rounded-md bg-gray-200 font-mono">
    <div
      class="m-1 p-1 col-span-4 grid grid-cols-4 justify-between rounded-sm"
      :class="titleBarColorObj"
    >
      <h2 class="flex justify-between col-span-3 text-xl font-semibold p-3">
        {{ participantCGMAvail.username }} :
        {{ statusFlags.statusStr }}
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
      <div
        v-for="(
          cgmDay, index2
        ) in participantCGMAvail.dailyPercentageOfCgmAvailable"
        :key="index2"
        :title="`Day start at ${String(
          new Date(cgmDay.dayStartTimestamp * 1000).toLocaleString('en-US')
        )}`"
        class="aspect-square w-20 force-center-content rounded-sm"
        :class="{
          'bg-emerald-200': cgmDay.percentageOfCgmAvailable >= thresholdDaily,
          'bg-red-300': cgmDay.percentageOfCgmAvailable < thresholdDaily,
        }"
      >
        {{ pcntFormat(cgmDay.percentageOfCgmAvailable) }}
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
});
// dope-ass new v-model macro :o
const participantCGMAvail = defineModel("participantCGMAvail", {
  required: true,
  type: Object as PropType<CGMDataAvailFrontendType>,
});

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
    validPcntStr: "Loading",
    validArr: [] as boolean[],
  };
  for (const cgmDay of participantCGMAvail.value
    .dailyPercentageOfCgmAvailable) {
    retObj.total++;
    if (cgmDay.percentageOfCgmAvailable >= props.thresholdDaily) {
      retObj.valid++;
      retObj.validArr.push(true)
    } else {
      retObj.validArr.push(false)
    }
  }
  if (retObj.total > 0) {
    retObj.validPcnt =
      Math.round((retObj.valid / retObj.total) * 100 * 100) / 100;
  }
  if (participantCGMAvail.value.loading) {
    retObj.validPcntStr = "Loading...";
  } else if (participantCGMAvail.value.empty) {
    retObj.validPcntStr = "N/A";
  } else {
    retObj.validPcntStr = `${retObj.validPcnt}% (${retObj.valid}/${retObj.total} days)`;
  }
  return retObj;
});

const titleBarColorObj = computed(() => {
  const retObj = {
        'bg-emerald-200': statusFlags.value.sufficient,
        'bg-red-300': statusFlags.value.insufficient,
        'bg-orange-300': statusFlags.value.incomplete,
        'bg-gray-100': statusFlags.value.loading,
        'bg-gray-50': statusFlags.value.invalid,
      }
  // const total = 14
  // const pcnt = Math.round(validDays.value.total / total) * 5
  // const bgComputed = `bg-gradient-to-r from-orange-300 to-gray-200 to-${pcnt}%` as string
  // (retObj as any)[bgComputed] = statusFlags.value.incomplete
  // console.log(`bgComputed: ${bgComputed}`)

  return retObj
})

function windowSearch(array:boolean[]) {
  // chatgpt!
  const windowSize = 14;
  let trueCount = 0;
  // TODO at some point make this spit out the indexes as well
  // TODO turn to computed
  // const retObj = {
  //   valid = false,

  // }
  // Early check to avoid unnecessary processing
  if (array.length < windowSize) {
      return false;
  }
  // Initialize the first window
  for (let i = 0; i < windowSize; i++) {
      if (array[i]) {
          trueCount++;
      }
  }
  // Check if the initial window meets the condition
  if (trueCount >= 10) {
      return true;
  }
  // Slide the window through the array
  for (let i = windowSize; i < array.length; i++) {
      // Remove the element exiting the window and add the new element entering the window
      if (array[i - windowSize]) {
          trueCount--;
      }
      if (array[i]) {
          trueCount++;
      }
      // Check the condition for the current window
      if (trueCount >= 10) {
          return true;
      }
  }
  // If we reach this point, no suitable sequence was found
  return false;
}

const statusFlags = computed(() => {
  const retObj = {
    invalid: false,
    loading: false,
    incomplete: false,
    insufficient: false,
    sufficient: false,
    statusStr: 'No information loaded.'
  };
  if (participantCGMAvail.value.empty) {
    retObj.invalid = true;
  } 
  if (participantCGMAvail.value.loading) {
    retObj.loading = true;
    retObj.statusStr = 'Loading...'
  } else if (validDays.value.total < 10) {
    retObj.incomplete = true;
    retObj.statusStr = `In progress (${validDays.value.total} days)`
  } else if (validDays.value.total >= 10 && validDays.value.total < 14) {
    if (validDays.value.valid < 10) {
      retObj.incomplete = true;
      retObj.statusStr = `In progress (${validDays.value.total} days)`
    } else {
      retObj.sufficient = true;
      retObj.statusStr = `Valid window detected`
    }
  } else if (validDays.value.total >= 14) {
    if (validDays.value.valid < 10) {
      retObj.insufficient = true;
      retObj.statusStr = `No valid window`
    } else if (windowSearch(validDays.value.validArr)) {
      retObj.sufficient = true;
      retObj.statusStr = `Valid window detected`
    } else {
      retObj.insufficient = true;
      retObj.statusStr = `No valid window`
    }
  }
  return retObj;
});

function dateFormat(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hr = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const retStr = `${month}/${day} ${hr}:${min}`;
  return retStr;
}

function pcntFormat(percent: number) {
  const roundedValue = Math.round(percent * 100) / 100;
  return `${roundedValue.toFixed(2)}%`;
}
</script>
