<template>
  <div class="tir-chart" ref="tirContainer">
    <svg class="svg-demo" :viewBox="viewBox">
      <g class="series">
        <rect v-for="(d, i) in visibleBarData" :key="i" :x="xScale('TiR')" :y="yScale(startHeights[i])" :ry="radius"
          :height="yScale(d - barGap)" :width="xScale.bandwidth()" :fill="colorScale(i.toString())" />
      </g>
    </svg>
  </div>
</template>
<script setup lang="ts">

import { computed, defineProps, onMounted, PropType, ref } from 'vue';
import { useDebugModeStore } from "@/stores/debugModeStore";
import { type CGMDataAvail5MinDiasType } from "@/types/CGMDataAvailTypes";
import * as d3 from 'd3'


const props = defineProps({
  connData: {
    required: true,
    type: Boolean as PropType<boolean>
  },
  loaded: {
    required: true,
    type: Boolean as PropType<boolean>
  },
  height: {
    required: true,
    type: Number as PropType<number>
  },
  width: {
    required: true,
    type: Number as PropType<number>
  },
  radius: {
    required: true,
    type: Number as PropType<number>
  },
  colors: {
    required: false,
    type: Array as PropType<string[]>
  },
})

// this never changes, so it doesn't need ref()
// const padding = 60
// console.log(props.tirheight, typeof(props.tirheight))

const debugModeStore = useDebugModeStore()
const tirContainer = ref({} as HTMLElement)

interface TiRData {
  tir: string,
  lt54: number,
  bt5470: number,
  bt70180: number,
  bt180250: number,
  gt250: number,
}

const data = computed(() => {
  const tirBar = { tir: "TiR" } as TiRData
  // map values
  tirBar.lt54 = props.tirData.lt54
  tirBar.bt5470 = props.tirData.bt5470
  tirBar.bt70180 = props.tirData.bt70180
  tirBar.bt180250 = props.tirData.bt180250
  tirBar.gt250 = props.tirData.gt250
  return [tirBar]
})

// let barGap = ref(2)
const barGap = computed(() => {
  let barGap = 2
  if (typeof (props.gap) !== 'undefined') {
    barGap = props.gap
  }
  return barGap
})

const minH = computed(() => {
  let tmpMin = props.radius + barGap.value
  if (typeof (props.minHeight) !== 'undefined') {
    tmpMin = props.minHeight
  }
  return tmpMin
})

const visibleBarData = computed(() => {
  const lt54 = props.tirData.lt54 > 0 ? Math.max(props.tirData.lt54, minH.value) : 0
  const bt5470 = props.tirData.bt5470 > 0 ? Math.max(props.tirData.bt5470, minH.value) : 0
  const bt180250 = props.tirData.bt180250 > 0 ? Math.max(props.tirData.bt180250, minH.value) : 0
  const gt250 = props.tirData.gt250 > 0 ? Math.max(props.tirData.gt250, minH.value) : 0
  const bt70180 = props.tirData.bt70180 > 0 ? 100 - (lt54 + bt5470 + bt180250 + gt250) : 0
  const ret = {
    lt54: lt54,
    bt5470: bt5470,
    bt70180: bt70180,
    bt180250: bt180250,
    gt250: gt250,
  }
  console.log('fixed tir vals', ret)
  return ret
})

const startHeights = computed(() => {
  return {
    lt54: visibleBarData.value.gt250 + visibleBarData.value.bt180250 + visibleBarData.value.bt70180 + visibleBarData.value.bt5470,
    bt5470: visibleBarData.value.gt250 + visibleBarData.value.bt180250 + visibleBarData.value.bt70180,
    bt70180: visibleBarData.value.gt250 + visibleBarData.value.bt180250,
    bt180250: visibleBarData.value.gt250,
    gt250: 0,
  }
})

// const dataArr = computed(() => {
//   return [props.tirData.lt54, props.tirData.bt5470, props.tirData.bt70180, props.tirData.bt180250, props.tirData.gt250]
// })

const padding = ref(0)

// these two are updated on mounted()
const height = ref(props.tirheight)
const width = ref(props.tirwidth)

// const radius = ref(props.radius)

const rangeX = computed(() => {
  const w = width.value - padding.value
  return [0, w]
})
const rangeY = computed(() => {
  const h = height.value - padding.value
  return [0, h]
})

const xScale = d3.scaleBand()
  .domain(["TiR"])
  .range(rangeX.value)
  .padding(0.1);

const yScale = d3.scaleLinear()
  .domain([0, 100])
  .range(rangeY.value);

// const colorScale = computed(() => d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"]))
const colorList = computed(() => {
  // custom color support here based on existence of color prop
  const defaults = ["#ab3025", "#d59792", "#44c973", "#f9c63d", "#f5a000"]
  let retArr = []
  if (typeof (props.colors) !== 'undefined') {
    retArr = props.colors
  } else {
    retArr = defaults
  }
  return retArr
})
const colorScale = computed(() => d3.scaleOrdinal().range(colorList.value))

// const computedData = computed(() => d3.stack()(dataArr.value.map((d) => ({ value: d }))).pop())

const viewBox = computed(() => { return `0 0 ${width.value} ${height.value}` })

// const heights = computed(() => {
//   const heightRet = {
//     'vhigh': 0,
//     'high': 0,
//     'target': 0,
//     'low': 0,
//     'vlow': 0,
//   }
//   let validVals = 0
//   for (const val in props.tirData) {
//     if ((props.tirData as any)[val] > 0) {
//       validVals += 1
//     }
//   }
//   const gaps = validVals - 1
//   // each gap is ~5px so we're working w/ height minus 5*gaps
//   const realHeight = height.value - (gaps * 5)
//   heightRet.vhigh = Math.round(realHeight * (props.tirData.gt250 / 100))
//   heightRet.high = Math.round(realHeight * (props.tirData.bt180250 / 100))
//   // heightRet.target = realHeight * (props.tirData.bt70180/100)
//   heightRet.low = Math.round(realHeight * (props.tirData.bt5470 / 100))
//   heightRet.vlow = Math.round(realHeight * (props.tirData.lt54 / 100))

//   return heightRet
// })

onMounted(() => {
  // tirContainer.value = 
  if (tirContainer.value instanceof HTMLElement) {
    height.value = tirContainer.value.clientHeight
    width.value = tirContainer.value.clientWidth
  }
  console.log('tir mounted')
  // console.log(height.value)
})

</script>

<style scoped></style>