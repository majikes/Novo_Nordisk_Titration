<template>
  <!-- add supervisor save changes modal -->
  <div
    class="add-supervisor-save-changes-modal bg-transparent"
    id="save-changes-modal-container"
    v-on-click-outside="cancelModal"
  >
    <div class="relative bg-white rounded-lg w-full p-4">
      <LoadingHover v-if="updateChangesLoading">
        <div class="font-semibold">Submitting changes...</div>
      </LoadingHover>
      <div class="flex justify-center my-6 font-semibold">
        Review changes to User/Supervisor relationships:
      </div>

      <!-- changes list -->
      <div class="add-supervisor-table-header-row">
        <div class="font-bold px-4" id="usr-supervisee-header">User</div>
        <div class="font-bold px-4" id="usr-role-header">Role</div>
        <div class="font-bold px-4" id="usr-site-header">Site</div>
        <div class="font-bold px-4" id="usr-supervisors-header">Supervisor</div>
        <div class="font-bold px-4" id="sup-role-header">Role</div>
        <div class="font-bold px-4" id="sup-site-header">Site</div>
        <div class="font-bold px-4" id="sup-active-header">Changes</div>
      </div>
      <div
        v-for="(supervisee, index) in changesList"
        class="add-supervisor-table-simple-row font-mono text-xs"
        :key="index"
      >
        <div class="add-supervisor-table-simple-cell">
          {{ supervisee.supervisee_username }}
        </div>
        <div class="add-supervisor-table-simple-cell">
          {{ supervisee.usbg_supervisee.supervisee_role_name }}
        </div>
        <div class="add-supervisor-table-simple-cell">
          {{ supervisee.usbg_supervisee.supervisee_site_name }}
        </div>
        <div class="add-supervisor-table-simple-cell">
          {{ supervisee.usbg_supervisee.supervisor_username }}
        </div>
        <div class="add-supervisor-table-simple-cell">
          {{ supervisee.usbg_supervisee.supervisor_role_name }}
        </div>
        <div class="add-supervisor-table-simple-cell">
          {{ supervisee.usbg_supervisee.supervisor_site_name }}
        </div>
        <div class="add-supervisor-table-simple-cell col-span-3">
          {{ supervisee.changes_text }}
        </div>
      </div>

      <div class="mt-2 p-2 rounded-lg border-2 border-orange-300">
        <div class="control-row font-semibold">Confirm changes?</div>
        <div class="flex justify-between gap-4 mt-4">
          <div
            class="add-supervisor-confirm-btn w-64 bg-gray-100 hover:bg-rose-200"
            @click="cancelModal"
          >
            Cancel
          </div>
          <div
            class="add-supervisor-confirm-btn w-64 bg-emerald-100 hover:bg-emerald-200 font-semibold"
            @click="confirmModal"
          >
            Confirm
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, defineProps, defineEmits, PropType, ref } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import {
  type UserSupervisedByFromAPIType,
  type USBModifiedType,
} from "@/types/UserSupervisedByTypes";
import LoadingHover from "@/components/LoadingHover.vue";

const props = defineProps({
  modifiedsupervisedbylist: {
    required: true,
    type: Array as PropType<UserSupervisedByFromAPIType[]>,
  },
  addedsupervisedbylist: {
    required: true,
    type: Array as PropType<UserSupervisedByFromAPIType[]>,
  },
  updateChangesLoading: {
    required: true,
    type: Boolean as PropType<boolean>,
  },
});

const emit = defineEmits(["cancelClick", "confirmClick"]);
// TODO
// cancel event like AddSupervisorModal
// confirm event " " " "
// simple version of what's being displayed on the big page
// 1 line per entry, we just
// - sort by user. for each user, one line per mod / addition
// - display modifications first
// - display additions second
// - i think we just want a new data type
//    - something like
//      {
//        supervisee_name: string,
//        modified: boolean,
//        added: boolean,
//        usbg_supervisee: UserSupervisedByFromAPIType
//      }
function cancelModal() {
  if (!props.updateChangesLoading) {
    emit("cancelClick");
  }
}
function confirmModal() {
  if (!props.updateChangesLoading) {
    emit("confirmClick");
  }
}

const changesList = computed(() => {
  const retArr = [] as USBModifiedType[];
  for (const modified_usr of props.modifiedsupervisedbylist) {
    
    const new_active = String(modified_usr.active) === '1' ? 'active' : 'inactive'
    const old_active = String(modified_usr.active) === '0' ? 'active' : 'inactive'

    const changes_text = `Status: ${old_active} -> ${new_active}`
    retArr.push({
      supervisee_username: modified_usr.supervisee_username,
      modified: true,
      added: false,
      changes_text: changes_text,
      usbg_supervisee: modified_usr,
    } as USBModifiedType);
  }
  for (const added_usr of props.addedsupervisedbylist) {
    const changes_text = `Newly assigned supervisor`
    retArr.push({
      supervisee_username: added_usr.supervisee_username,
      modified: false,
      added: true,
      changes_text: changes_text,
      usbg_supervisee: added_usr,
    } as USBModifiedType);
  }
  const compareFn = (a: any, b: any) => {
    const aValue = a.supervisee_username;
    const bValue = b.supervisee_username;
    const aSubValue = a.modified;
    const bSubValue = b.modified;

    if (aValue.localeCompare(bValue)) {
      return 1;
    } else if (bValue.localeCompare(aValue)) {
      return -1;
    } else {
      if (aSubValue && !bSubValue) {
        return 1;
      } else if (bSubValue && !aSubValue) {
        return -1;
      } else {
        return 0;
      }
    }
  };
  retArr.sort(compareFn);
  return retArr;
});
</script>
