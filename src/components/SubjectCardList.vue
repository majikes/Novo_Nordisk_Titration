<template>
  <div class="flex justify-end my-1">
    <div class="flex mr-4">
      <svg class="w-5 mr-2" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" stroke-linecap="round"
          stroke-linejoin="round"></path>
      </svg>
      <div class="w-48">
        <select :disabled="loading" class="form-select select-input" name="sort" id="sort-select" v-model="sortVar">
          <option :value="sortVar" v-for="sortVar in Object.keys(sortables)" :key="sortVar">
            {{ (sortables as any)[sortVar] }}
          </option>
        </select>
      </div>
    </div>

    <div class="flex">
      <svg class="w-5 mr-2" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
          stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
      <div class="w-48">
        <select :disabled="loading" class="form-select select-input" name="filter" id="filter-select" v-model="filterVar">
          <option value="none">Filter by...</option>
          <option value="status">Active Only</option>
        </select>
      </div>
    </div>
  </div>
  <div class="relative flex flex-wrap justify-between gap-4 mt-6">
    <LoadingHover v-if="loading" />
    <SubjectCard v-for="card in filteredBySelected" :key="card.username" :card="card" />
  </div>
</template>
<script lang="ts">

import { computed, defineComponent, PropType, ref } from 'vue';
import SubjectCard from '@/components/SubjectCard.vue'
import LoadingHover from './LoadingHover.vue';
import SubjectCardType from '@/types/SubjectCardType'

export default defineComponent({
  name: 'SubjectCardList',
  components: { SubjectCard, LoadingHover },
  props: {
    cards: {
      required: true,
      type: Array as PropType<SubjectCardType[]>
    },
    loading: {
      required: true,
      type: Boolean as PropType<boolean>
    }
  },
  setup(props) {
    console.log(props)

    const sortVar = ref('username')
    const sortables = {
      'username': 'Subject ID',
      'daysToTitrate': 'Days to Titrate',
      // 'glycemicRisk': 'Glycemic Risk',
    }
    const filterVar = ref('none')

    const sortedById = computed(() => {
      return [...props.cards].sort((a, b) => {
        if (a.username > b.username) { return 1 }
        else { return -1 }
      })
    })

    const sortedBySelected = computed(() => {
      return [...sortedById.value].sort((a, b) => {
        if (typeof ((a as any)[sortVar.value]) !== 'undefined' && typeof ((b as any)[sortVar.value]) !== 'undefined') {
          if ((a as any)[sortVar.value] > (b as any)[sortVar.value]) { return 1 }
          else { return -1 }
        } else { return 1 }
      })
    })

    const filteredBySelected = computed(() => {
      return [...sortedBySelected.value].filter((card) => {
        if (filterVar.value === 'none') { return true }
        else {
          return card.status.toLowerCase() === 'active'
        }
      })
    })

    return { filteredBySelected, filterVar, sortables, sortedById, sortedBySelected, sortVar }
  }
})
</script>