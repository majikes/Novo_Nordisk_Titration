<template>
  <div class="h-96">
    <Line :data="data" :options="options" />
  </div>
</template>
<script lang="ts">

import { computed, defineComponent, PropType, /*ref*/ } from 'vue'
///import SubjectGraphable from '@/types/SubjectGraphable'
import {
  splitAndColorize,
  genChartDataset,
  traceModifier,
  generalColorizer,
  ///recModifier,
  ///Point,
  DataSet,
  ///insDatasetModifier,
  ///areaChartModifier,
  ///timeGenerator,
  ///SUBJECT_GLUCOSE_CHART_DATASET_DEFAULTS
} from '@/functions/QuantileChartFunctions'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ///ChartData,
  ///ChartType,
  ///TimeScale,
  registerables
} from 'chart.js'
import { Line } from 'vue-chartjs'
import QuantileGraphable from '@/types/QuantileGraphable'
///import { cloneDeep } from 'lodash'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ...registerables
)

export default defineComponent({
  name: 'QuantileChart',
  components: { Line },
  props: {
    graphableData: {
      required: true,
      // type: Array as PropType<string[]>
      type: Object as PropType<QuantileGraphable>
    },
    loaded: {
      required: true,
      type: Boolean as PropType<boolean>
    },

    // this wasn't supposed to be necessary, but given that chart options
    // for glucose and insulin graphs will be very different, it makes sense
    // to just declare a prop here again, duplicating the 'type' argument
    // attached to traceGroups in QuantileGraphable
    dataType: {
      required: true,
      type: String as PropType<string>
    }
  },

  setup(props) {
    ///let datasets = [] as DataSet[]

    function findMax(traces: any[]) {
      let tmpMax = 0
      for (const trace of traces) {
        if (trace.trace instanceof Array) {
          tmpMax = Math.max(tmpMax, ...trace.trace)
        }
      }
      return tmpMax
    }

    const data = computed(() => {
      let datasets = [] as DataSet[]
      console.log(`generating following datasets:`, props.graphableData)

      for (const graphable of props.graphableData.traceGroups) {
        let traces = [] as DataSet[]
        let fills = [] as DataSet[]

        // defining what constitutes 'nan', different for different data types
        let nanBound = -1
        if (graphable.type === 'glucose') { nanBound = 0 }

        for (const quant of graphable.traces) {
          fills.push(genChartDataset(quant.trace, quant.label, nanBound))
          traces.push(genChartDataset(quant.trace, `${quant.label} Trace`, nanBound))
        }

        traces = traceModifier(traces)
        if (typeof (graphable.colors) !== 'undefined') {
          const inner = graphable.colors.inner
          let outer = 'rgba(61, 173, 217, 0.7)'
          if (typeof (graphable.colors.outer) !== 'undefined') { outer = graphable.colors.outer }
          fills = generalColorizer(fills, inner, outer)
        } else {
          fills = splitAndColorize(fills)
        }

        datasets = datasets.concat(traces, fills)
        // console.log(subjectData.value)
      }
      return { datasets: datasets }
    })
    // console.log('generated data:', data.value)
    // const tick_div = 6

    const options = computed(() => {
      let tmpOptions = {} as any

      if (props.dataType === 'glucose') {
        tmpOptions = {
          animation: false,
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'hour'
              },
              ticks: {
                autoSkip: true,
                align: 'inner',
                color: 'black',
                maxRotation: 0,
                minRotation: 0,
                maxTicksLimit: 7,
                includeBounds: true
              },
              grid: {
                display: true,
                drawOnChartArea: false,
              },
              max: new Date(2019, 0, 2, 0, 0, 0, 0)
            },
            y: {
              beginAtZero: true,
              max: 400,
              grid: {
                display: true,
                ///drawBorder: false,  
                color: (context: any) => {
                  if ((context.tick.value == 70) || (context.tick.value == 180)) {
                    return '#47ce76'
                  } else {
                    return 'rgba(0, 0, 0, 0.1)'
                  }
                },
                lineWidth: (context: any) => {
                  if ((context.tick.value == 70) || (context.tick.value == 180)) {
                    return 3
                  } else {
                    return 1
                  }
                }
              },
              ticks: {
                color: 'black',
                font: function (context: any) {
                  const height = context.chart.height
                  if (height < 300) {
                    const size = Math.round(height / 20)
                    return {
                      weight: 'bold',
                      size: size,
                    }
                  }
                  return {
                    weight: 'bold',
                    size: 14,
                  }
                },
                stepSize: 1,
                autoSkip: true,
                callback: function (item: string | number, index: number, ticks: any) {
                  if ((index == 54) || (index == 70) || (index == 180) || (index == 250) || (index == 350)) {
                    return item + ' '
                  }
                }
              },
            }
          },
          elements: {
            point: {
              radius: 0
            }
          },
          plugins: {
            legend: {
              display: false,
              position: 'top',
            },
            tooltip: {
              enabled: false,
            },
          },
        }
      }

      // get rid of a lot of options if we're graphing insulin
      if (props.dataType === 'insulin') {
        tmpOptions = {
          animation: false,
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'hour'
              },
              ticks: {
                autoSkip: true,
                align: 'inner',
                color: 'black',
                maxRotation: 0,
                minRotation: 0,
                maxTicksLimit: 7,
                includeBounds: true
              },
              grid: {
                display: true,
                drawOnChartArea: false,
              },
              max: new Date(2019, 0, 2, 0, 0, 0, 0)
            },
            y: {
              // type: 'linear', 
              beginAtZero: true,
              // HACKY BECAUSE THIS GRAPH IS BEING A PIECE OF SHIT
              max: Math.ceil(findMax(props.graphableData.traceGroups[0].traces)),
              grace: '10%',
              grid: {
                display: true,
                ///drawBorder: false,  
                color: (context: any) => { return 'rgba(0, 0, 0, 0.1)' },
                lineWidth: (context: any) => { return 1 }
              },
              ticks: {
                color: 'black',
                autoSkip: true
              },
            }
          },
          elements: {
            point: {
              radius: 0
            }
          },
          plugins: {
            legend: {
              display: false,
              position: 'top',
            },
            tooltip: {
              enabled: false,
            },
          },
        }
      }

      return tmpOptions
    })
    
    return {
      data, options
    }
  }
})
</script>
