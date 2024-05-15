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
      <div>
        <span class="font-semibold">sortVarBackend:</span> {{ sortVarBackend }}
      </div>
      <div>
        <span class="font-semibold">sortDirsInfo:</span> {{ sortDirsInfo }}
      </div>
      <!-- <div>usersSupervisedByListSorted: {{ usersSupervisedByListSorted }}</div>
      <div>usersSupervisedByListModifiable: {{ usersSupervisedByListModifiable }}</div> -->
      <!-- <div>{{ subjectActiveStore }}</div> -->
    </div>
    <!-- <div>{{ subjectActiveStore }}</div> -->
    <!-- {{route}} -->
    <div v-if="loading">Loading...</div>
    <div v-else>
      <!-- user mgmt header, not sure why i like splitting this up -->
      <div class="user-mgmt-table-header-row">
        <div
          class="flex justify-between font-bold px-4 hover:bg-gray-300 rounded-md"
          id="usr-supervisee-header"
          @click="toggleSort('username')"
        >
          <div>User</div>
          <SortDirArrow
            :desc="sortDirsDesc.username"
            :visible="sortDirsVisible.username"
          />
        </div>
        <div
          class="flex justify-between font-bold px-4 hover:bg-gray-300 rounded-md"
          id="usr-role-header"
          @click="toggleSort('role')"
        >
          <div>Role</div>
          <SortDirArrow
            :desc="sortDirsDesc.role"
            :visible="sortDirsVisible.role"
          />
        </div>
        <div class="font-bold px-4" id="usr-site-header">Site</div>
        <div class="font-bold px-4" id="usr-supervisors-header">Supervisors</div>
        <div class="font-bold px-4" id="sup-role-header">Role</div>
        <div class="font-bold px-4" id="sup-site-header">Site</div>
        <div class="font-bold px-4" id="sup-active-header">Status</div>
      </div>
      <UserManagementList
        :usersupervisedbylist="usersSupervisedByListOriginal"
        :addablesupervisors="supervisorsFromAPI"
        :disabled="userListDisabled"
        :editmode="userListEditable"
        :sortdirsinfo="sortDirsInfo"
        v-model:modifiablesupervisedbylist="usersSupervisedByListModifiable"
      />
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
import { cloneDeep, lowerCase } from "lodash";
import { useAuthenticator } from "@aws-amplify/ui-vue";
import { useDebugModeStore } from "@/stores/debugModeStore";
import { useErrorStore } from "@/stores/ErrorStore";
import UserManagementList from "@/components/UserManagementList.vue";
import SortDirArrow from "@/components/SortDirArrow.vue";
import {
  type UserSupervisedByFromAPIType,
  type UserSupervisedByAPIEndpointType,
  type UserSupervisedByGroupBySuperviseeType,
  type USBGFrontendSortType,
  Supervisee,
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

const usersFromAPI = ref([] as UserSupervisedByFromAPIType[]);
const supervisorsFromAPI = ref([] as Supervisee[]);

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
      supervisor_site_id: user.supervisor_site_id,
      supervisor_site_name: user.supervisor_site_name,
    };

    const index = retList.findIndex(
      (existing_user) =>
        existing_user.supervisee_username === user.supervisee_username
    );
    if (index === -1) {
      const tmpSupervisee = {
        supervisee_username: user.supervisee_username,
        supervisee_id: user.supervisee_id,
        supervisee_role_name: user.supervisee_role_name,
        supervisee_site_id: user.supervisee_site_id,
        supervisee_site_name: user.supervisee_site_name,
        supervisors: [tmpSupervisor],
      } as UserSupervisedByGroupBySuperviseeType;
      retList.push(tmpSupervisee);
    } else {
      const tmpSupervisee = retList[index];
      tmpSupervisee.supervisors.push(tmpSupervisor);
    }
  }

  return retList;
});

const usersSupervisedByListModifiable = ref(
  [] as UserSupervisedByGroupBySuperviseeType[]
);
const usersSupervisedByListOriginal = ref(
  [] as UserSupervisedByGroupBySuperviseeType[]
);
watch(usersSupervisedByList, () => {
  console.log(`change to usersSupervisedByList detected`);
  // console.log(`subjectIdStore: ${subjectIdStore.subjectId}`)
  usersSupervisedByListModifiable.value = cloneDeep(
    usersSupervisedByList.value
  );
  usersSupervisedByListOriginal.value = cloneDeep(usersSupervisedByList.value);
  sortLists();
});
// TODO
// DONE watch usersSupervisedByList and create a ref version that's editable
// DONE v-model to UserManagementList component
// DONE fix sorting
// DONE fix status display as modified
// add supervisor feature
//  - button placement
//  - dropdown should only list available supervisors - already assigned supervisors
//  - that should be a computed list
//  - if len(that list) == 0, don't show anything in the dropdown
// supervisor display as added (like red border around "active" dropdown)
// computed array (probably UserSupervisedByFromAPIType[]) that represents
//  diff between original and modified
//  - should be in this file, not the list
//  - on our end, try to figure out if a supervisor is being added or just modified
//  - on backend still be safe about things and check if a supervisor already 
//    exists for a given user, then decide whether to UPDATE or INSERT
// 
// whenever we make a change (activate / deactivate / add / remove) (maybe not remove actually)
// don't auto-change in DB
// instead have an "apply changes" button that takes the diff of the two and only
// sends those changes to the backend
// include "are you sure / confirm" popup
// force page reload on change apply
// include rules that restrict the SUPERADMIN -> ADMIN -> PHYS/CRC -> PARTICIPANT hierarchy
// maybe also SUPERADMIN -> ALL TECHNICAL / OVERSEER STUFF (CDT PREFIX?)
// add something that also gets all site supervisors that make sense for the current user (for adding)
// (might just be part of original call, lambda is doing tons already)

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
const sortVar = ref("username");
const sortVars = ["username", "role"];
const sortVarMap = {
  username: "supervisee_username",
  role: "supervisee_role_name",
} as any;
const sortVarBackend = computed(() => {
  let retStr = "supervisee_username";
  for (const [key, value] of Object.entries(sortVarMap)) {
    if (sortVar.value === key) {
      retStr = String(value);
    }
  }
  console.log(`sortVarBackend change: ${retStr}`);
  return retStr;
});
const sortDirsDesc = ref({
  username: true,
  role: true,
} as any);
const sortDirsVisible = ref({
  username: true,
  role: false,
} as any);
const sortDirsInfo = computed(() => {
  return {
    sortDirsDesc: sortDirsDesc.value,
    sortDirsVisible: sortDirsVisible.value,
  } as USBGFrontendSortType;
});

function toggleSort(toggleVar: string) {
  // first actually modify sort variables
  console.log(`toggleSort on ${toggleVar}`);
  if (
    sortVars.includes(toggleVar) &&
    Object.keys(sortDirsDesc.value).includes(toggleVar) &&
    Object.keys(sortDirsVisible.value).includes(toggleVar)
  ) {
    console.log("valid toggleVar");
    sortVar.value = toggleVar;

    for (const key of Object.keys(sortDirsDesc.value)) {
      if (key === toggleVar) {
        if (sortDirsVisible.value[key]) {
          sortDirsDesc.value[key] = !sortDirsDesc.value[key];
        }
        console.log(`sorting on ${key}; desc sort: ${sortDirsDesc.value[key]}`);
      }
    }
    for (const key of Object.keys(sortDirsVisible.value)) {
      sortDirsVisible.value[key] = key === toggleVar;
    }
  }
  // then sort the lists
  sortLists();
}

function sortLists() {
  // sorting ref()s in place, hopefully this will fix all the readonly
  // computed() woes
  const compareFn = (a: any, b: any) => {
    const aValue = a[sortVarBackend.value];
    const bValue = b[sortVarBackend.value];
    const directionality = sortDirsDesc.value[sortVar.value] ? -1 : 1;

    if (aValue > bValue) {
      return 1 * directionality;
    } else if (aValue < bValue) {
      return -1 * directionality;
    } else {
      return 0;
    }
  };

  // Sort modifiable list
  usersSupervisedByListModifiable.value.sort(compareFn);
  // Sort original list
  usersSupervisedByListOriginal.value.sort(compareFn);

  // usersSupervisedByListModifiable.value.sort((a, b) => {
  //   if (
  //     typeof (a as any)[sortVarBackend.value] !== "undefined" &&
  //     typeof (b as any)[sortVarBackend.value] !== "undefined"
  //   ) {
  //     let directionality = 1;
  //     if (typeof sortDirsDesc.value[sortVar.value] !== "undefined") {
  //       directionality = sortDirsDesc.value[sortVar.value] ? -1 : 1;
  //     }
  //     if ((a as any)[sortVarBackend.value] > (b as any)[sortVarBackend.value]) {
  //       return 1 * directionality;
  //     } else {
  //       return -1 * directionality;
  //     }
  //   } else {
  //     return 1;
  //   }
  // });
  // // ...then same thing for orig, computed() not firing unless called
  // usersSupervisedByListOriginal.value.sort((a, b) => {
  //   if (
  //     typeof (a as any)[sortVarBackend.value] !== "undefined" &&
  //     typeof (b as any)[sortVarBackend.value] !== "undefined"
  //   ) {
  //     let directionality = 1;
  //     if (typeof sortDirsDesc.value[sortVar.value] !== "undefined") {
  //       directionality = sortDirsDesc.value[sortVar.value] ? -1 : 1;
  //     }
  //     if ((a as any)[sortVarBackend.value] > (b as any)[sortVarBackend.value]) {
  //       return 1 * directionality;
  //     } else {
  //       return -1 * directionality;
  //     }
  //   } else {
  //     return 1;
  //   }
  // });

  console.log(
    "usersSupervisedByListModifiable:",
    usersSupervisedByListModifiable.value
  );
  console.log(
    "usersSupervisedByListOriginal:",
    usersSupervisedByListOriginal.value
  );
}
// const sortDirDesc = ref(true);
// function reverseSortDir() {
//   sortDirDesc.value = !sortDirDesc.value;
// }
// const sortedBySelected = computed(() => {
//   return [...sortedById.value].sort((a, b) => {
//     if (
//       typeof (a as any)[sortVar.value] !== "undefined" &&
//       typeof (b as any)[sortVar.value] !== "undefined"
//     ) {
//       const directionality = sortDirDesc.value ? -1 : 1;
//       if ((a as any)[sortVar.value] > (b as any)[sortVar.value]) {
//         return 1 * directionality;
//       } else {
//         return -1 * directionality;
//       }
//     } else {
//       return 1;
//     }
//   });
// });
// usersSupervisedByList
// usersSupervisedByListModifiable
// const usersSupervisedByListPreSorted
// const usersSupervisedByListSorted = computed(() => {
//   const retList = cloneDeep(usersSupervisedByList.value);
//   return retList.sort((a, b) => {
//     if (
//       typeof (a as any)[sortVarBackend.value] !== "undefined" &&
//       typeof (b as any)[sortVarBackend.value] !== "undefined"
//     ) {
//       let directionality = 1;
//       if (typeof sortDirsDesc.value[sortVar.value] !== "undefined") {
//         directionality = sortDirsDesc.value[sortVar.value] ? -1 : 1;
//       }
//       if ((a as any)[sortVarBackend.value] > (b as any)[sortVarBackend.value]) {
//         return 1 * directionality;
//       } else {
//         return -1 * directionality;
//       }
//     } else {
//       return 1;
//     }
//   });
// });
// const usersSupervisedByListModifiablePreSorted
// const usersSupervisedByListModifiableSorted = computed(() => {
//   const retList = cloneDeep(usersSupervisedByListModifiable.value);
//   return retList.sort((a, b) => {
//     if (
//       typeof (a as any)[sortVarBackend.value] !== "undefined" &&
//       typeof (b as any)[sortVarBackend.value] !== "undefined"
//     ) {
//       let directionality = 1;
//       if (typeof sortDirsDesc.value[sortVar.value] !== "undefined") {
//         directionality = sortDirsDesc.value[sortVar.value] ? -1 : 1;
//       }
//       if ((a as any)[sortVarBackend.value] > (b as any)[sortVarBackend.value]) {
//         return 1 * directionality;
//       } else {
//         return -1 * directionality;
//       }
//     } else {
//       return 1;
//     }
//   });
// });

const error = ref(null);
const loading = ref(true);
function loadList() {
  console.log("loading user list");
  usersFromAPI.value = [] as UserSupervisedByFromAPIType[];
  supervisorsFromAPI.value = [] as Supervisee[];

  let endpoint = "usersupervisedby";
  // TODO RE-ADD WITH ADMIN NOVO ENDPOINT
  const list_url = `${apiRootURL}/${endpoint}?requestor_username=${auth.user.username}&supervisor_username=${auth.user.username}`;
  console.log(`request to ${list_url}`);
  api
    .getAuth<UserSupervisedByAPIEndpointType>(list_url, tokenComputed.value)
    .then((userSupervisedByResponse: UserSupervisedByAPIEndpointType) => {
      // clear the mapping
      // TODO ADAPT MAPPING

      if (
        typeof userSupervisedByResponse.user_list !== "undefined" &&
        typeof userSupervisedByResponse.supervisor_list !== "undefined"
      ) {
        usersFromAPI.value = userSupervisedByResponse.user_list;
        supervisorsFromAPI.value = userSupervisedByResponse.supervisor_list;
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

const userListDisabled = ref(false);
const userListEditable = ref(true);
</script>
