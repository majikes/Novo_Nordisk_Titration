<template>
  <div class="w-full" id="cgmAvailabilityContainer" ref="resizeRef">
    <svg ref="svgRef" height="60">
      <path class="conn-area" />
      <path class="disconn-area" />
      <!-- <path class="tooltip" /> -->
      <g class="x-axis" />
      <!-- <g class="tooltip" style="pointer-events:none;" /> -->
    </svg>
  </div>
</template>
<script setup lang="ts">
//  https://dev.to/muratkemaldar/using-vue-3-with-d3-composition-api-3h1g
// https://github.com/muratkemaldar/using-vue3-with-d3
// big ol' props to that person

import {
  computed,
  defineProps,
  onMounted,
  PropType,
  ref,
  watchEffect,
} from "vue";
import { type CGMDataAvail5MinDiasType } from "@/types/SubjectCardTypes";
import {
  select,
  line,
  area,
  bisectCenter,
  scaleLinear,
  scaleTime,
  min,
  max,
  pointer,
  curveBasis,
  axisBottom,
  axisLeft,
  timeHour,
} from "d3";
import useResizeObserver from "@/use/resizeObserver";
import { useElementSize } from '@vueuse/core'

const props = defineProps({
  connData: {
    required: true,
    type: Array as PropType<CGMDataAvail5MinDiasType[]>,
  },
  loading: {
    required: true,
    type: Boolean as PropType<boolean>,
  },
  active: {
    required: true,
    type: Boolean as PropType<boolean>,
  }
  // height: {
  //   required: true,
  //   type: Number as PropType<number>
  // },
  // width: {
  //   required: true,
  //   type: Number as PropType<number>
  // },
});

// create ref to pass to D3 for DOM manipulation
const svgRef = ref(null);
const resizeRef = ref(null);

// this creates another ref to observe resizing,
// which we will attach to a DIV,
// since observing SVGs with the ResizeObserver API doesn't work properly
// const { resizeRef, resizeState } = useResizeObserver();

// custom computed values that represent just arrays of data points
// all times
const multiVector = computed(() => {
  const retObj = {
    timeVec: [] as number[],
    egvExistsVec: [] as number[],
    egvCountVec: [] as number[],
    egvMultipleVec: [] as boolean[],
  };
  for (const elem of props.connData) {
    retObj.timeVec.push(elem.baseTime);
    retObj.egvExistsVec.push(elem.egvPresent ? 1 : 0);
    retObj.egvCountVec.push(elem.egvCount);
    retObj.egvMultipleVec.push(elem.egvMultiple);
  }
  return retObj;
});

onMounted(() => {
  // pass ref with DOM element to D3, when mounted (DOM available)
  const svg = select(svgRef.value);
  const { width, height } = useElementSize(resizeRef)

  // whenever any dependencies (like data, resizeState) change, call this!
  watchEffect(() => {
    // const { width, height } = resizeState.dimensions;
    // console.log(`detected width x height change: ${width.value} x ${height.value}`)

    const xAxisBotMargin = 20;
    const xAxisRightMargin = 0;
    const yMarginTop = 10;

    // scales: map index / data values to pixel values on x-axis / y-axis
    const xScale = scaleTime()
      // .domain([0, props.data.length - 1]) // input values...
      // just setting domain to 288-1, cause we're only looking at 1 day
      .domain([
        new Date((min(multiVector.value.timeVec) as number) * 1000),
        new Date((max(multiVector.value.timeVec) as number) * 1000),
      ]) // input values...
      .range([0, width.value - xAxisRightMargin]); // ... output values
    // .nice();

    const yScale = scaleLinear()
      .domain([0, 1]) // input values...
      .range([height.value - xAxisBotMargin, 0 + yMarginTop]); // ... output values
    
    // https://observablehq.com/@d3/line-with-tooltip
    // svg
    //   .on("pointerenter pointermove", pointermoved)
    //   .on("pointerleave", pointerleft)
    //   .on("touchstart", event => event.preventDefault());

    // function pointermoved(event) {
    //   const i = bisectCenter(X, xScale.invert(pointer(event)[0]));
    //   tooltip.style("display", null);
    //   tooltip.attr("transform", `translate(${xScale(X[i])},${yScale(Y[i])})`);

    //   const path = tooltip.selectAll("path")
    //     .data([,])
    //     .join("path")
    //       .attr("fill", "white")
    //       .attr("stroke", "black");

    //   const text = tooltip.selectAll("text")
    //     .data([,])
    //     .join("text")
    //     .call(text => text
    //       .selectAll("tspan")
    //       .data(`${title(i)}`.split(/\n/))
    //       .join("tspan")
    //         .attr("x", 0)
    //         .attr("y", (_, i) => `${i * 1.1}em`)
    //         .attr("font-weight", (_, i) => i ? null : "bold")
    //         .text(d => d));

    //   const {x, y, width: w, height: h} = text.node().getBBox();
    //   text.attr("transform", `translate(${-w / 2},${15 - y})`);
    //   path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
    //   svg.property("value", O[i]).dispatch("input", {bubbles: true});
    // }

    // function pointerleft() {
    //   tooltip.style("display", "none");
    //   svg.node().value = null;
    //   svg.dispatch("input", {bubbles: true});
    // }
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

    // svg.append("g")

    // relevant parts of props.connData:

    // interface CGMDataAvail5MinType {
    //   baseTime: number;
    //   egvPresent: boolean;
    //   egvMultiple: boolean;
    //   egvCount: number;
    // }
    // computed multivector
    // const retObj = {
    //   timeVec: [] as number[],
    //   egvExistsVec: [] as number[],
    //   egvCountVec: [] as number[],
    //   egvMultipleVec: [] as boolean[],
    // };

    // xaxis define

    const xAxis = axisBottom(xScale).ticks(timeHour.every(6));

    const gx = svg.select(".x-axis");
    gx
      .attr("transform", `translate(0,${height.value - xAxisBotMargin})`)
      .call(xAxis);

    if (props.active) {
      const connectedArea = area()
        .x((d) => xScale(new Date(d.baseTime * 1000)))
        .y0(yScale(0))
        .y1((d) => yScale(Number(d.egvPresent)));

      const ga = svg.select(".conn-area");
      ga
        .attr("fill", "mediumseagreen")
        .attr("d", connectedArea(props.connData));

      const disconnectedArea = area()
        .x((d) => xScale(new Date(d.baseTime * 1000)))
        .y0(yScale(0))
        .y1((d) => yScale(Number(!d.egvPresent)));
      
      const gd = svg.select(".disconn-area");
      gd
        .attr("fill", "indianred")
        .attr("d", disconnectedArea(props.connData));
    }
    
    // const tooltip = svg.select(".tooltip");
    // tooltip
    //   .append("text")
    //   .attr("class", "tooltiptext")
    //   .attr("fill", "black");

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
