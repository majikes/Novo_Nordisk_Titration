<template>
  <div
    v-if="
      groupComputed.includes('admin') ||
      groupComputed.includes('superadmin') ||
      groupComputed.includes('cdt overseer')
    "
    class="user-management"
  >
    <div class="control-row-header" id="header">
      <h1 class="text-2xl font-bold">User Management</h1>
    </div>
    <div class="my-8 grid grid-cols-4 gap-2" id="add-user">
      <!-- <SubjectDropdown/> -->
      <!-- <UserDropdown userType="Physician" /> -->
      <router-link
        v-if="superAdminMode"
        class="user-mgmt-btn w-full bg-gray-100"
        :to="{ name: 'AddNonParticipant' }"
      >
        Add new admin
      </router-link>
      <router-link
        v-if="adminMode"
        class="user-mgmt-btn w-full bg-gray-100"
        :to="{ name: 'AddNonParticipant' }"
      >
        Add new physician / CRC
      </router-link>
    </div>

    <div v-if="debugModeStore.debugMode">
      <!-- <div> -->
      <div>{{ groupComputed }}</div>
      <!-- <div>{{ subjectActiveStore }}</div> -->
    </div>
    <!-- <div>{{ subjectActiveStore }}</div> -->
    <!-- {{route}} -->
    <div v-if="loading">Loading...</div>
    <div v-else>
      <UserManagementList :usersupervisedbylist="usersSupervisedByList" />
    </div>
    <!-- v-for div, full span, containing 3 sub divs
      each with 1/3 span or so.
      not its own component, not isolated enough i think -->
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { api, subject_convert } from "@/functions/GlobalFunctions";
import { useApiURL } from "@/globalConfigPlugin";
import { lowerCase } from "lodash";
import { useAuthenticator } from "@aws-amplify/ui-vue";
import { useDebugModeStore } from "@/stores/debugModeStore";
import { useErrorStore } from "@/stores/ErrorStore";
import UserManagementList from "@/components/UserManagementList.vue";
import {
  type UserSupervisedByFromAPIType,
  type UserSupervisedByAPIEndpointType,
  type UserSupervisedByGroupBySuperviseeType,
} from "@/types/UserSupervisedByTypes";

const apiRootURL = useApiURL();
const auth = useAuthenticator();
const errors = useErrorStore();
const route = useRoute();
const componentName = "UserManagement";
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

const adminMode = computed(() => {
  return (
    groupComputed.value.includes("admin") ||
    groupComputed.value.includes("cdt overseer")
  );
});
const superAdminMode = computed(() => {
  return (
    groupComputed.value.includes("superadmin") ||
    groupComputed.value.includes("cdt overseer")
  );
});

// const subjectActiveStore = ref({} as any)
// const subjectLoadingStore = ref({} as any)
// const subjects = ref<any[]>([]);
// const subjectsorted = computed(() => {
//   const sortkey = adminMode.value ? "fullname" : "id";
//   return [...subjects.value].sort((a, b) => {
//     if (
//       typeof a[sortkey] !== "undefined" &&
//       typeof b[sortkey] !== "undefined"
//     ) {
//       if (a[sortkey] > b[sortkey]) {
//         return 1;
//       } else {
//         return -1;
//       }
//     } else {
//       return 1;
//     }
//   });
// });
const usersFromAPI = ref([] as UserSupervisedByFromAPIType[]);
const usersSupervisedByList = computed(() => {
  const retList = [] as UserSupervisedByGroupBySuperviseeType[];

  for (const user of usersFromAPI.value) {
    // for each of these users from the API, check if they exist in retList
    // if they do, add them to .supervisors
    // if they don't create a new entry

    // but first create a Supervisor that we can push to .supervisors as needed
    const tmpSupervisor = {
      supervisor_username: user.supervisor_username,
      supervisor_id: user.supervisor_id,
      supervisor_role_name: user.supervisor_role_name,
      active: user.active,
      site_id: user.site_id,
      site_name: user.site_name,
    }

    const index = retList.findIndex(
      (existing_user) => existing_user.supervisee_username === user.supervisee_username
    );
    if (index === -1) {
      const tmpSupervisee = {
        supervisee_username: user.supervisee_username,
        supervisee_id: user.supervisee_id,
        supervisee_role_name: user.supervisee_role_name,
        supervisors: [tmpSupervisor],
      }
      retList.push(tmpSupervisee)
    } else {
      const tmpSupervisee = retList[index]
      tmpSupervisee.supervisors.push(tmpSupervisor)
    }
  }

  return retList;
});

const error = ref(null);
const loading = ref(true);
function loadList() {
  console.log("loading user list");
  usersFromAPI.value = [] as UserSupervisedByFromAPIType[];

  let endpoint = "usersupervisedby";
  // TODO RE-ADD WITH ADMIN NOVO ENDPOINT
  const list_url = `${apiRootURL}/${endpoint}?requestor_username=${auth.user.username}&supervisor_username=${auth.user.username}`;
  console.log(`request to ${list_url}`);
  api
    .getAuth<UserSupervisedByAPIEndpointType>(list_url, tokenComputed.value)
    .then((userSupervisedByResponse: UserSupervisedByAPIEndpointType) => {
      // clear the mapping
      // TODO ADAPT MAPPING

      if (typeof userSupervisedByResponse.user_list !== "undefined") {
        usersFromAPI.value = userSupervisedByResponse.user_list;
        console.log("successful subject list request");
        console.log(userSupervisedByResponse);
      } else {
        console.log("error during request");
        console.log(userSupervisedByResponse);
        errors.errorLog(
          `${componentName}; request to ${list_url}: ${userSupervisedByResponse.message}`
        );
      }
    })
    .catch((err) => {
      error.value = err.message;
      console.log(error.value);
      errors.errorLog(
        `${componentName}; request to ${list_url}: ${err.message}`
      );
    })
    .finally(() => {
      loading.value = false;
    });
}
loadList();
</script>
