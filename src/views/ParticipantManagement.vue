<template>
  <div class="user-management">
    <div class="control-row-header" id="header">
      <h1 class="text-2xl font-bold">Participant Management</h1>
    </div>
    <div class="my-8 grid grid-cols-4 gap-2" id="add-user">
      <!-- <SubjectDropdown/> -->
      <!-- <UserDropdown userType="Physician" /> -->
      <router-link
        class="user-mgmt-btn w-full bg-gray-100"
        :to="{ name: 'AddParticipant' }"
      >
        Add new participant
      </router-link>
    </div>

    <div
      class="grid grid-cols-3 force-center-content my-4 px-4 py-2 rounded-lg bg-gray-200"
    >
      <div class="user-mgmt-cell" id="id-header">
        <strong class="px-2">ID</strong>
      </div>
      <div class="user-mgmt-cell flex justify-center" id="status-header">
        <strong>Status</strong>
      </div>
      <div class="user-mgmt-cell flex justify-end" id="status-control-header">
        <strong class="px-2">Status Control</strong>
      </div>
    </div>
    <div v-if="debugModeStore.debugMode">
      <!-- <div> -->
      <div>{{ groupComputed }}</div>
      <div>{{ subjectsorted }}</div>
      <div>physCRCMode: {{ physCRCMode }}</div>
      <!-- <div>{{ subjectActiveStore }}</div> -->
    </div>
    <!-- <div>{{ subjectActiveStore }}</div> -->
    <!-- {{route}} -->
    <div v-if="loading">Loading...</div>
    <ParticipantManagementList v-else :participantlistitems="subjectsorted" />
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
import ParticipantManagementList from "@/components/ParticipantManagementList.vue";

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

const physCRCMode = computed(() => {
  return (
    groupComputed.value.includes("physician") ||
    groupComputed.value.includes("crc")
  );
});

// const subjectActiveStore = ref({} as any)
// const subjectLoadingStore = ref({} as any)
const subjects = ref<any[]>([]);
const subjectsorted = computed(() => {
  const sortkey = "id";
  return [...subjects.value].sort((a, b) => {
    if (
      typeof a[sortkey] !== "undefined" &&
      typeof b[sortkey] !== "undefined"
    ) {
      if (a[sortkey] > b[sortkey]) {
        return 1;
      } else {
        return -1;
      }
    } else {
      return 1;
    }
  });
});

const error = ref(null);
const loading = ref(true);
function loadList() {
  console.log("loading subject list");
  subjects.value = [];

  let endpoint = "getparticipantidssupervisedbytheuser";

  const list_url = `${apiRootURL}/${endpoint}?username=${auth.user.username}`;
  console.log(`request to ${list_url}`);
  api
    .getAuth<any[]>(list_url, tokenComputed.value)
    .then((subjectlist: any[]) => {
      // clear the mapping
      // TODO ADAPT MAPPING
      console.log("successful subject list request");
      console.log(subjectlist);
      // subjectActiveStore.value = {}
      // subjectLoadingStore.value = {}
      // const true_subjectlist: Subject[] = subjectlist.map(subject_convert)
      // console.log(true_subjectlist)
      //
      if (endpoint === "getassignedusers") {
        for (const user of subjectlist) {
          const tmpUser = {
            id: -1,
            fname: "",
            lname: "",
            fullname: "",
            role: "",
            active: -1,
          };
          tmpUser.id = user[0];
          tmpUser.fname = user[1];
          tmpUser.lname = user[2];
          tmpUser.fullname = `${user[1]} ${user[2]}`;
          tmpUser.active = user[3];
          tmpUser.role = user[4];
          subjects.value.push(tmpUser);
        }
      } else {
        for (const subj of subjectlist) {
          const tmpUser = {
            id: "",
            active: -1,
          };
          tmpUser.id = subj["id"];
          tmpUser.active = subj["active"];
          subjects.value.push(tmpUser);
        }
      }
      // for (const subject of subjects.value) {
      //   subjectActiveStore.value[subject.id] = subject.active === 1 ? 'active' : 'inactive'
      //   subjectLoadingStore.value[subject.id] = false
      // }
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
