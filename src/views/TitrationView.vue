
<template>
  <div class="titration-view">
    <div class="control-row-header" id="header">
      <h1 class="text-2xl font-bold">Subject Titration</h1>
    </div>

    <div class="control-row">
      <div class="grid content-end pb-1" id="titrationdatepickerstandin">
        <VueDatePicker disabled v-model="date" />
        <!-- <TitrationDatepicker /> -->
      </div>
      <SubjectDropdown v-model="selected" />
    </div>

    <!-- titrate controller -->
    <div class="grid grid-cols-12">
      <!-- col row info button -->
      <!-- <div>
        <div class="w-5 relative">
          <div class="absolute z-40 w-10 h-10 bg-slate-400 rounded-md"></div>
          <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </div>
      </div> -->
      <!-- col legends -->
      <div class="grid grid-cols-24 col-start-2 col-span-11 gap-2 px-2 py-1" id="titrate-control-grid">
        <div class="col-span-1 grid content-center place-items-center aspect-square"
          v-for="(item, index) in titrateGrid.night" :key="index">
          <span class="font-medium">{{ String(index).padStart(2, '0') }}</span>
        </div>
      </div>
      <!-- night row legend -->
      <div>Night</div>
      <!-- night cells -->
      <div class="grid grid-cols-24 col-start-2 col-span-11 gap-2 px-2 py-1" id="titrate-control-grid">
        <div class="col-span-1 grid content-center place-items-center aspect-square"
          v-for="(item, index) in titrateGrid.night" :key="index">
          <input :disabled="buttonDisabled" class="form-input titrate-checkbox-input" type="checkbox"
            v-bind:id="`night-checkbox-${index}`"
            :class="{ titratemodified: titrateGrid.night[index] !== nightArray[index] }"
            v-model="titrateGrid.night[index]">
        </div>
      </div>
      <!-- basal row legend -->
      <div>Basal</div>
      <!-- basal cells -->
      <div class="grid grid-cols-24 col-start-2 col-span-11 gap-2 px-2 py-1" id="titrate-control-grid">
        <div class="col-span-1 grid content-center place-items-center aspect-square"
          v-for="(item, index) in titrateGrid.basal" :key="index">
          <select :disabled="buttonDisabled" :class="{ titratemodified: titrateGrid.basal[index] !== '3' }"
            class="titrate-select-input" name="basal" id="basal-dropdown" v-model="titrateGrid.basal[index]">
            <option :value="value" v-for="value in titrateLevels" :key="value">
              {{ (titrateLevelDesc as any)[value] }}
            </option>
          </select>
        </div>
      </div>
      <!-- bolus row legend -->
      <div>Bolus</div>
      <!-- bolus cells -->
      <div class="grid grid-cols-24 col-start-2 col-span-11 gap-2 px-2 py-1" id="titrate-control-grid">
        <div class="col-span-1 grid content-center place-items-center aspect-square"
          v-for="(item, index) in titrateGrid.bolus" :key="index">
          <select :disabled="buttonDisabled" :class="{ titratemodified: titrateGrid.bolus[index] !== '3' }"
            class="form-input titrate-select-input" name="basal" id="bolus-dropdown" v-model="titrateGrid.bolus[index]">
            <option :value="value" v-for="value in titrateLevels" :key="value">
              {{ (titrateLevelDesc as any)[value] }}
            </option>
          </select>
        </div>
      </div>
    </div>


    <div class="grid grid-cols-2">
      <div class="control-row" id="titrate-control-buttons">
        <div id="graph-button-div">
          <!-- {{visualizeButtonDisabled}} {{isOriginal}} -->
          <button class="btn w-48" id="graph-button" :disabled="visualizeButtonDisabled" @click="graphChanges">
            Visualize Changes
          </button>
        </div>
        <div>
          <button :disabled="buttonDisabled" class="btn w-48" id="reset-button" @click="resetButton">
            Reset
          </button>
        </div>
      </div>
      <div class="flex justify-end place-content-end my-1">
        <div>
          <!-- TODO THIS SHOULD CHANGE TO FUNCTION THAT GENERATES PROFILE
            THEN PASSES PROPS TO PROFILE ROUTE -->
          <!-- <router-link class="btn" :to="{ name: 'ProfileView' }">Generate Profile</router-link> -->
          <button :disabled="buttonDisabled" class="btn w-48" id="genprofile-button" @click="generateProfile">Generate
            Profile</button>
        </div>
      </div>
    </div>
    <!-- dev output -->
    <!-- <div id="v-model-test">
      {{ titrateGrid }}
    </div> -->

    <div>
      <div class="my-2" id="quantile-caption">
        <span class="font-semibold">Glucose comparison</span>
      </div>
      <div class="grid grid-cols-5">
        <div class="col-span-1 flex justify-start">
          <button class="group flex" :disabled="nominalDisabled" @click="toggleNominal">
            <div class="titrate-graph-labelcolor bg-neutral-400 group-disabled:bg-neutral-200"></div>
            <div class="group-disabled:text-gray-300"
              :class="{'line-through': nominalStrikethrough}">
              Nominal
              <!-- , {{nominalOff}}, {{nominalStrikethrough}} -->
            </div>
          </button>
        </div>
        <div class="col-span-1 flex justify-start">
          <button class="group flex" :disabled="optimalDisabled" @click="toggleOptimal">
            <div class="titrate-graph-labelcolor bg-sky-400 group-disabled:bg-sky-200"></div>
            <div class="group-disabled:text-gray-300"
              :class="{'line-through': optimalStrikethrough}">
              Optimal
              <!-- , {{optimalOff}}, {{optimalStrikethrough}} -->
            </div>
          </button>
        </div>
        <div class="col-span-1 flex justify-start">
          <button class="group flex" :disabled="modifiedDisabled" @click="toggleModified">
            <div class="titrate-graph-labelcolor bg-rose-400 group-disabled:bg-rose-200"></div>
            <div class="group-disabled:text-gray-300"
              :class="{'line-through': modifiedStrikethrough}">
              Modified
              <!-- , {{modifiedOff}}, {{modifiedStrikethrough}} -->
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="relative" id="quantile-container">
      <!-- loading hover -->
      <div v-if="subjectGraphLoading"
        class="z-10 w-64 h-20 rounded-lg drop-shadow-lg absolute grid content-center place-items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white">
        <div class="p-4 bg-white animate-pulse">
          <div class="font-semibold">Loading...</div>
          <!-- <div>(current wait time ~10 seconds)</div> -->
        </div>
      </div>
      <QuantileChart v-if="loaded" :graphableData="graphData" :loaded="loaded" dataType="glucose" />
    </div>
  </div>
</template>
  
<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSubjectIdStore } from '@/stores/SubjectIdStore'
import { useTitrateVariableStore } from '@/stores/TitrateVariableStore'
import SubjectDropdown from '@/components/SubjectDropdown.vue'
import QuantileChart from '@/components/QuantileChart.vue'
import SubjectGraphable from '@/types/SubjectGraphable'
import QuantileGraphable from '@/types/QuantileGraphable'
import TitrateGraphable from '@/types/TitrateGraphable'
import { api } from '@/functions/GlobalFunctions'
import { useApiURL } from '@/globalConfigPlugin'
import { isEmpty, cloneDeep, split } from 'lodash'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
// import { max } from 'lodash'

export default defineComponent({
  name: 'TitrationView',
  components: { SubjectDropdown, QuantileChart, VueDatePicker },
  props: {},
  setup() {
    const apiRootURL = useApiURL()
    const selected = ref('')
    const subjectIdStore = useSubjectIdStore()
    const titrateStore = useTitrateVariableStore()
    const route = useRoute()
    const router = useRouter()
    const tmpRootURL = 'https://qnsx3trrkj.execute-api.us-east-1.amazonaws.com/test'
    // console.log('hello titration view')
    selected.value = route.params.subjectId === undefined ? '' : route.params.subjectId as string

    const subjectGraphLoading = ref(false)
    const buttonDisabled = computed(() => {
      return selected.value === '' || subjectGraphLoading.value
    })

    const date = ref()

    const titrateLevels = ['5', '4', '3', '2', '1']
    const titrateLevelDesc = {
      '1': '🡳',
      '2': '🡶',
      '3': '',
      '4': '🡵',
      '5': '🡱',
    }
    const titrateGridColumns = 24
    const titrateGrid = ref({
      night: Array(titrateGridColumns).fill(false),
      // exercise: [false, false, false, false, false, true, true, true, true, false, false, false],
      basal: Array(titrateGridColumns).fill('3'),
      bolus: Array(titrateGridColumns).fill('3'),
    })
    const nightArray = ref(Array(titrateGridColumns).fill(false))

    const isOriginal = computed(() => {
      return (
        JSON.stringify(titrateGrid.value.night) === JSON.stringify(nightArray.value) &&
        JSON.stringify(titrateGrid.value.basal) === JSON.stringify(Array(titrateGridColumns).fill('3')) &&
        JSON.stringify(titrateGrid.value.bolus) === JSON.stringify(Array(titrateGridColumns).fill('3')))
    })

    const visualizeButtonDisabled = computed(() => {
      return buttonDisabled.value || isOriginal.value
    })

    function resetControl() {
      // subjectGraphLoading.value = true
      titrateGrid.value.night = cloneDeep(nightArray.value)
      titrateGrid.value.basal = Array(titrateGridColumns).fill('3')
      titrateGrid.value.bolus = Array(titrateGridColumns).fill('3')
      // graphAll('optimal')
    }
    // const titrateGridColumns = computed(() => {
    //   return Math.max(titrateGrid.value.night.length,
    //     titrateGrid.value.exercise.length,
    //     titrateGrid.value.basal.length,
    //     titrateGrid.value.bolus.length)
    // })

    // https://qnsx3trrkj.execute-api.us-east-1.amazonaws.com/test/generateprofile
    // https://qnsx3trrkj.execute-api.us-east-1.amazonaws.com/test/titrate

    // first time
    // if selected not ''
    // get titrate info

    // const graphableData = ref({} as QuantileGraphable)
    // loaded flag for QuantileChart etc, should be false when subj changes
    const loaded = ref(false)
    const nominalColor = 'rgba(163,163,163,0.5)'
    const optimalColor = 'rgba(56, 189, 248, 0.5)'
    const modifiedColor = 'rgba(251, 113, 133, 0.5)'

    const colorMap = {
      // 'teal-400': 'rgba(45, 212, 191, 0.5)',
      // 'cyan-400': 'rgba(34, 211, 238, 0.5)',
      // 'sky-400': 'rgba(56, 189, 248, 0.5)',
      'indigo-400': 'rgba(129, 140, 248, 0.5)',
      'violet-400': 'rgba(167, 139, 250, 0.5)',
      'purple-400': 'rgba(192, 132, 252, 0.5)',
      'fuchsia-400': 'rgba(232, 121, 249, 0.5)',
      'pink-400': 'rgba(244, 114, 182, 0.5)',
      'rose-400': 'rgba(251, 113, 133, 0.5)'
    }

    const emptyNominalTraceGroup = {
      type: 'glucose',
      traces: [] as any,
      colors: { inner: nominalColor }
    }
    const emptyOptimalTraceGroup = {
      type: 'glucose',
      traces: [] as any,
      colors: { inner: optimalColor }
    }
    const emptyModifiedTraceGroup = {
      type: 'glucose',
      traces: [] as any,
      colors: { inner: modifiedColor }
    }

    const nominalTraceGroup = ref(cloneDeep(emptyNominalTraceGroup))
    const optimalTraceGroup = ref(cloneDeep(emptyOptimalTraceGroup))
    const modifiedTraceGroup = ref(cloneDeep(emptyModifiedTraceGroup))

    // these control visibility of different traces
    // selecting a new subject resets these all to false
    // RESET button should also reset them all to false
    // VISUALIZE button should set optimal to true and modified to false
    const nominalOff = ref(false)
    const optimalOff = ref(false)
    const modifiedOff = ref(false)

    // these are booleans that track if we even have nominal/optimal/modified
    // traces stored
    const nominalDisabled = computed(() => {
      return isEmpty(nominalTraceGroup.value.traces)
    })
    const optimalDisabled = computed(() => {
      return isEmpty(optimalTraceGroup.value.traces)
    })
    const modifiedDisabled = computed(() => {
      return isEmpty(modifiedTraceGroup.value.traces)
    })

    // and these are booleans to control whether we display
    // a strikethrough. 
    // a disabled button should NEVER have a strikethrough
    // an enabled button only has a strikethrough if the corresponding
    // Off variable is true
    const nominalStrikethrough = computed(() => {
      return (!nominalDisabled.value && nominalOff.value)
    })
    const optimalStrikethrough = computed(() => {
      return (!optimalDisabled.value && optimalOff.value)
    })
    const modifiedStrikethrough = computed(() => {
      return (!modifiedDisabled.value && modifiedOff.value)
    })

    // finally the toggle methods to toggle visibility of traces on and off
    function toggleNominal() { nominalOff.value = !nominalOff.value }
    function toggleOptimal() { optimalOff.value = !optimalOff.value }
    function toggleModified() { modifiedOff.value = !modifiedOff.value }

    const graphData = computed(() => {
      console.log('graphData update...')
      const retGraphable = {} as QuantileGraphable
      let tmpTraceGroups = [] as any
      // tmpTraceGroups.push(emptyTraceGroup)
      if (!modifiedOff.value && !modifiedDisabled.value) {
        tmpTraceGroups.push(cloneDeep(modifiedTraceGroup.value))
      }
      if (!optimalOff.value && !optimalDisabled.value) {
        tmpTraceGroups.push(cloneDeep(optimalTraceGroup.value))
      }
      if (!nominalOff.value && !nominalDisabled.value) {
        tmpTraceGroups.push(cloneDeep(nominalTraceGroup.value))
      }
      console.log('generated graphData:',retGraphable)
      retGraphable.traceGroups = tmpTraceGroups
      return retGraphable
    })

    function resetTraces() {
      nominalTraceGroup.value = cloneDeep(emptyNominalTraceGroup)
      optimalTraceGroup.value = cloneDeep(emptyOptimalTraceGroup)
      modifiedTraceGroup.value = cloneDeep(emptyModifiedTraceGroup)
    }

    function resetNightControl() {
      nightArray.value = Array(titrateGridColumns).fill(false)
    }

    function resetButton() {
      resetControl()
      nominalOff.value = false
      optimalOff.value = false
      modifiedOff.value = false
      modifiedTraceGroup.value = cloneDeep(emptyModifiedTraceGroup)
      // graphAll('optimal')
    }

    // graphableData.value.traceGroups = []

    // function graphAll(traceToShow: "nominal" | "optimal" | "modified") {
    //   // TODO PULL FAKE NOMINAL TRACE GROUP
    //   // let traceGroups = [nominalTraceGroup]
    //   let traceGroups = []
    //   // console.log(nominalTraceGroup )
    //   console.log(`graphAll ${traceToShow}`)
    //   traceGroups.push(nominalTraceGroup)

    //   if (traceToShow === "optimal") { traceGroups.push(optimalTraceGroup) }
    //   else if (traceToShow === "modified") { traceGroups.push(modifiedTraceGroup) }

    //   console.log('graphAll tracegroups:', traceGroups)
    //   graphableData.value.traceGroups = cloneDeep(traceGroups)
    //   console.log('graphAll graphableData ref variable:', graphableData.value.traceGroups)
    //   subjectGraphLoading.value = false
    // }

    // get / update optimal data to graph
    const graphError = ref(null)
    function checkAndGraph() {
      if (selected.value === '') {
        resetNightControl()
        // buttondisabled is true automatically because selected === ''
      }
      else {
        loaded.value = false
        subjectGraphLoading.value = true
        // TODO pass dates as arguments
        // api.get<any>(`${apiRootURL}/titrate?subject_id=${selected.value}`).then(
        const req_url = `${apiRootURL}/titrate?subject_id=${selected.value}`
        console.log(`request to ${req_url}`)
        api.get<any>(req_url).then(
          (response: any) => {
            console.log('optimal success!')
            console.log(response)
            // graphableData.value = response.body.quant_data
            // TODO SHIM BECAUSE THIS ENDPOINT IS RETURNING STRING
            // const responseData = JSON.parse(response.body) as TitrateGraphable
            const responseData = response as TitrateGraphable
            // const parsedResponse = {} as QuantileGraphable
            // graphableData.value.id = selected.value
            // console.log(responseData)
            // quantile chart accepts QuantileGraphable
            if (typeof (responseData.night) !== 'undefined') {
              responseData.night.forEach((element: any, idx: number) => {
                titrateGrid.value.night[idx] = element === 1
                nightArray.value[idx] = element === 1
              })
            }
            if (typeof (responseData.quantNominal) !== 'undefined') {
              const nominalTraces = [
                { label: '25th Percentile', trace: responseData.quantNominal['glucose25th'] },
                { label: 'Median', trace: responseData.quantNominal['glucose50th'] },
                { label: '75th Percentile', trace: responseData.quantNominal['glucose75th'] },
              ]
              nominalTraceGroup.value = {
                type: 'glucose',
                traces: nominalTraces,
                colors: { inner: nominalColor }
              }
            }
            const optimalTraces = [
              { label: '25th Percentile', trace: responseData.quantOptimal['glucose25th'] },
              { label: 'Median', trace: responseData.quantOptimal['glucose50th'] },
              { label: '75th Percentile', trace: responseData.quantOptimal['glucose75th'] },
            ]
            optimalTraceGroup.value = {
              type: 'glucose',
              traces: optimalTraces,
              colors: { inner: optimalColor }
            }
            // graphAll('optimal')
            loaded.value = true
          }).catch(err => {
            graphError.value = err.message
            console.log(graphError.value)
          }).finally(() => {
            subjectGraphLoading.value = false
          })
      }
    }
    // first run on setup/load
    checkAndGraph()

    // then get nominal graph data
    // TESTING FOR NOW
    // ALSO TESTING LEAVING OUT THE LOADING FLAGS IN SECOND ASYNC CALL
    // IDK, SEEMS INTERESTING
    // const day1 = '1629417600'
    // const day2 = '1629590399'
    // const day1 = '1627344000'
    // const day2 = '1627862400'
    // function checkNominalGraph() {
    //   if (selected.value !== '') {
    //     loaded.value = false
    //     const req_url = `${apiRootURL}/getsubjects?subject_id=${selected.value}&day1=${day1}&day2=${day2}`
    //     console.log(`request to ${req_url}`)
    //     api.get<any>(req_url).then(
    //       (response: any) => {
    //         console.log('nominal success!')
    //         console.log(response)
    //         const responseData = response as SubjectGraphable

    //         const nominalTraces = [
    //           { label: '25th Percentile', trace: responseData['glucose25th'] },
    //           { label: 'Median', trace: responseData['glucose50th'] },
    //           { label: '75th Percentile', trace: responseData['glucose75th'] },
    //         ]
    //         console.log('intermediate nominal traces:', nominalTraces)
    //         nominalTraceGroup = {
    //           type: 'glucose',
    //           traces: nominalTraces,
    //           colors: { inner: nominalColor }
    //         }
    //         graphAll('nominal')
    //         loaded.value = true
    //       }).catch(err => {
    //         graphError.value = err.message
    //         console.log(graphError.value)
    //       }).finally(() => {
    //         // subjectGraphLoading.value = false
    //       }).then(() => {
    //         // CHAIN THESE TOGETHER, FIRST GET NOMINAL, THEN OPTIMAL
    //         checkAndGraph()
    //       })
    //   }
    // }

    // then first run on setup
    // checkNominalGraph()

    // ...then watch and update both on subject change
    watch(selected, () => {
      // checkAndGraph()
      resetTraces()
      resetControl()
      nominalOff.value = false
      optimalOff.value = false
      modifiedOff.value = false
      checkAndGraph()
    })

    function graphChanges() {
      subjectGraphLoading.value = true
      console.log('POST request to /titrate')
      // translate titrateGrid to API values
      const tNight = Array.from(titrateGrid.value.night, x => + x)
      const tBasal = titrateGrid.value.basal.map(Number)
      const tBolus = titrateGrid.value.bolus.map(Number)
      // console.log(tNight, tBasal, tBolus)
      const req_url = `${apiRootURL}/titrate?subject_id=${selected.value}`
      console.log(`request to ${req_url}`)
      api.post<any, any>(req_url, JSON.stringify({
        // subject_id: selected,
        titrate_control: {
          night: tNight,
          basal: tBasal,
          bolus: tBolus
        }
      })).then((response: any) => {
        console.log(response)
        const responseData = response as TitrateGraphable
        // TODO THESE SHOULD PROBABLY BE NAMED QUANT MODIFIED OR SOMETHING
        const modifiedTraces = [
          { label: '25th Percentile', trace: responseData.quantOptimal['glucose25th'] },
          { label: 'Median', trace: responseData.quantOptimal['glucose50th'] },
          { label: '75th Percentile', trace: responseData.quantOptimal['glucose75th'] },
        ]
        modifiedTraceGroup.value = {
          type: 'glucose',
          traces: modifiedTraces,
          colors: { inner: 'rgba(251, 113, 133, 0.5)' }
        }
        // change visibility correctly
        optimalOff.value = true
        modifiedOff.value = false
        // console.log(graphableData.value)

        // graphAll('modified')
      }).catch(err => {
        console.log(err.message)
      }).finally(() => {
        subjectGraphLoading.value = false
      })
      // api.get<any>(`${tmpRootURL}/titrateondemand?subject_id=${selected.value}`).then((response: any) => {
      //   console.log(response)
      // }).catch(err => {
      //   console.log(err.message)
      // })
    }

    function generateProfile() {
      // TODO REPLACE WITH ACTUAL COMPUTATION
      console.log('HARDCODED PROFILE GEN')
      router.push({ name: 'ProfileView', params: { subjectId: selected.value } })
    }

    return {
      selected, isOriginal, nightArray, titrateLevels, titrateLevelDesc, titrateGrid, titrateGridColumns, visualizeButtonDisabled,
      date, loaded, graphData, buttonDisabled, generateProfile, checkAndGraph, resetButton, graphChanges, subjectGraphLoading,
      nominalDisabled, optimalDisabled, modifiedDisabled, nominalStrikethrough, optimalStrikethrough, modifiedStrikethrough,
      nominalOff, optimalOff, modifiedOff, toggleNominal, toggleOptimal, toggleModified
    }
  },
})
</script>
