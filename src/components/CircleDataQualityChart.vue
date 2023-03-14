<template>
  <div class="circle-data-quality-chart">
    <Doughnut v-if="loaded" :data="data" :options="options" />
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
  ///ChartData,
  ///ChartType,
  ///TimeScale,
  registerables
} from 'chart.js'
import { Doughnut } from 'vue-chartjs'
///import { clone, cloneDeep } from 'lodash'

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
    dataQualityIndex: {
      required: true,
      // type: Array as PropType<string[]>
      type: Number as PropType<number>
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


    const quality = ref(props.dataQualityIndex * 100)
    const status = ref(props.tConnectStatus)
    const tconnectColor = computed(() => {
      return (status.value ? 'green' : 'red')
    })

    const data = {
      // labels: [
      //   'Data Quality',
      //   ''
      // ],
      datasets: [
        {
          label: 'Data Quality',
          data: [quality.value, 100 - quality.value],
          backgroundColor: [
            'rgb(0, 153, 255)',
            'rgba(0,0,0,0)'
          ],
          borderWidth: 0,
          spacing: 10,
          rotation: 180
          // hoverOffset: 4
        },
        {
          label: 'tConnect status',
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