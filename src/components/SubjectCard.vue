<template>
  <div class="w-64 flex flex-wrap justify-between flex-row p-5 rounded-xl drop-shadow-lg"
    :class="{ 'bg-white': !isActive, 'bg-emerald-100': isActive }">
    <div class="mb-2 basis-full" id="header">
      {{ card.username }}
    </div>
    <!-- TiR bar and tooltip -->
    <div class="w-8 mb-3 rounded-sm relative" :class="{ 'ring-2 ring-gray-300': tirInvalid }">
      <TiRChartAlt class="h-48 peer" :loaded="loaded" :tirData="card.tirData" :tirheight="192" :tirwidth="32"
        :radius="2" :gap="1" />
      <ToolTip v-if="!tirInvalid" displaySide="right">
        <div class="text-xs px-2">
          <TiRTableBasic :tirData="card.tirData" />
        </div>
      </ToolTip>
    </div>
    <!-- Circle chart and tooltip -->
    <div class="grid content-center place-items-center" id="circle-container">
      <CircleDataQualityChart class="w-36 mx-auto peer" :loaded="loaded"
        :dataQualityBreakdown="card.dataQualityBreakdown" :tConnectStatus="card.tconnectStatus" />
      <ToolTip displaySide="mid">
        <div class="text-xs px-2 mb-1">
          <div class="control-row">
            <div class="pr-2">tConnect:</div>
            <div>{{ card.tconnectStatus ? 'connected' : 'disconnected' }}</div>
          </div>
          <div class="control-row">
            <div class="pr-2">Adherence score:</div>
            <div>{{ card.dataQualityBreakdown.score }}</div>
          </div>
          <div class="flex justify-start">
            <div class="pl-3 pr-1">&#40; bolus days -</div>
            <div>{{ card.dataQualityBreakdown.nBolus_d }} &#41;</div>
          </div>
          <div class="flex justify-start">
            <div class="pl-3 pr-1">&#40; &percnt; cgm -</div>
            <div>{{ card.dataQualityBreakdown.p_cgm }} &#41;</div>
          </div>
          <div class="flex justify-start">
            <div class="pl-3 pr-1">&#40; &percnt; time in CL -</div>
            <div>{{ card.dataQualityBreakdown.tCL }} &#41;</div>
          </div>
        </div>
      </ToolTip>
    </div>
    <!-- status & titrate badge -->
    <div class="basis-full pt-2 flex justify-between relative" id="status-text">
      <div>
        <span>Status: {{ card.status }}</span>
      </div>
      <div class="titrate-badge" id="titrate-badge">
        {{ card.daysToTitrate }}
      </div>
    </div>
    <!-- <span>Group: {{subject.group}}</span>
      <span>Phase Name: {{subject.phaseName}}</span> -->
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue'
import CircleDataQualityChart from './CircleDataQualityChart.vue'
import TiRChartAlt from './TiRChartAlt.vue'
import SubjectCardType from '@/types/SubjectCardType'
import ToolTip from './ToolTip.vue'
import TiRTableBasic from './TiRTableBasic.vue'

export default defineComponent({
  components: { CircleDataQualityChart, TiRChartAlt, ToolTip, TiRTableBasic },
  props: {
    card: {
      required: true,
      type: Object as PropType<SubjectCardType>
    }
  },
  setup(props) {
    // console.log('card props:',props.subject)
    const loaded = true
    const isActive = ref(props.card.status === 'active')
    const tirInvalid = computed(() => {
      const tir = props.card.tirData
      const sum = tir.gt250 + tir.bt180250 + tir.bt70180 + tir.bt5470 + tir.lt54
      return sum < 50
    })

    return { isActive, loaded, tirInvalid }
  }
})
</script>