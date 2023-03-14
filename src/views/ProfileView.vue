
<template>
  <div class="profile-view">
    <div>
      History of Basal Dose
      Subject ID: {{ route.params.subjectId }}
    </div>
    <ProfileTable :profile="testProf" id="profile-table" />
    <div class="flex justify-end my-1">
      <button disabled class="btn">
        Confirm Recommendation
      </button>
    </div>
  </div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue'
import ProfileTable from '@/components/ProfileTable.vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'ProfileView',
  components: { ProfileTable },
  setup() {
    const route = useRoute()

    const testProf = [
      [0, 1, 40, 12],
      [6, 1.5, 30, 10],
      [15, 0.8, 45, 15]
    ]

    return { route, testProf }
  }
})
</script>