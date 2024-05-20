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
    <div class="mt-8 grid grid-cols-4 gap-2" id="add-user">
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

    <!-- user management controls -->
    <div class="my-3 flex justify-end gap-2" id="mgmt-controls-top">
      <!-- reset button -->
      <div
        class="add-supervisor-btn"
        :class="resetButtonObj"
        @click="resetChanges"
      >
        Reset changes
      </div>
      <!-- save changes button -->
      <div
        class="add-supervisor-btn"
        :class="saveButtonObj"
        @click="showSaveModal"
      >
        Save changes
      </div>
    </div>

    <!-- some random debug stuff -->
    <div v-if="debugModeStore.debugMode">
      <!-- <div> -->
      <div>{{ groupComputed }}</div>
      <div>
        <span class="font-semibold">sortVarBackend:</span> {{ sortVarBackend }}
      </div>
      <div>
        <span class="font-semibold">sortDirsInfo:</span> {{ sortDirsInfo }}
      </div>
      <div>
        <span class="font-semibold">modifiedSupervisorsList:</span>
        {{ modifiedSupervisorsList }}
      </div>
      <div>
        <span class="font-semibold">addedSupervisorsList:</span>
        {{ addedSupervisorsList }}
      </div>
      <!-- <div>usersSupervisedByListSorted: {{ usersSupervisedByListSorted }}</div>
      <div>usersSupervisedByListModifiable: {{ usersSupervisedByListModifiable }}</div> -->
      <!-- <div>{{ subjectActiveStore }}</div> -->
    </div>

    <!-- save changes modal -->
    <AddSupervisorSaveChangesModal
      v-if="saveModalVisible"
      :update-changes-loading="postSupervisorsLoading"
      :modifiedsupervisedbylist="modifiedSupervisorsList"
      :addedsupervisedbylist="addedSupervisorsList"
      @cancel-click="hideSaveModal"
      @confirm-click="postSupervisors"
    />

    <!-- user list -->
    <!-- <div>{{ subjectActiveStore }}</div> -->
    <!-- {{route}} -->
    <!-- <div v-if="loading">Loading...</div> -->
    <div>
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
        <div class="font-bold px-4" id="usr-supervisors-header">
          Supervisors
        </div>
        <div class="font-bold px-4" id="sup-role-header">Role</div>
        <div class="font-bold px-4" id="sup-site-header">Site</div>
        <div class="font-bold px-4" id="sup-active-header">Status</div>
      </div>
      <UserManagementList
        :usersupervisedbylist="usersSupervisedByListOriginal"
        :addablesupervisors="supervisorsFromAPI"
        :disabled="userListDisabled"
        :editmode="userListEditable"
        :loading="userListLoading"
        :sortdirsinfo="sortDirsInfo"
        v-model:modifiedsupervisedbylist="modifiedSupervisorsList"
        v-model:addedsupervisedbylist="addedSupervisorsList"
        v-model:modifiablesupervisedbylist="usersSupervisedByListModifiable"
      />
    </div>

    <!-- user management controls bottom -->
    <div
      v-if="!userListLoading"
      class="my-3 flex justify-end gap-2"
      id="mgmt-controls-top"
    >
      <!-- reset button -->
      <div
        class="add-supervisor-btn"
        :class="resetButtonObj"
        @click="resetChanges"
      >
        Reset changes
      </div>
      <!-- save changes button -->
      <div
        class="add-supervisor-btn"
        :class="saveButtonObj"
        @click="showSaveModal"
      >
        Save changes
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onMounted,
  ref,
  watch,
} from "vue";
import { useRoute } from "vue-router";
import { api, subject_convert } from "@/functions/GlobalFunctions";
import { useApiURL } from "@/globalConfigPlugin";
import { cloneDeep, lowerCase } from "lodash";
import { useAuthenticator } from "@aws-amplify/ui-vue";
import { useDebugModeStore } from "@/stores/debugModeStore";
import { useErrorStore } from "@/stores/ErrorStore";
import UserManagementList from "@/components/UserManagementList.vue";
import AddSupervisorSaveChangesModal from "@/components/AddSupervisorSaveChangesModal.vue";
import SortDirArrow from "@/components/SortDirArrow.vue";
import {
  type UserSupervisedByFromAPIType,
  type UserSupervisedByAPIEndpointType,
  type UserSupervisedByGroupBySuperviseeType,
  type USBGFrontendSortType,
  type Supervisee,
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

const modifiedSupervisorsList = ref([] as UserSupervisedByFromAPIType[]);
const addedSupervisorsList = ref([] as UserSupervisedByFromAPIType[]);

const modificationsMade = computed(() => {
  return (
    modifiedSupervisorsList.value.length > 0 ||
    addedSupervisorsList.value.length > 0
  );
});

// TODO
// DONE watch usersSupervisedByList and create a ref version that's editable
// DONE v-model to UserManagementList component
// DONE fix sorting
// DONE fix status display as modified
// add supervisor feature
//  - DONE (mostly) button placement
//  - DONE "add new supervisor" tooltip
//  - DONE @click event
//    - CANCEL add supervisor with dummy values
//  - CANCEL dropdown to select new supervisor
//  - modal to select new supervisor
//  - dropdown should only list available supervisors - already assigned supervisors
//  - that should be a computed list (list of objects, or list of lists,
//     both map to whatever it's called. the main list.)
//  - if len(that list) == 0, don't show anything in the dropdown
//    - also grey out (disabled prop) add button
//      - "no more available supervisors" tooltip
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
  if (!userListDisabled.value) {
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
          console.log(
            `sorting on ${key}; desc sort: ${sortDirsDesc.value[key]}`
          );
        }
      }
      for (const key of Object.keys(sortDirsVisible.value)) {
        sortDirsVisible.value[key] = key === toggleVar;
      }
    }
    // then sort the lists
    sortLists();
  } else {
    console.log('list interactions disabled...')
  }
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

  console.log(
    "usersSupervisedByListModifiable:",
    usersSupervisedByListModifiable.value
  );
  console.log(
    "usersSupervisedByListOriginal:",
    usersSupervisedByListOriginal.value
  );
}

const error = ref(null);
const userListLoading = ref(true);
function loadList() {
  console.log("loading user list");
  userListLoading.value = true
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
      userListLoading.value = false;
    });
}
loadList();

function resetChanges() {
  if (!buttonsDisabled.value) {
    console.log("resetting to original list");
    usersSupervisedByListModifiable.value = cloneDeep(
      usersSupervisedByListOriginal.value
    );
  }
}

const saveModalVisible = ref(false);
function showSaveModal() {
  if (!buttonsDisabled.value) {
    console.log("opening save modal");
    saveModalVisible.value = true;
  }
}
function hideSaveModal() {
  saveModalVisible.value = false;
}

// const pageReloader = ref(0);
const postSupervisorsErrors = ref(null);
const postSupervisorsLoading = ref(false);
function postSupervisors() {
  // console.log('modifiedSupervisorsList:',modifiedSupervisorsList.value)
  // console.log('addedSupervisorsList:',addedSupervisorsList.value)
  postSupervisorsLoading.value = true;
  const requestObj = {
    requestor: {
      username: auth.user.username,
      role: groupComputed.value[0],
    },
    added_supervisors: addedSupervisorsList.value,
    modified_supervisors: modifiedSupervisorsList.value,
    project: "novonordisktitration",
  };
  console.log("attempting to send changes to user_supervised_by to backend...");
  const endpoint = "usersupervisedby";
  const req_url = `${apiRootURL}/${endpoint}?requestor_username=${auth.user.username}`;
  // console.log(`POST request to /${endpoint}`);
  console.log(`POST request to ${req_url}`);
  api
    .postAuth<any, any>(
      req_url,
      tokenComputed.value,
      JSON.stringify(requestObj)
    )
    .then((response: any) => {
      console.log(response);
      // only hide modal on success?
      hideSaveModal();
      // ...and also reload the list
      loadList();
    })
    .catch((err) => {
      console.log(err.message);
      postSupervisorsErrors.value = err.message;
      errors.errorLog(
        `${componentName}; request to ${req_url}: ${err.message}`,
        true
      );
    })
    .finally(() => {
      postSupervisorsLoading.value = false;
    });
  // if success

  // pageReloader.value += 1;
  // console.log(`keyval: ${pageReloader.value}`)
  // const instance = getCurrentInstance();
  // instance.proxy.forceUpdate();
}

// const userListDisabled = ref(false);
const userListDisabled = computed(() => {
  return saveModalVisible.value
})
const userListEditable = ref(true);

const buttonsDisabled = computed(() => {
  if (!userListDisabled.value) {
    return !modificationsMade.value 
  } else {
    return true
  }
})
const resetButtonObj = computed(() => {
  const retObj = {
    "bg-gray-100 border-amber-300 hover:border-white hover:bg-amber-300 hover:text-white":
    !buttonsDisabled.value,
    "text-gray-400 bg-gray-100 border-transparent": buttonsDisabled.value,
  };
  return retObj;
});
const saveButtonObj = computed(() => {
  const retObj = {
    "bg-gray-100 border-emerald-300 hover:border-white hover:bg-emerald-300 hover:text-white":
    !buttonsDisabled.value,
    "text-gray-400 bg-gray-100 border-transparent": buttonsDisabled.value,
  };
  return retObj;
});
</script>
