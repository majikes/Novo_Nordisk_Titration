<template>
  <div id="cgmAvailabilityContainer" ref="resizeRef">
    <svg ref="svgRef" height="60">
      <g class="x-axis" />
    </svg>
  </div>
</template>
<script setup lang="ts">

//  https://dev.to/muratkemaldar/using-vue-3-with-d3-composition-api-3h1g
// https://github.com/muratkemaldar/using-vue3-with-d3
// big ol' props to that person

import { computed, defineProps, onMounted, PropType, ref, watchEffect } from 'vue';
import { type CGMDataAvail5MinDiasType } from "@/types/SubjectCardTypes";
import {
  select,
  line,
  scaleLinear,
  scaleTime,
  min,
  max,
  curveBasis,
  axisBottom,
  axisLeft,
  timeHour,
} from 'd3'
import useResizeObserver from "@/use/resizeObserver";



const props = defineProps({
  connData: {
    required: true,
    type: Array as PropType<CGMDataAvail5MinDiasType[]>
  },
  loading: {
    required: true,
    type: Boolean as PropType<boolean>
  },
  // height: {
  //   required: true,
  //   type: Number as PropType<number>
  // },
  // width: {
  //   required: true,
  //   type: Number as PropType<number>
  // },
})

// create ref to pass to D3 for DOM manipulation
const svgRef = ref(null);

// this creates another ref to observe resizing, 
// which we will attach to a DIV,
// since observing SVGs with the ResizeObserver API doesn't work properly
const { resizeRef, resizeState } = useResizeObserver();

// custom computed values that represent just arrays of data points
// all times
const multiVector = computed(() => {
  const retObj = {
    timeVec: [] as number[],
    egvExistsVec: [] as number[],
    egvCountVec: [] as number[],
    egvMultipleVec: [] as boolean[],
  }
  for (const elem of props.connData) {
    retObj.timeVec.push(elem.baseTime)
    retObj.egvExistsVec.push(elem.egvPresent ? 1 : 0)
    retObj.egvCountVec.push(elem.egvCount)
    retObj.egvMultipleVec.push(elem.egvMultiple)
  }
  return retObj
})

onMounted(() => {
  // pass ref with DOM element to D3, when mounted (DOM available)
  const svg = select(svgRef.value);

  // whenever any dependencies (like data, resizeState) change, call this!
  watchEffect(() => {
    const { width, height } = resizeState.dimensions;
    // console.log(`detected width x height change: ${width} x ${height}`)

    // scales: map index / data values to pixel values on x-axis / y-axis
    const xScale = scaleTime()
      // .domain([0, props.data.length - 1]) // input values...
      // just setting domain to 288-1, cause we're only looking at 1 day
      .domain([
        new Date((min(multiVector.value.timeVec) as number)*1000), 
        new Date((max(multiVector.value.timeVec) as number)*1000)
      ]) // input values...
      .range([0, width]) // ... output values
      .nice();
    
    const xMargin = 20;

    const yScale = scaleLinear()
      .domain([0,1]) // input values...
      .range([height, 0]); // ... output values

    // // line generator: D3 method to transform an array of values to data points ("d") for a path element
    // const lineGen = line()
    //   .curve(curveBasis)
    //   .x((value, index) => xScale(index))
    //   .y((value) => yScale(value));

    // // render path element with D3's General Update Pattern
    // svg
    //   .selectAll(".line") // get all "existing" lines in svg
    //   .data([props.data]) // sync them with our data
    //   .join("path") // create a new "path" for new pieces of data (if needed)

    //   // everything after .join() is applied to every "new" and "existing" element
    //   .attr("class", "line") // attach class (important for updating)
    //   .attr("stroke", "green") // styling
    //   .attr("d", lineGen); // shape and form of our line!

    const xAxis = axisBottom(xScale)
      .ticks(timeHour.every(6));
    
    const gx = svg.select(".x-axis")

    if (xAxis) {
      gx
      .attr("transform", `translate(0,${height-xMargin})`)
      .call(xAxis)
    }
    
    // svg.append("g")
      
    
    
    // const yAxis = axisLeft(yScale);
    // svg.append("g")
    //   .call(yAxis)

    // render axes with help of scales
    // (we let Vue render our axis-containers and let D3 populate the elements inside it)
    
    // svg
    //   .select(".x-axis")
    //   .style("transform", `translateY(${height}px)`) // position on the bottom
    //   .call(xAxis);

    
    // svg.select(".y-axis").call(yAxis);
  });
});

</script>