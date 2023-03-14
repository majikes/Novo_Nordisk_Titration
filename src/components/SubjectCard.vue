<template>
  <div class="w-64 flex flex-wrap justify-between flex-row p-5 rounded-xl drop-shadow-lg"
    :class="{ 'bg-white': !isActive, 'bg-emerald-100': isActive }">
    <div class="mb-2 basis-full" id="header">
      {{ subject.username }}
      <!-- <router-link :to="{ name: 'AGP', params: { subjectId: subject.username } }">
        {{ subject.username }}
      </router-link> -->
    </div>

    <div class="w-7 mb-3" id="tir-container">
    <TiRChart :loaded="loaded" :tirData="tirData" />
    </div>
    <!-- <router-link :to="{ name: 'AGP', params: { subjectId: subject.username } }" class="w-7 mb-3" id="tir-container">
      <TiRChart :loaded="loaded" :tirData="tirData" />
    </router-link> -->

    <div class="grid content-center place-items-center" id="circle-container">
    <CircleDataQualityChart class="w-32 mx-auto" :loaded="loaded" :dataQualityIndex="testQuality"
      :tConnectStatus="testStatus" />
    </div>  
    <!-- <router-link :to="{ name: 'AGP', params: { subjectId: subject.username } }"
      class="grid content-center place-items-center" id="circle-container">
      <CircleDataQualityChart class="w-32 mx-auto" :loaded="loaded" :dataQualityIndex="testQuality"
        :tConnectStatus="testStatus" />
    </router-link> -->
    <div class="basis-full pt-2 flex justify-between relative" id="status-text">
      <div>
        <span>Status: {{ subject.status }}</span>
      </div>
      <div class="titrate-badge" id="titrate-badge">
      {{ daysToTitrate }}
      </div>
      <!-- <router-link :to="{ name: 'TitrationView', params: { subjectId: subject.username } }" class="titrate-badge" id="titrate-badge">
        {{ daysToTitrate }}
      </router-link> -->
    </div>
    <!-- <span>Group: {{subject.group}}</span>
      <span>Phase Name: {{subject.phaseName}}</span> -->
  </div>
</template>
<script lang="ts">
// import { computed, defineComponent, PropType } from 'vue';
// import Job from '@/types/Job'
// import OrderTerm from '@/types/OrderTerm'

import { defineComponent, PropType, ref } from 'vue'
import CircleDataQualityChart from './CircleDataQualityChart.vue'
import TiRChart from './TiRChart.vue'
import Subject from '@/types/Subject'

export default defineComponent({
  components: { CircleDataQualityChart, TiRChart },
  props: {
    subject: {
      required: true,
      type: Object as PropType<Subject>
    }
  },
  setup(props) {
    // console.log('card props:',props.subject)
    const isActive = ref(props.subject.status === 'Active')
    const loaded = true
    const testQuality = 1 - (Math.random() / 3)
    const testStatus = (Math.random() * 4) < 1
    const daysToTitrate = Math.round(Math.random() * 4)

    const tirTemplate = [2, 4, 78, 10, 6].reverse()
    function shiftVal(tirValue: number) {
      // +/- 20% of orig just for some noise
      let negCoeff = Math.random() > .5 ? 1 : -1
      return tirValue + (tirValue * .2 * negCoeff)
    }
    function normalize(tirArr: number[]) {
      const total = tirArr.reduce((a, b) => a + b, 0)
      return tirArr.map(x => x / total * 100)
    }
    const tirData = normalize(tirTemplate.map(x => shiftVal(x)))

    return { daysToTitrate, isActive, loaded, tirData, testQuality, testStatus }
  }
})
</script>