<template>
  <div class="col-span-6">
    <div v-if="debugModeStore.debugMode">
      <div><span class="font-semibold">usersupervisedbylist === modifiablesupervisedbylist:</span> {{ isEqual(usersupervisedbylist, modifiablesupervisedbylist) }}</div>
      <div><span class="font-semibold">modifiedSupervisors:</span> {{ modifiedSupervisors }}</div>
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
      <div class="col-span-4">
        <div
          v-for="(supervisor, index2) in supervisee.supervisors"
          :key="index2"
          class="grid grid-cols-4"
        >
          <div class="px-4 user-mgmt-cell">
            {{ supervisor.supervisor_username }}
          </div>
          <div class="px-4 user-mgmt-cell">
            {{ supervisor.supervisor_role_name }}
          </div>
          <div class="px-4 user-mgmt-cell">{{ supervisor.supervisor_site_name }}</div>
          <!-- <div class="px-4">{{ supervisor.active }}</div> -->
          <div class="px-4 user-mgmt-cell">
            <select
              name="active"
              :id="`${supervisee.supervisee_username}-${supervisor.supervisor_username}-active-select`"
              v-model="supervisor.active"
              class="user-mgmt-active-dropdown"
              :class="{
                'user-mgmt-modified': modifiedSupervisors[index][index2],
              }"
            >
              <option
                v-for="(active_option, index3) in activeOptions"
                :key="index3"
                :value="active_option.value"
              >
                {{ active_option.text }}
              </option>
            </select>
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
import { computed, defineProps, defineModel, PropType, ref } from "vue";
import {
  type UserSupervisedByGroupBySuperviseeType,
  type Supervisee,
  type USBGFrontendSortType,
} from "@/types/UserSupervisedByTypes";
import UserManagementListItem from "@/components/UserManagementListItem.vue";
import { cloneDeep, isEqual } from "lodash";
import { useDebugModeStore } from "@/stores/debugModeStore";

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

const debugModeStore = useDebugModeStore();

// TODO
// make new computed that, given appropriate indices, tracks
// if user is new
// if user active status is new
const modifiedSupervisors = computed(() => {
  // TODO props.addablesupervisors.length IS DANGEROUS!!!!!
  // DUPLICATES CAN EXIST IN DB
  // MAKE THIS MAX OF ADDABLESUPERVISORS.LENGTH AND LONGEST SUPERVISORS
  // const maxSupervisors = new Array(props.addablesupervisors.length).fill(false);
  // const retArr = new Array(modifiablesupervisedbylist.value?.length).fill(cloneDeep(maxSupervisors));
  const retArr = new Array(modifiablesupervisedbylist.value?.length);
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
              String(origSupervisee.supervisors[index2].active) !== String(supervisor.active)
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

const newSupervisors = computed(() => {
  const retArr = [] as boolean[][];
  if (modifiablesupervisedbylist.value) {
    for (const [
      index,
      supervisee,
    ] of modifiablesupervisedbylist.value?.entries()) {
      // boolean row for current supervisee
      const superviseeBools = [] as boolean[];
      const origSupervisee = cloneDeep(props.usersupervisedbylist[index]);
      const origSuperviseeSupervisorNames = origSupervisee.supervisors.map(
        (supervisor) => supervisor.supervisor_username
      );
      for (const supervisor of supervisee.supervisors) {
        if (
          !origSuperviseeSupervisorNames.includes(
            supervisor.supervisor_username
          )
        ) {
          superviseeBools.push(true);
        } else {
          superviseeBools.push(false);
        }
      }
      // then push current row to retArr
      retArr.push(superviseeBools);
    }
  }
  return retArr;
});

const activeOptions = [
  { text: 'Inactive', value: '0' },
  { text: 'Active', value: '1' },
]
</script>
