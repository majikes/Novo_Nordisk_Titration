<template>
  <div
    class="group control-row rounded-lg w-full mx-4 pt-1 pb-2 px-4 even:bg-gray-100"
  >
    <div class="user-mgmt-cell grid content-center">
      <router-link
        :to="{ name: 'AGP', params: { subjectId: participantlistitem.id } }"
      >
        {{ participantlistitem.id }}
      </router-link>
    </div>
    <div class="flex">
      <div
        class="user-mgmt-cell grid content-center justify-center"
        :class="{
          userMgmtActive: isActive && !loading,
          'text-gray-300': loading,
        }"
      >
        {{ loading ? "updating..." : statusString }}
      </div>
    </div>
    <div class="user-mgmt-cell grid content-center justify-end">
      <div v-if="disabled" class="text-gray-300">disabled</div>
      <select
        v-else
        class="activity-select-input"
        name="status-control"
        :id="`status-control-select-${participantlistitem.id}`"
        v-model="active"
        :disabled="loading"
        @change="updateActiveStatus"
      >
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.text }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, defineProps, PropType, ref } from "vue";
import { useRoute } from "vue-router";
import { useApiURL } from "@/globalConfigPlugin";
import { api } from "@/functions/GlobalFunctions";
import { useAuthenticator } from "@aws-amplify/ui-vue";
import { useDebugModeStore } from "@/stores/debugModeStore";
import { useErrorStore } from "@/stores/ErrorStore";
import ParticipantListItem from "@/types/ParticipantListItem";
import { lowerCase } from "lodash";

const props = defineProps({
  participantlistitem: {
    required: true,
    type: Object as PropType<ParticipantListItem>,
  },
  disabled: {
    required: false,
    type: Boolean as PropType<boolean>,
  },
});
const apiRootURL = useApiURL();
const auth = useAuthenticator();
const errors = useErrorStore();
const route = useRoute();
const componentName = "UserManagementListItem";
const debugModeStore = useDebugModeStore();
// let groups = ref([] as string[])
// if (typeof (auth.user.signInUserSession.idToken.payload["cognito:groups"]) !== 'undefined') {
//   groups.value = auth.user.signInUserSession.idToken.payload["cognito:groups"].map(lowerCase)
// }
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

const options = ref([
  { text: "active", value: 1 },
  { text: "inactive", value: 0 },
  // { text: 'unknown', value: -1 }
]);

const active = ref(props.participantlistitem.active);
const statusString = computed(() => {
  if (active.value === 1) {
    return "active";
  } else if (active.value === 0) {
    return "inactive";
  } else {
    return "unknown";
  }
});
const isActive = computed(() => {
  return active.value === 1;
});
const displayName = computed(() => {
  return props.participantlistitem.id;
});
// const computedActive = computed(() => { return lowerCase(status.value) === 'active' })

// Updating status of Phy/Crc/Participant is not refreshing the UI even-though the db is getting updated and sending correct response to the frontend
// 'pedapai' is being sent as projectname to most of the endpoints. I hardcoded 'novonordisktitration' in lambda functions to test user management pages. It has to be changed
// Couldn't verify 'SuperAdmin' adding 'Admin' because its not displaying the 'Management' tab/screen
// Admin (gSantini) login is displaying 'Physician mgmt' and also 'Participant mgmt' tabs
// Basal History page doesn't exist so couldn't test it

const loading = ref(false);
const updateMsg = ref(null);
function updateActiveStatus() {
  updateMsg.value = null;
  const selectedStatus = active.value === 1; // ? '1' : '0'
  const selectedId = props.participantlistitem.id;
  loading.value = true;
  console.log(`${selectedId}: ${selectedStatus}`);

  // const oldStatus = selectedStatus === '1' ? '0' : '1'
  const oldStatus = !selectedStatus;
  // basically a flag that we check at .finally() to see if we need to swap back
  let updateEndpoint = "updateparticipantstatus";
  let idparam = "subject_id";
  const req_url = `${apiRootURL}/${updateEndpoint}?username=${auth.user.username}&status_type=active&${idparam}=${selectedId}&new_active_status=${selectedStatus}&old_active_status=${oldStatus}`;
  api
    .getAuth<any[]>(req_url, tokenComputed.value)
    .then((response: any) => {
      console.log("active status change");
      console.log(response);
      if (
        typeof response.ttest !== "undefined" &&
        typeof response.ttest.result !== "undefined" &&
        typeof response.ttest.message !== "undefined"
      ) {
        // if (response.update_success !== -1) {
        //   toggleChange = true
        // }
        console.log(response.ttest.message);
        if (!response.ttest.result) {
          errors.errorLog(
            `${componentName}; tandem connect test for subject ${selectedId}: ${response.ttest.message}`
          );
        }
        updateMsg.value = response.ttest.message;
      }
      let response_content = {} as any;
      if (typeof response.body !== "undefined") {
        response_content = JSON.parse(response.body);
      } else {
        response_content = response;
      }
      console.log(response_content);
      if (typeof response_content.update_success !== "undefined") {
        if (response_content.update_success === -1) {
          errors.errorLog(
            `${componentName}; error updating user ${displayName.value}`,
            true
          );
        }
        active.value = response_content.active_status_db;
      }
    })
    .catch((err) => {
      console.log(err.message);
      errors.errorLog(
        `${componentName}; request to ${req_url}: ${err.message}`
      );
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>
