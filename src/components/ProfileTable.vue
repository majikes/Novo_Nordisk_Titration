<template>
  <div class="grid w-full">
    <div :class="{ 'grid-cols-4': readonly, 'grid-cols-5': !readonly }"
      class="grid mb-4 mt-2 p-4 rounded-lg bg-gray-200 w-full">
      <div :class="{ 'profile-x-pad': !compact, 'profile-x-pad-compact': compact }"
        class="font-bold flex justify-between">
        <div title="Time">Time</div>
        <div v-if="!readonly" title="toggle autosort by Time field" @click="toggleSort">
          <div v-if="autoSort">
            <svg class="w-6 pointer-events-none" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"
              viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path class="pointer-events-none"
                d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" stroke-linecap="round"
                stroke-linejoin="round"></path>
            </svg>
          </div>
          <div v-else>
            <svg class="w-6 pointer-events-none" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"
              viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path class="pointer-events-none" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
                stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </div>
        </div>
      </div>
      <div :class="{ 'profile-x-pad': !compact, 'profile-x-pad-compact': compact }" class="font-bold truncate"
        title="Basal [U/h]">Basal [U/h]</div>
      <div :class="{ 'profile-x-pad': !compact, 'profile-x-pad-compact': compact }" class="font-bold truncate"
        title="ISF [mg/dL/U]">ISF [mg/dL/U]</div>
      <div :class="{ 'profile-x-pad': !compact, 'profile-x-pad-compact': compact }" class="font-bold truncate"
        title="CR [g/U]">CR [g/U]</div>
      <div v-if="!readonly" :class="{ 'profile-x-pad': !compact, 'profile-x-pad-compact': compact }"
        class="font-bold flex justify-end">control</div>
    </div>
    <div class="text-sm text-red-700 font-light pb-2" :class="{ hidden: !strictNoMidnight }">
      Profile requires an entry for midnight
    </div>
    <div v-for="(row, index) in profile" :key="index"
      :class="{ 'grid-cols-4': readonly, 'grid-cols-5': !readonly, 'profile-x-pad': !compact, 'profile-x-pad-compact': compact }"
      class="grid rounded-lg pb-1 even:bg-gray-100">
      <div :class="{ 'profile-x-pad': !compact, 'profile-x-pad-compact': compact }">
        <!-- <input type="number" :id="`prof-${index}-0`" :disabled="readonly" :value="profile[index][0]"
          @change="changeValue" :index="index" :subindex="0" class="profile-input silent-validate-input peer"
          :class="{ 'custom-invalid': duplicateInput(profile[index][0]) }" :min="profMinTime" :max="profMaxTime" :step="profResTime"> -->
        <input type="time" :id="`prof-${index}-0`" min="00:00" max="23:59" step="60" :disabled="readonly"
          @change="changeTimeValue" :index="index" :value="minToTime(profile[index][0])" :subindex="0"
          class="profile-input silent-validate-input peer"
          :class="{ 'custom-invalid': duplicateInput(profile[index][0]) }">
      </div>
      <div :class="{ 'profile-x-pad': !compact, 'profile-x-pad-compact': compact }">
        <input type="number" :id="`prof-${index}-1`" :disabled="readonly" :value="profile[index][1]"
          @change="changeValue" :index="index" :subindex="1" class="profile-input silent-validate-input peer"
          :min="profMinBR" :max="profMaxBR" :step="profResBR">
      </div>
      <div :class="{ 'profile-x-pad': !compact, 'profile-x-pad-compact': compact }">
        <input type="number" :id="`prof-${index}-2`" :disabled="readonly" :value="profile[index][2]"
          @change="changeValue" :index="index" :subindex="2" class="profile-input silent-validate-input peer"
          :min="profMinCF" :max="profMaxCF" :step="profResCF">
      </div>
      <div :class="{ 'profile-x-pad': !compact, 'profile-x-pad-compact': compact }">
        <input type="number" :id="`prof-${index}-3`" :disabled="readonly" :value="profile[index][3]"
          @change="changeValue" :index="index" :subindex="3" class="profile-input silent-validate-input peer"
          :min="profMinCR" :max="profMaxCR" :step="profile[index][3] < 10 ? profResCRlt10 : profResCRgt10">
      </div>

      <div :class="{ 'profile-x-pad': !compact, 'profile-x-pad-compact': compact }"
        class="grid content-center justify-end pt-1" v-if="!readonly">
        <button :id="`btn-${index}`" class="bg-rose-200" @click="removeRow">
          <svg class="w-6 pointer-events-none" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"
            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path class="pointer-events-none" d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round">
            </path>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="!readonly" :class="{ 'profile-x-pad': !compact, 'profile-x-pad-compact-add': compact }"
      class="grid grid-cols-5 mt-4 border-2 bg-white border-emerald-400 rounded-lg pb-2">
      <div class="mt-3 mb-2 col-span-5 text-sm">Add new entry</div>
      <div :class="{ 'profile-x-pad': !compact, 'profile-x-pad-compact': compact }">
        <!-- <input id="timeadd" class="profile-add-input" type="number" ref="add0" v-model="addInput[0]"
          :class="{ 'custom-invalid': !validTime(addInput[0]), 'custom-valid': validTime(addInput[0]) }"
          :min="profMinTime" :max="profMaxTime" :step="profResTime"> -->
        <input id="timeadd" class="profile-add-input" type="time" ref="add0" v-model="timeInput"
          :class="{ 'custom-invalid': !validTime(timeInputMin), 'custom-valid': validTime(timeInputMin) }" min="00:00"
          max="23:59" step="60">
        <div class="custom-invalid-feedback" :class="{ invisible: validTime(timeInputMin) }">
          Already assigned
        </div>
        <div v-if="debugModeStore.debugMode">
          timeInputMin: {{ timeInputMin }};
          timeInput: {{ timeInput }}; timeInputMin: {{ timeInputMin }}
          validTime({{ timeInputMin }}): {{ validTime(timeInputMin) }};

          duplicateInput({{ timeInputMin }}): {{ duplicateInput(timeInputMin) }}
        </div>
      </div>
      <div :class="{ 'profile-x-pad': !compact, 'profile-x-pad-compact-add': compact }">
        <input id="bradd" class="profile-add-input validate-input peer" type="number" ref="add1" v-model="addInput[1]"
          :min="profMinBR" :max="profMaxBR" :step="profResBR">
        <div class="invalid-feedback">
          {{ `${profMinBR}-${profMaxBR}` }}
        </div>
      </div>
      <div :class="{ 'profile-x-pad': !compact, 'profile-x-pad-compact-add': compact }">
        <input id="cfadd" class="profile-add-input validate-input peer" type="number" ref="add2" v-model="addInput[2]"
          :min="profMinCF" :max="profMaxCF" :step="profResCF">
        <div class="invalid-feedback">
          {{ `${profMinCF}-${profMaxCF}` }}
        </div>
      </div>
      <div :class="{ 'profile-x-pad': !compact, 'profile-x-pad-compact-add': compact }">
        <input id="cradd" class="profile-add-input validate-input peer" type="number" ref="add3" v-model="addInput[3]"
          :min="profMinCR" :max="profMaxCR" :step="addInput[3] < 10 ? profResCRlt10 : profResCRgt10">
        <div class="invalid-feedback">
          {{ `${profMinCR}-${profMaxCR}` }}
        </div>
        <div v-if="debugModeStore.debugMode">
          step: {{ addInput[3] < 10 ? profResCRlt10 : profResCRgt10 }}; addInput[3]: {{ addInput[3] }} 
        </div>
      </div>
      <div :class="{ 'profile-x-pad': !compact, 'profile-x-pad-compact-add': compact }" class="grid justify-end pt-2">
        <!-- old disabled pattern: add0 !== null && add1 !== null && add2 !== null && add3 !== null && (!(add0 as HTMLInputElement).validity.valid || !(add1 as HTMLInputElement).validity.valid || !(add2 as HTMLInputElement).validity.valid || !(add3 as HTMLInputElement).validity.valid) -->
        <div>
          <button id="addrow-button" class="bg-emerald-200 aspect-square disabled:bg-gray-200 group" @click="addRow"
            :disabled="addDisabled">
            <svg class="w-6 pointer-events-none group-disabled:stroke-gray-400" aria-hidden="true" fill="none"
              stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path class="pointer-events-none" d="M12 6v12m6-6H6" stroke-linecap="round" stroke-linejoin="round">
              </path>
            </svg>
          </button>
        </div>
        <div class="custom-invalid-feedback" :class="{ invisible: !noMoreRows }">
          max profile entries
        </div>
      </div>

    </div> <!-- addrow end -->
    <!-- this invisible div is necessary as a side effect of how i'm determining profile validity;
    i'm using a computed value to automatically compute the "validProf" boolean, but because Vue
    is smart, not only does it only update on change of any inputs it's using, but it also only
    does so if the output of the computed value is used anywhere, which is why before adding this
    invisible div the value would only update when the debug view was active. crazy. -->
    <div class="invisible">{{ validProf }}</div>
    <div v-if="debugModeStore.debugMode">
      <button class="btn w-64" @click="testing">TEST</button>
      <div>{{ $props.profile }}</div>
      <div>len: {{ $props.profile.length }}</div>
      <div>validProp: {{ $props.valid }}</div>
      <div>valid: {{ validProf }}</div>
      <div>timevals: {{ timeVals }}</div>
    </div>

  </div>
</template>
<script lang="ts">
import { emit } from 'process'
import { computed, defineComponent, PropType, ref } from 'vue'
import { useDebugModeStore } from '@/stores/debugModeStore'
import { profile } from 'console'

export default defineComponent({
  components: {},
  props: {
    profile: {
      required: true,
      type: Array as PropType<number[][]>
    },
    compact: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    valid: {
      type: Boolean as PropType<boolean>
    },
    readonly: {
      required: true,
      type: Boolean as PropType<boolean>
    },
    strict: {
      required: false,
      type: Boolean as PropType<boolean>
    }
  },
  emits: ['update:profile', 'update:valid'],
  setup(props, { emit }) {
    const debugModeStore = useDebugModeStore()
    // re: patricio -  if CR<10, the resolution is 0.1, otherwise it's 1
    // we're going to maintain 0.1 for now
    // TODO find a way to guard this before turning it into an API call
    const profResCR = 0.1
    const profResCRlt10 = 0.1
    const profResCRgt10 = 1
    const profResCF = 1
    const profResTime = 1
    const profResBR = 0.001
    const profMaxCR = 300
    const profMinCR = 1
    const profMaxCF = 600
    const profMinCF = 1
    const profMaxBR = 15
    const profMinBR = 0.1
    const profMinTime = 0
    const profMaxTime = 1439
    const profMaxRows = 16

    //template refs
    const add0 = ref(null)
    const add1 = ref(null)
    const add2 = ref(null)
    const add3 = ref(null)

    const blankInput = [0, 0, 0, 0]
    const addInput = ref(blankInput)
    const blankTime = '00:00'
    const timeInput = ref(blankTime)
    const timeInputMin = computed(() => { return timeToMin(timeInput.value) })

    const autoSort = ref(true)

    const hrs = computed(() => {
      const retHrs = [] as number[]
      for (const row of props.profile) {
        retHrs.push(row[0])
      }
      return retHrs
    })

    const setHrs = computed(() => {
      return Array.from(new Set(hrs.value))
    })

    const timeVals = computed(() => {
      const retTimes = [] as string[]
      for (const row of props.profile) {
        retTimes.push(minToTime(row[0]))
      }
      return retTimes
    })

    // const hrRegEx = computed(() => {
    //   let regEx = ''
    //   if (setHrs.value.length > 0) {
    //     regEx = `^(?!(${setHrs.value.join('|')}))([0-9]|1[0-9]|2[0-3])$`
    //   }
    //   return regEx
    // })

    const addDisabled = computed(() => {
      // does not check resolution, only limits
      const [_, profBR, profCF, profCR] = addInput.value
      const profTime = timeInputMin.value
      const time = props.profile.slice().map((x) => Number(x[0]))
      // console.log(time)
      return (
        !(profTime >= profMinTime && profTime <= profMaxTime && !time.includes(profTime) &&
          profBR >= profMinBR && profBR <= profMaxBR &&
          profCR >= profMinCR && profCR <= profMaxCR &&
          profCF >= profMinCF && profCF <= profMaxCF &&
          props.profile.length < profMaxRows)
      )
    })

    const noMoreRows = computed(() => { return props.profile.length >= profMaxRows })

    const midnightSegment = computed(() => { 
      let midnightExists = false
      for (const row of props.profile) {
        if (row[0] === 0) { midnightExists = true }
      }
      console.log(`strict: ${props.strict}; midnightExists: ${midnightExists}`)
      return midnightExists
    })

    const strictNoMidnight = computed(() => {
      return typeof(props.strict) !== 'undefined' &&
        props.strict &&
        !midnightSegment.value
    })

    const duplicateInput = (val: number) => {
      let count = 0
      hrs.value.forEach(function (x) { if (x === val) { count++ } })
      return count > 1
    }

    const validTime = (val: number) => {
      return !hrs.value.includes(val) && val >= profMinTime && val <= profMaxTime
    }

    function arrSort(a: number[], b: number[]) {
      return a[0] - b[0];
    }

    function timeToMin(time: string) {
      const [hr, min] = time.split(':')
      const retVal = Number(hr) * 60 + Number(min)
      console.log(`converted ${time} to ${retVal}`)
      return retVal
    }

    function minToTime(min: number) {
      return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
    }

    const changeTimeValue = (e: Event) => {
      const elem = (e.target as HTMLInputElement)
      const curArr = props.profile
      const idArr = elem.id.split('-')
      const i = Number(idArr[1])
      const ii = Number(idArr[2])
      curArr[i][ii] = timeToMin(elem.value)
      console.log(`changeValue [${i}][${ii}]`)
      if (autoSort.value) { curArr.sort(arrSort) }
      emit('update:profile', curArr)
      // curArr[elem.index?]
      // // console.log(changed)
      // emit()
    }

    const changeValue = (e: Event) => {
      const elem = (e.target as HTMLInputElement)
      const curArr = props.profile
      const idArr = elem.id.split('-')
      const i = Number(idArr[1])
      const ii = Number(idArr[2])
      curArr[i][ii] = Number(elem.value)
      console.log(`changeValue [${i}][${ii}]`)
      if (autoSort.value) { curArr.sort(arrSort) }
      emit('update:profile', curArr)
      // curArr[elem.index?]
      // // console.log(changed)
      // emit()
    }

    const removeRow = (e: Event) => {
      // console.log(e)
      const elem = (e.target as HTMLInputElement)
      // console.log(elem)
      const row = Number(elem.id.split('-')[1])
      const retArr = ([] as number[][]).concat(
        props.profile.slice(0, row),
        props.profile.slice(row + 1))
      console.log('deleting row', row)
      console.log('new arr:', retArr)
      emit('update:profile', retArr)
    }

    const addRow = (e: Event) => {
      // console.log(e)
      // const elem = (e.target as HTMLInputElement)
      // console.log(add0.value)
      // console.log(elem)
      // TODO add checking here as well?

      const row = addInput.value.slice().map(x => Number(x))
      row[0] = timeInputMin.value
      const retArr = ([] as number[][]).concat(
        props.profile.slice(),
        [row]
      )
      if (autoSort.value) { retArr.sort(arrSort) }
      console.log('adding row', row)
      console.log('new arr:', retArr)
      // addInput not updating on page??
      // TODO fix
      addInput.value = blankInput.slice()
      emit('update:profile', retArr)
    }

    function toggleSort() {
      autoSort.value = !autoSort.value
      if (autoSort.value) {
        emit('update:profile', props.profile.slice().sort(arrSort))
      }
    }

    const testing = (e: Event) => {
      // console.log('========= TEST OUTPUT ==========')
      // console.log((add0.value))
      // console.log((add1.value))
      // console.log((add2.value))
      // console.log((add3.value))
      // if ((add0.value !== null) && (add1.value !== null) &&
      //   (add2.value !== null) && (add3.value !== null)) {
      //   console.log((add0.value as HTMLInputElement).validity.valid)
      //   console.log((add1.value as HTMLInputElement).validity.valid)
      //   console.log((add2.value as HTMLInputElement).validity.valid)
      //   console.log((add3.value as HTMLInputElement).validity.valid)
      //   console.log('== OR of NOTs ==')
      //   console.log(!(add0.value as HTMLInputElement).validity.valid ||
      //     !(add1.value as HTMLInputElement).validity.valid ||
      //     !(add2.value as HTMLInputElement).validity.valid ||
      //     !(add3.value as HTMLInputElement).validity.valid)
      // }
      console.log(props.profile.slice().map((x) => x[0]))
    }

    const validProf = computed(() => {
      // 1 or more entries
      const notEmpty = props.profile.length > 0
      // max or less entries
      const notOverflow = props.profile.length <= profMaxRows
      // no duplicates
      const uniqueTimes = JSON.stringify(hrs.value) === JSON.stringify(setHrs.value)
      // 12:00 AM segment exists
      const nostrictOrMidnightSegment = typeof(props.strict) === 'undefined' || !props.strict ? true : midnightSegment.value
      // no out of bound or illegal granularity values
      let validVals = true
      for (const entry of props.profile) {
        //range
        const timeInRange = (entry[0] >= profMinTime && entry[0] <= profMaxTime)
        const brInRange = (entry[1] >= profMinBR && entry[1] <= profMaxBR)
        const cfInRange = (entry[2] >= profMinCF && entry[2] <= profMaxCF)
        const crInRange = (entry[3] >= profMinCR && entry[3] <= profMaxCR)
        // res - the "*1000" is necessary because floating point math was screwing everything up
        const timeIsRes = Math.round(entry[0] * 1000) % Math.round(profResTime * 1000) === 0
        const brIsRes = Math.round(entry[1] * 10000) % Math.round(profResBR * 10000) === 0
        const cfIsRes = Math.round(entry[2] * 1000) % Math.round(profResCF * 1000) === 0
        let crIsRes = true
        if (entry[3] < 10) {
          crIsRes = Math.round(entry[3] * 1000) % Math.round(profResCRlt10 * 1000) === 0
        }
        else {
          crIsRes = Math.round(entry[3] * 1000) % Math.round(profResCRgt10 * 1000) === 0
        }
        const rowIsValid = timeInRange && brInRange && cfInRange && crInRange && timeIsRes && brIsRes && cfIsRes && crIsRes
        if (!rowIsValid) {
          console.log('#### INVALID ROW ####')
          console.log('row:', entry)
          console.log(`timeInRange: ${timeInRange}`)
          console.log(`brInRange: ${brInRange}`)
          console.log(`cfInRange: ${cfInRange}`)
          console.log(`crInRange: ${crInRange}`)
          console.log(`timeIsRes: ${timeIsRes}`)
          console.log(`brIsRes: ${brIsRes}`)
          console.log(`cfIsRes: ${cfIsRes}`)
          console.log(`crIsRes: ${crIsRes}`)
        }
        validVals &&= rowIsValid
      }
      const valid = notEmpty && notOverflow && uniqueTimes && nostrictOrMidnightSegment && validVals
      // console.log(`profvalid - notEmpty: ${notEmpty}; uniqueTimes: ${uniqueTimes}; validVals: ${validVals}`)
      emit('update:valid', valid)
      return valid // testing
    })

    return {
      add0, add1, add2, add3, addDisabled, addRow, addInput, autoSort, changeValue, duplicateInput, removeRow,
      profResCR, profResCRlt10, profResCRgt10, profResCF, profResBR, profMaxCR, profMinCR, profMaxCF, profMinCF, profMaxBR, profMinBR,
      testing, toggleSort, debugModeStore, validProf, profMinTime, profMaxTime, profResTime, validTime, timeVals,
      timeToMin, minToTime, changeTimeValue, timeInput, timeInputMin, noMoreRows, midnightSegment, strictNoMidnight
    }
  }
})
</script>