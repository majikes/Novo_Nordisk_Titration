<template>
  <div class="circle-data-quality-chart rounded-full"
    :class="{'ring-2 ring-gray-300':dataQualityBreakdown.score===0}">
    <Doughnut class="pointer-events-none" v-if="loaded" :data="data" :options="options" />
  </div>
</template>
<script lang="ts">

import { computed, defineComponent, PropType, ref } from 'vue'
// import SubjectGraphable from '@/types/SubjectGraphable'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartType,
  TimeScale,
  ScriptableTooltipContext,
  registerables
} from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { clone, cloneDeep } from 'lodash'
import AdherenceCircleType from '@/types/AdherenceCircleType'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ...registerables
)

export default defineComponent({
  name: 'CircleDataQualityChart',
  components: { Doughnut },
  props: {
    dataQualityBreakdown: {
      required: true,
      type: Object as PropType<AdherenceCircleType>
    },
    tConnectStatus: {
      required: true,
      type: Boolean as PropType<boolean>
    },
    loaded: {
      required: true,
      type: Boolean as PropType<boolean>
    },
    // width: {
    //   default: 200,
    //   type: Number,
    // },
    // height: {
    //   default: 270,
    //   type: Number,
    // }
  },

  setup(props) {
    // this never changes, so it doesn't need ref()
    // const padding = 60


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Generates proper datasets for the tir chart. 
    // given the tir data, this omits any zero values, 
    // then creates the dataset with the correct number of
    // placeholder "space" elements 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    const quality = ref(props.dataQualityBreakdown.score * 100)
    // const status = computed(() => {return props.tConnectStatus === 'active'})
    const tconnectColor = computed(() => {
      return (props.tConnectStatus ? '#57cc99' : '#e76f51')
    })
    const qualityBreakdown = computed(() => {
      return `% CGM: ${props.dataQualityBreakdown.p_cgm}\nBolus/day: ${props.dataQualityBreakdown.nBolus_d}\nTime in CL: ${props.dataQualityBreakdown.tCL}`
    })
    
    const externalTooltipHandler = (context: ScriptableTooltipContext<ChartType>) => {
      // TODO IMPLEMENT CUSTOM TOOLTIP
      return "hello"
    }

    const data = {
      // labels: [
      //   'Data Quality',
      //   ''
      // ],
      datasets: [
        {
          label: qualityBreakdown.value,
          data: [quality.value, 100 - quality.value],
          backgroundColor: [
            '#81c3d7',
            'rgba(0,0,0,0)'
          ],
          borderWidth: 0,
          borderRadius: 3,
          spacing: 10,
          // rotation: 166
          // hoverOffset: 4
        },
        {
          label: props.tConnectStatus ? 'Connected' : 'Disconnected',
          data:[100],
          backgroundColor: [tconnectColor.value],
          borderWidth: 0
        },
      ]
    }

    const options = {
      animation: false,
      cutout: 0,
      // indexAxis: 'y',
      // maintainAspectRatio: false,
      // layout: {
      //     // padding: {
      //     //   bottom: 0
      //     // }
      // },
      plugins: {
        legend: {
          display: false,
          maxHeight: 0,
          maxWidth: 0
        },
        tooltip: {
          enabled: false,
        },
      },
      // scales: {
      //   x: {
      //     stacked: true,
      //     display: false,
      //   },
      //   y: {
      //     beginAtZero: true,
      //     stacked: true,
      //     display: false

      //   },
      // },
    }

    return { data, options }
  }
})
</script>

<style scoped>

</style>