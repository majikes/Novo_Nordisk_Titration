<template>
  <div class="tir-chart">
    <Bar v-if="loaded" :data="data" :options="options" id="tir" />
    <!-- <div v-if="loaded">
      <strong>SUBJID: </strong>
      {{ graphableData.id }}
      <br />
      <strong> TiR: </strong>
      vlow: {{ graphableData.tControlMean[0] }} 
      low: {{ graphableData.tControlMean[1] }} 
      med: {{ graphableData.tControlMean[2] }} 
      high: {{ graphableData.tControlMean[3] }} 
      vhigh: {{ graphableData.tControlMean[4] }} 
    </div> -->
    <!-- {{ tirData }} -->
  </div>
</template>
<script lang="ts">

///import { computed, defineComponent, PropType, ref } from 'vue'
import { defineComponent, PropType, ref } from 'vue'

///import SubjectGraphable from '@/types/SubjectGraphable'
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
import { Bar } from 'vue-chartjs'
///import { clone, cloneDeep } from 'lodash'
import { cloneDeep } from 'lodash'

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
  name: 'TiRChart',
  components: { Bar },
  props: {
    tirData: {
      required: true,
      // type: Array as PropType<string[]>
      type: Array as PropType<number[]>
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

    interface TiRDataSet {
      label: string,
      data: number[],
      backgroundColor: string[] | string,
      barThickness: number,
      borderSkipped: boolean,
      borderRadius: {
        bottomLeft: number,
        topLeft: number,
        topRight: number,
        bottomRight: number
      },
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Generates proper datasets for the tir chart. 
    // given the tir data, this omits any zero values, 
    // then creates the dataset with the correct number of
    // placeholder "space" elements 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function genTirDatasets(tir: number[]) {
      const bar_thickness = 40
      const buffer_size = 1
      const buffer_color = "rgba(245, 245, 245, 0)"

      // var [len0, len1, len2, len3, len4] = tir
      const color_labels = ['vlow-red', 'low-rose', 'target-green', 'high-yellow', 'vhigh-orange']
      const colors = ['#ab3025', '#d59792', '#44c973', '#f9c63d', '#f5a000']

      const space_elem = {
        label: 'grey-space',
        data: [buffer_size],
        backgroundColor: [buffer_color],
        barThickness: bar_thickness,
        borderSkipped: false,
      } as TiRDataSet

      const data_elem = {
        label: '',
        data: [],
        backgroundColor: '',
        barThickness: bar_thickness,
        borderSkipped: false,
        borderRadius: {
          bottomLeft: 5,
          topLeft: 5,
          topRight: 5,
          bottomRight: 5
        },
      } as TiRDataSet

      let datasets = [] as TiRDataSet[]
      // thinking about storing full len here, but that's better done
      // on graph create, iterate through all the datasets .data property
      // var full_len = 0

      // this is where we're determining what tirs to draw
      // and making sure they show up as a big enough segment
      // min value for width/drawing reasons is 0.5
      for (let i = 0; i < tir.length; ++i) {
        let tval = tir[i]
        if (tval <= 0) {
          continue
        } else {
          const new_elem = cloneDeep(data_elem)
          new_elem.label = color_labels[i]
          new_elem.data = [tval + 0.5]
          new_elem.backgroundColor = colors[i]
          datasets = [...datasets, new_elem]
        }
      }

      let datasets_spaces = [] as TiRDataSet[]

      // now that we have the correct vals to draw, we insert spacers between
      for (let i = 0; i < datasets.length; ++i) {
        datasets_spaces = [...datasets_spaces, datasets[i]]
        if (i < datasets.length - 1) {
          let new_space = cloneDeep(space_elem)
          new_space.label = `${new_space.label}${i}`
          datasets_spaces = [...datasets_spaces, new_space]
        }
      }
      return datasets_spaces
    }

    const subjectData = ref(props.tirData)
    const tirData = subjectData.value.slice().reverse()
    const dataTmp = genTirDatasets(tirData)
    const data = {
      labels: [0],
      datasets: dataTmp
    }

    const options = {
      animation: false,
      // indexAxis: 'y',
      maintainAspectRatio: false,
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
      scales: {
        x: {
          stacked: true,
          display: false,
        },
        y: {
          max: 107,
          min: -3,
          beginAtZero: true,
          stacked: true,
          display: false

        },
      },
    }

    return { data, options }
  }
})
</script>

<style scoped>
</style>