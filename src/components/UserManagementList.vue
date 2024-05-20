<template>
  <div class="col-span-6">
    <div v-if="debugModeStore.debugMode">
      <div>
        <span class="font-semibold"
          >usersupervisedbylist === modifiablesupervisedbylist:</span
        >
        {{ isEqual(usersupervisedbylist, modifiablesupervisedbylist) }}
      </div>
      <div>
        <span class="font-semibold">modifiedSupervisorsList:</span>
        {{ modifiedSupervisorsList }}
      </div>
      <div>
        <span class="font-semibold">newSupervisorsList:</span>
        {{ newSupervisorsList }}
      </div>
      <!-- <div>
        <span class="font-semibold">modifiedSupervisorsMatrix:</span>
        {{ modifiedSupervisorsMatrix }}
      </div> -->
      <!-- <div><span class="font-semibold">usersupervisedbylist:</span> {{ usersupervisedbylist }}</div> -->
      <!-- <div><span class="font-semibold">modifiablesupervisedbylist:</span> {{ modifiablesupervisedbylist }}</div> -->
    </div>
    <div
      v-for="(supervisee, index) in modifiablesupervisedbylist"
      :key="index"
      class="user-mgmt-table-simple-row"
    >
      <div class="px-4 py-1">
        <div class="user-mgmt-cell">{{ supervisee.supervisee_username }}</div>
      </div>
      <div class="px-4 py-1">
        <div class="user-mgmt-cell">{{ supervisee.supervisee_role_name }}</div>
      </div>
      <div class="px-4 py-1">
        <div class="user-mgmt-cell">{{ supervisee.supervisee_site_name }}</div>
      </div>
      <div class="col-span-4 relative">
        <AddSupervisorModal
          v-if="addSupervisorModalVisible[index]"
          @cancel-click="hideAddSupervisorModal(supervisee, index)"
          @confirm-click="addSupervisors"
          :index="index"
          :supervisee="supervisee"
          :supervisoroptions="addableSupervisorsBySupervisee[index]"
        />
        <div
          v-if="debugModeStore.debugMode"
          class="absolute top-1 right-1 z-20 text-xs text-red-400"
        >
          <div v-if="addSupervisorModalVisible[index]">
            <div>showmodal</div>
            <div class="text-black">
              {{ addableSupervisorsBySupervisee[index] }}
            </div>
          </div>
        </div>
        <div
          v-for="(supervisor, index2) in supervisee.supervisors"
          :key="index2"
          class="border my-0.5 rounded-md grid grid-cols-4"
          :class="{
            'border-emerald-300': newSupervisorsMatrix[index][index2],
            'border-transparent': !newSupervisorsMatrix[index][index2],
          }"
        >
          <div class="px-4 user-mgmt-cell relative">
            {{ supervisor.supervisor_username }}
            <AddSupervisorPlusIcon
              v-if="index2 === supervisee.supervisors.length - 1"
              :disabled="addSupervisorsBySuperviseeDisabled[index] || disabled"
              :evenrow="index % 2 === 0"
              @add-supervisor-click="showAddSupervisorModal(supervisee, index)"
            />
          </div>
          <div class="px-4 user-mgmt-cell">
            {{ supervisor.supervisor_role_name }}
          </div>
          <div class="px-4 user-mgmt-cell">
            {{ supervisor.supervisor_site_name }}
          </div>
          <!-- <div class="px-4">{{ supervisor.active }}</div> -->
          <div class="relative px-4 user-mgmt-cell text-sm">
            <select
              name="active"
              :id="`${supervisee.supervisee_username}-${supervisor.supervisor_username}-active-select`"
              v-model="supervisor.active"
              class="user-mgmt-active-dropdown"
              :class="{
                'user-mgmt-modified': modifiedSupervisorsMatrix[index][index2],
              }"
              :disabled="disabled"
            >
              <option
                v-for="(active_option, index3) in activeOptions"
                :key="index3"
                :value="active_option.value"
              >
                {{ active_option.text }}
              </option>
            </select>
            <AddSupervisorMinusIcon
              v-if="newSupervisorsMatrix[index][index2]"
              :evenrow="index % 2 === 0"
              @remove-supervisor-click="removeSupervisor(supervisee, index, index2)"
            />
          </div>
        </div>
      </div>
      <!-- <div class="px-4">{{ supervisee.supervisee_username }}</div>
      <div class="px-4">{{ supervisee.supervisee_username }}</div>
      <div class="px-4">{{ supervisee.supervisee_username }}</div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineModel, PropType, ref, watch } from "vue";
import {
  type UserSupervisedByGroupBySuperviseeType,
  type Supervisee,
  type Supervisor,
  type USBGFrontendSortType,
  type UserSupervisedByFromAPIType,
} from "@/types/UserSupervisedByTypes";
import AddSupervisorPlusIcon from "@/components/AddSupervisorPlusIcon.vue";
import AddSupervisorMinusIcon from "@/components/AddSupervisorMinusIcon.vue";
import AddSupervisorModal from "@/components/AddSupervisorModal.vue";
import { cloneDeep, isEqual } from "lodash";
import { useDebugModeStore } from "@/stores/debugModeStore";
import { useErrorStore } from "@/stores/ErrorStore";
import {
  supervisorToSupervisee,
  superviseeToSupervisor,
} from "@/functions/GlobalFunctions";

const props = defineProps({
  usersupervisedbylist: {
    required: true,
    type: Array as PropType<UserSupervisedByGroupBySuperviseeType[]>,
  },
  sortdirsinfo: {
    required: true,
    type: Object as PropType<USBGFrontendSortType>,
  },
  addablesupervisors: {
    required: true,
    type: Array as PropType<Supervisee[]>,
  },
  disabled: {
    required: true,
    type: Boolean as PropType<boolean>,
  },
  editmode: {
    required: true,
    type: Boolean as PropType<boolean>,
  },
});

const modifiablesupervisedbylist = defineModel<
  UserSupervisedByGroupBySuperviseeType[]
>("modifiablesupervisedbylist");
const modifiedsupervisedbylist = defineModel<
  UserSupervisedByFromAPIType[]
>("modifiedsupervisedbylist");
const addedsupervisedbylist = defineModel<
  UserSupervisedByFromAPIType[]
>("addedsupervisedbylist");

const errors = useErrorStore();
const debugModeStore = useDebugModeStore();

// TODO
// make new computed that, given appropriate indices, tracks
// if user is new
// if user active status is new
const modifiedSupervisorsMatrix = computed(() => {
  // TODO props.addablesupervisors.length IS DANGEROUS!!!!!
  // DUPLICATES CAN EXIST IN DB
  // MAKE THIS MAX OF ADDABLESUPERVISORS.LENGTH AND LONGEST SUPERVISORS
  // const maxSupervisors = new Array(props.addablesupervisors.length).fill(false);
  // const retArr = new Array(modifiablesupervisedbylist.value?.length).fill(cloneDeep(maxSupervisors));
  const retArr = new Array(modifiablesupervisedbylist.value?.length) as boolean[][];
  for (let i = 0; i < retArr.length; i++) {
    retArr[i] = new Array(props.addablesupervisors.length).fill(false);
  }

  if (modifiablesupervisedbylist.value) {
    for (const [
      index,
      supervisee,
    ] of modifiablesupervisedbylist.value?.entries()) {
      // boolean row for current supervisee
      // const superviseeBools = [] as boolean[]

      const origSupervisee = props.usersupervisedbylist[index];
      for (const [index2, supervisor] of supervisee.supervisors.entries()) {
        if (index2 < origSupervisee.supervisors.length) {
          if (
            // lol needed string casting here because args come in as numbers
            // but the moment you make a selection they become strings
            // (facepalm)
            String(origSupervisee.supervisors[index2].active) !==
            String(supervisor.active)
          ) {
            retArr[index][index2] = true;
          } else {
            retArr[index][index2] = false;
          }
        }
      }

      // then push current row to retArr
      // retArr.push(superviseeBools)
    }
  }
  return retArr;
});

const newSupervisorsMatrix = computed(() => {
  // const retArr = [] as boolean[][];
  const retArr = new Array(
    modifiablesupervisedbylist.value?.length
  ) as boolean[][];

  if (modifiablesupervisedbylist.value) {
    for (const [
      index,
      supervisee,
    ] of modifiablesupervisedbylist.value?.entries()) {
      // boolean row for current supervisee
      const superviseeBools = new Array(
        supervisee.supervisors.length
      ) as boolean[];
      const origSupervisee = cloneDeep(props.usersupervisedbylist[index]);
      const origSuperviseeSupervisorNames = origSupervisee.supervisors.map(
        (supervisor) => supervisor.supervisor_username
      );

      for (const [index2, supervisor] of supervisee.supervisors.entries()) {
        if (
          !origSuperviseeSupervisorNames.includes(
            supervisor.supervisor_username
          )
        ) {
          superviseeBools[index2] = true;
        } else {
          superviseeBools[index2] = false;
        }
      }
      // then push current row to retArr
      retArr[index] = superviseeBools;
    }
  }
  return retArr;
});

const modifiedSupervisorsList = computed(() => {
  const retArr = [] as UserSupervisedByFromAPIType[]
    for (const [index1, superviseeBoolArr] of modifiedSupervisorsMatrix.value.entries()) {
      for (const [index2, supervisorBool] of superviseeBoolArr.entries()) {
        if (supervisorBool) {
          if (modifiablesupervisedbylist.value) {
            const tmpAPIUserSupervisedBy = {} as UserSupervisedByFromAPIType
            const tmpSupervisee = modifiablesupervisedbylist.value[index1] // UserSupervisedByGroupBySuperviseeType
            const tmpSupervisor = tmpSupervisee.supervisors[index2] // supervisor to add

            tmpAPIUserSupervisedBy.supervisee_username = tmpSupervisee.supervisee_username
            tmpAPIUserSupervisedBy.supervisee_id = tmpSupervisee.supervisee_id
            tmpAPIUserSupervisedBy.supervisee_role_name = tmpSupervisee.supervisee_role_name
            tmpAPIUserSupervisedBy.supervisee_site_id = tmpSupervisee.supervisee_site_id
            tmpAPIUserSupervisedBy.supervisee_site_name = tmpSupervisee.supervisee_site_name

            tmpAPIUserSupervisedBy.supervisor_username = tmpSupervisor.supervisor_username
            tmpAPIUserSupervisedBy.supervisor_id = tmpSupervisor.supervisor_id
            tmpAPIUserSupervisedBy.supervisor_role_name = tmpSupervisor.supervisor_role_name
            tmpAPIUserSupervisedBy.supervisor_site_id = tmpSupervisor.supervisor_site_id
            tmpAPIUserSupervisedBy.supervisor_site_name = tmpSupervisor.supervisor_site_name
            tmpAPIUserSupervisedBy.active = tmpSupervisor.active

            retArr.push(tmpAPIUserSupervisedBy)
          }
        }
      }
    }
  return retArr
})
const newSupervisorsList = computed(() => {
  const retArr = [] as UserSupervisedByFromAPIType[]
    for (const [index1, superviseeBoolArr] of newSupervisorsMatrix.value.entries()) {
      for (const [index2, supervisorBool] of superviseeBoolArr.entries()) {
        if (supervisorBool) {
          if (modifiablesupervisedbylist.value) {
            const tmpAPIUserSupervisedBy = {} as UserSupervisedByFromAPIType
            const tmpSupervisee = modifiablesupervisedbylist.value[index1] // UserSupervisedByGroupBySuperviseeType
            const tmpSupervisor = tmpSupervisee.supervisors[index2] // supervisor to add

            tmpAPIUserSupervisedBy.supervisee_username = tmpSupervisee.supervisee_username
            tmpAPIUserSupervisedBy.supervisee_id = tmpSupervisee.supervisee_id
            tmpAPIUserSupervisedBy.supervisee_role_name = tmpSupervisee.supervisee_role_name
            tmpAPIUserSupervisedBy.supervisee_site_id = tmpSupervisee.supervisee_site_id
            tmpAPIUserSupervisedBy.supervisee_site_name = tmpSupervisee.supervisee_site_name

            tmpAPIUserSupervisedBy.supervisor_username = tmpSupervisor.supervisor_username
            tmpAPIUserSupervisedBy.supervisor_id = tmpSupervisor.supervisor_id
            tmpAPIUserSupervisedBy.supervisor_role_name = tmpSupervisor.supervisor_role_name
            tmpAPIUserSupervisedBy.supervisor_site_id = tmpSupervisor.supervisor_site_id
            tmpAPIUserSupervisedBy.supervisor_site_name = tmpSupervisor.supervisor_site_name
            tmpAPIUserSupervisedBy.active = tmpSupervisor.active

            retArr.push(tmpAPIUserSupervisedBy)
          }
        }
      }
    }
  return retArr
})

watch(modifiedSupervisorsList, () => {
  console.log(`change to modifiedSupervisorsList detected`);
  // console.log(`subjectIdStore: ${subjectIdStore.subjectId}`)
  modifiedsupervisedbylist.value = cloneDeep(
    modifiedSupervisorsList.value
  );
});
watch(newSupervisorsList, () => {
  console.log(`change to modifiedSupervisorsList detected`);
  // console.log(`subjectIdStore: ${subjectIdStore.subjectId}`)
  addedsupervisedbylist.value = cloneDeep(
    newSupervisorsList.value
  );
});

modifiedsupervisedbylist
addedsupervisedbylist

// const addableSupervisorNames = computed(() => {
//   const retArr = props.addablesupervisors.map(
//     (supervisor) => supervisor.supervisee_username
//   );
//   return retArr;
// });

// const existingSupervisorNames = supervisee.supervisors.map(
//     (supervisor) => supervisor.supervisor_username
//   )
const addableSupervisorsBySupervisee = computed(() => {
  const retArr = new Array(
    modifiablesupervisedbylist.value?.length
  ) as Supervisor[][];
  if (modifiablesupervisedbylist.value) {
    for (const [
      index,
      supervisee,
    ] of modifiablesupervisedbylist.value?.entries()) {
      //
      const supervisorNames = supervisee.supervisors.map(
        (supervisor) => supervisor.supervisor_username
      );
      const tmpSupervisees = props.addablesupervisors.filter(
        (supervisee) =>
          !supervisorNames.includes(supervisee.supervisee_username)
      );
      const tmpSupervisors = tmpSupervisees.map(superviseeToSupervisor);
      retArr[index] = tmpSupervisors;
    }
  }
  return retArr;
});

const addSupervisorsBySuperviseeDisabled = computed(() => {
  const retArr = new Array(addableSupervisorsBySupervisee.value.length).fill(
    false
  ) as boolean[];
  for (const [
    index,
    supervisorList,
  ] of addableSupervisorsBySupervisee.value.entries()) {
    if (supervisorList.length <= 0) {
      retArr[index] = true;
    }
  }
  return retArr;
});

// add supervisor toggle
// might need an html ref
// we want to just pop up a modal that offers remaining addable supervisors
// so we go through the list of addable supervisors
// if their username is not in the list of supervisee.supervisors
// then we can add them, and they're added as an option to the dropdown

const addSupervisorModalVisible = ref(
  new Array(modifiablesupervisedbylist.value?.length)
);

function showAddSupervisorModal(
  supervisee: UserSupervisedByGroupBySuperviseeType,
  index: number
) {
  console.log(`addSupervisorModal called for supervisee:`, supervisee);
  if (!addSupervisorsBySuperviseeDisabled.value[index]) {
    addSupervisorModalVisible.value[index] = true;
  }
}
function hideAddSupervisorModal(
  supervisee: UserSupervisedByGroupBySuperviseeType,
  index: number
) {
  console.log(`addSupervisorModal called for supervisee`, supervisee);
  addSupervisorModalVisible.value[index] = false;
}
function addSupervisors(
  supervisee: UserSupervisedByGroupBySuperviseeType,
  supervisors: Supervisor[],
  index: number
) {
  const supervisorNames = supervisee.supervisors.map(
    (supervisor) => supervisor.supervisor_username
  );
  let hidemodal = false;
  for (const supervisor of supervisors) {
    if (!supervisorNames.includes(supervisor.supervisor_username)) {
      supervisee.supervisors.push(supervisor);
      hidemodal = true;
    } else {
      console.log(`error adding supervisor`, supervisor);
      errors.errorLog(
        `AddSupervisorModal; Supervisor ${supervisor.supervisor_username} is already assigned to user ${supervisee.supervisee_username}`,
        true
      );
    }
  }
  if (hidemodal) {
    hideAddSupervisorModal(supervisee, index);
  }
}

function removeSupervisor(
  supervisee: UserSupervisedByGroupBySuperviseeType,
  // supervisorToRemove: Supervisor
  index1: number,
  index2: number
) {
  // supervisee.supervisors.splice(index,1)
  if (modifiablesupervisedbylist.value) {
    modifiablesupervisedbylist.value[index1].supervisors.splice(index2,1)
  }
  // for (const [index, supervisor] of supervisee.supervisors.entries()) {
  //   if (supervisor.supervisor_username === supervisorToRemove.supervisor_username) {
  //     modifiablesupervisedbylist.value.splice(index,1);
  //   }
  // }
}

const activeOptions = [
  { text: "Inactive", value: "0" },
  { text: "Active", value: "1" },
];
</script>
