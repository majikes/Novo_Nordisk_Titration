<template>
  <div v-if="!groupComputed.includes('participant')" class="profile-history">
    <div class="control-row-header" id="header">
      <h1 class="text-2xl font-bold">Hypo History</h1>
    </div>
    <div class="flex justify-end my-1">
      <SubjectDropdown v-model="selected" />
    </div>
    <LoadingHover v-if="hyposLoading">Loading hypo history...</LoadingHover>
    <HypoTable v-else :hypos="hypoHistory" />
    <div v-if="debugModeStore.debugMode"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SubjectDropdown from "@/components/SubjectDropdown.vue";
import HypoTable from "@/components/HypoTable.vue";
import { api } from "@/functions/GlobalFunctions";
import { useApiURL } from "@/globalConfigPlugin";
import { useDebugModeStore } from "@/stores/debugModeStore";
import { useAuthenticator } from "@aws-amplify/ui-vue";
import { lowerCase } from "lodash";
import { useErrorStore } from "@/stores/ErrorStore";
import LoadingHover from "@/components/LoadingHover.vue";
import HypoFromAPIType from "@/types/HypoFromAPIType";

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
  getHypoHistory();
});

const hypoHistory = ref([] as HypoFromAPIType[]);
const hyposLoading = ref(false);

function getHypoHistory() {
  console.log("loading");
  hyposLoading.value = true;
  console.log("clearing displayed hypo history");
  hypoHistory.value = [] as HypoFromAPIType[];
  const endpoint = "gethypohistory";
  console.log(`GET request to /${endpoint}`);
  const req_url = `${apiRootURL}/${endpoint}?requestor_username=${auth.user.username}&subject_username=${selected.value}`;
  console.log(`request to ${req_url}`);
  // server response:
  // {"id":"103","date":"08/29/2023", "timeOfDayInMinutes":1340, "basalDoseValue":40}
  // const APIKEYHARDCODED = "7LiuUEWHXNMCOSZdaCS32DQPme5SYHr7JZlsVk1a";
  api
    // .getAPIKeyAuth<HypoFromAPIType[]>(req_url, APIKEYHARDCODED)
    .getAuth<HypoFromAPIType[]>(req_url, tokenComputed.value)
    .then((hypoHistoryListFromAPI: HypoFromAPIType[]) => {
      console.log("successful basal dose history request");
      console.log(hypoHistoryListFromAPI);
      hypoHistory.value = hypoHistoryListFromAPI;
    })
    .catch((err) => {
      console.log(err.message);
      errors.errorLog(
        `${componentName}; request to ${req_url}: ${err.message}`
      );
    })
    .finally(() => {
      console.log("done");
      hyposLoading.value = false;
    });
}
getHypoHistory();
</script>
