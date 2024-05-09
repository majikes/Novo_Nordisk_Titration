<template>
  <!-- <div class="user-mgmt-table-header-row">
    <div class="font-bold px-4" id="supervisee-header">User</div>
    <div class="font-bold px-4" id="usr-role-header">
      <strong>Role</strong>
    </div>
    <div class="font-bold px-4" id="supervisee-header">Supervisors</div>
    <div class="font-bold px-4" id="sup-role-header">Role</div>
    <div class="font-bold px-4" id="status-control-header">Site</div>
    <div class="font-bold px-4" id="status-control-header">Active</div>
  </div> -->
  <div
    v-for="(supervisee, index) in usersupervisedbylist"
    :key="index"
    class="user-mgmt-table-simple-row"
  >
    <div class="px-4">{{ supervisee.supervisee_username }}</div>
    <div class="px-4">{{ supervisee.supervisee_role_name }}</div>
    <div class="col-span-4">
      <div
        v-for="(supervisor, index2) in supervisee.supervisors"
        :key="index2"
        class="grid grid-cols-4"
      >
        <div class="px-4">{{ supervisor.supervisor_username }}</div>
        <div class="px-4">{{ supervisor.supervisor_role_name }}</div>
        <div class="px-4">{{ supervisor.site_name }}</div>
        <div class="px-4">{{ supervisor.active }}</div>
      </div>
    </div>
    <!-- <div class="px-4">{{ supervisee.supervisee_username }}</div>
    <div class="px-4">{{ supervisee.supervisee_username }}</div>
    <div class="px-4">{{ supervisee.supervisee_username }}</div> -->
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineModel, PropType, ref } from "vue";
import { type UserSupervisedByGroupBySuperviseeType } from "@/types/UserSupervisedByTypes";

const props = defineProps({
  usersupervisedbylist: {
    required: true,
    type: Array as PropType<UserSupervisedByGroupBySuperviseeType[]>,
  },
});

const modifiableSuperviseeList = defineModel<
  UserSupervisedByGroupBySuperviseeType[]
>("modifiableSuperviseeList");


</script>
