
<template>
  <div class="add-participant">
    <div class="control-row-header" id="header">
      <h1 class="text-2xl font-bold">Add User</h1>
    </div>

    <div class="grid grid-cols-2 mt-4">
      <!-- form fields -->
      <div class="adduser-form-cell">
        <div class="flex relative justify-between">
          <label for="validationCustom01">ID</label>
          <div class="force-center-content">
            <svg class="w-5 peer" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"
              viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <ToolTip displaySide="mid">
              <div class="text-sm px-2">
                <div class="font-semibold">Existing user IDs:</div>
                <div v-for="subjid in subjectIDs" :key="subjid">{{ subjid }}</div>
              </div>
            </ToolTip>
          </div>
        </div>
        <input type="text" :disabled="modalVisible || subjectsLoading" v-model="inputObj.id"
          class="custom-text-input peer form-control" :class="{ 'custom-valid': idValid, 'custom-invalid': !idValid }"
          id="validationCustom01" :placeholder="idFieldLoading" required pattern="\d{5}">
        <div class="custom-invalid-feedback" :class="{ 'invisible': idValid, 'visible': !idValid }">
          ID must be a 5-digit number that isn't yet in use.
        </div>
        <div v-if="debugModeStore.debugMode">
          <div>idNotTaken: {{ idNotTaken }}</div>
          <div>idIsDigits: {{ idIsDigits }}</div>
          <div>idIsLen: {{ idIsLen }}</div>
          <div>idValid: {{ idValid }}</div>
        </div>
      </div>

      <div class="adduser-form-cell">
        <label for="validationCustom10">Email</label>
        <input :disabled="modalVisible" type="email" v-model="inputObj.email" class="adduser-text-input peer"
          id="validationCustom10" placeholder="fake.name@example.com" required>
        <div class="invalid-feedback">
          Must be a valid email.
        </div>
      </div>

      <div v-if="groupComputed.includes('crc') || groupComputed.includes('admin')" class="adduser-form-cell">
        <!-- <label for="validationCustom02"></label> -->
        <label for="validationCustom13">Physician</label>
        <select :disabled="modalVisible || physAndCRCLoading" v-model="inputObj.physician" class="adduser-select-input peer"
          id="validationCustom02" required>
          <option disabled value="" selected>{{ physAndCRCLoading ? 'Loading...' : 'Select Physician...'}}</option>
          <option v-for="physician in physicians" :value="physician[0]" :key="physician[0]">{{ physician[1] }} {{
              physician[2]
          }}</option>
        </select>
        <div class="invalid-feedback">Please select a Physician.</div>
      </div>
      <div v-if="groupComputed.includes('physician') || groupComputed.includes('admin')" class="adduser-form-cell">
        <!-- <label for="validationCustom02"></label> -->
        <label for="validationCustom14">CRC</label>
        <select :disabled="modalVisible || physAndCRCLoading" v-model="inputObj.crc" class="adduser-select-input peer"
          id="validationCustom02" required>
          <option disabled value="" selected>{{ physAndCRCLoading ? 'Loading...' : 'Select CRC...'}}</option>
          <option v-for="crc in crcs" :value="crc[0]" :key="crc[0]">{{ crc[1] }} {{ crc[2] }}</option>
        </select>
        <div class="invalid-feedback">Please select a CRC.</div>
      </div>

      <div class="adduser-form-cell">
        <label for="validationCustom07">Weight [Kg]</label>
        <input type="number" :disabled="modalVisible" v-model="inputObj.weight" class="adduser-text-input peer"
          id="validationCustom07" placeholder="Weight [Kg]" required :step="weightStep" :min="weightMin"
          :max="weightMax">
        <div class="invalid-feedback">
          Weight must be a positive number from {{ weightMin }} to {{ weightMax }}.
        </div>
      </div>

      <div class="adduser-form-cell">
        <label for="validationCustom09">Height [cm]</label>
        <input type="number" :disabled="modalVisible" v-model="inputObj.height" class="adduser-text-input peer"
          id="validationCustom09" placeholder="Height [cm]" required :step="heightStep" :min="heightMin"
          :max="heightMax">
        <div class="invalid-feedback">
          Height must be a positive integer from {{ heightMin }} to {{ heightMax }}.
        </div>
      </div>

      <div class="adduser-form-cell">
        <label for="validationCustom11">Age [years]</label>
        <input type="number" :disabled="modalVisible" v-model="inputObj.age" class="adduser-text-input peer"
          id="validationCustom11" placeholder="Age [years]" required :min="ageMin" :max="ageMax">
        <div class="invalid-feedback">
          Age must be a positive integer from {{ ageMin }} to {{ ageMax }}.
        </div>
      </div>

      <div class="adduser-form-cell">
        <!-- <label for="validationCustom02"></label> -->
        <label for="validationCustom02">Sex</label>
        <select :disabled="modalVisible" v-model="inputObj.sex" class="adduser-select-input peer"
          id="validationCustom02" required>
          <option disabled value="" selected>Select sex...</option>
          <option v-for="sex in sexes" :value="sex" :key="sex">{{ sex }}</option>
        </select>
        <div class="invalid-feedback">Please select a sex.</div>
      </div>

      <div class="adduser-form-cell">
        <label for="validationCustom04">Basal Dose</label>
        <input :disabled="modalVisible" type="number" v-model="inputObj.basalDose" class="adduser-text-input peer"
          id="validationCustom04" placeholder="Basal Dose" required :step="basalStep" :min="basalMin" :max="basalMax">
        <div class="invalid-feedback">
          Basal Dose must be a numeric value from {{ basalMin }} to {{ basalMax }}.
        </div>
      </div>

      <div class="adduser-form-cell">
        <label for="validationCustom04">Basal Dose Time</label>
        <input :disabled="modalVisible" type="time" v-model="inputObj.basalDoseTime" class="adduser-text-input peer"
          id="validationCustom04" placeholder="Basal Dose Time" required min="00:00" max="23:59">
        <div class="invalid-feedback">
          Basal Dose Time must be a valid time.
        </div>
      </div>

      <div class="adduser-form-cell">
        <label for="validationCustom12">Start Date</label>
        <input type="date" :disabled="modalVisible" v-model="inputObj.startDate" class="adduser-text-input peer"
          id="validationCustom12" required>
        <div class="invalid-feedback">
          Please enter a start date.
        </div>
      </div>

      <div class="adduser-form-cell">
        <label for="validationCustom03">Time Zone</label>
        <select :disabled="modalVisible" v-model="inputObj.timezone" class="adduser-select-input peer"
          id="validationCustom03" required>
          <option disabled value="" selected>Select time zone...</option>
          <option v-for="tz in timezones" :value="tz" :key="tz">{{ tz }}</option>
        </select>
        <div class="invalid-feedback">Please select a time zone.</div>
      </div>

      <div class="adduser-form-cell">
        <label for="validationCustom03">Intervention Arm</label>
        <select :disabled="modalVisible" v-model="inputObj.interventionArm" class="adduser-select-input peer"
          id="validationCustom03" required>
          <!-- todo v-model real arms -->
          <option disabled value="" selected>Select intervention arm...</option>
          <option value="0">Control (0)</option>
          <option value="1">Experimental (1)</option>
        </select>
        <div class="invalid-feedback">Please select an intervention arm.</div>
      </div>

      <div class="adduser-form-cell">
        <label for="validationCustom06">Model number</label>
        <input :disabled="modalVisible" type="text" v-model="inputObj.modelNumber" class="adduser-text-input peer"
          id="validationCustom06" placeholder="Model Number" required>
        <div class="invalid-feedback">
          Please enter a model number.
        </div>
      </div>

      <div class="adduser-form-cell">
        <label for="validationCustom08">Serial Number</label>
        <input :disabled="modalVisible" type="text" v-model="inputObj.serialNumber" class="adduser-text-input peer"
          id="validationCustom08" placeholder="Serial Number" required>
        <div class="invalid-feedback">
          Please enter a serial number.
        </div>
      </div>


      <div class="adduser-form-cell">
        <label for="validationCustom04">Reservoir Size</label>
        <input :disabled="modalVisible" type="number" v-model="inputObj.reservoirSize" class="adduser-text-input peer"
          id="validationCustom04" placeholder="Reservoir Size" required :step="reservoirStep" :min="reservoirMin"
          :max="reservoirMax">
        <div class="invalid-feedback">
          Reservoir size must be a numeric value from {{ reservoirMin }} to {{ reservoirMax }}.
        </div>
      </div>

      <div class="adduser-form-cell">
        <label for="validationCustom04">Max Dose</label>
        <input :disabled="modalVisible" type="number" v-model="inputObj.maxDose" class="adduser-text-input peer"
          id="validationCustom04" placeholder="Max Dose" required :step="maxDoseStep" :min="maxDoseMin"
          :max="maxDoseMax">
        <div class="invalid-feedback">
          Max dose must be a numeric value from {{ maxDoseMin }} to {{ maxDoseMax }}.
        </div>
      </div>

      <div class="adduser-form-cell">
        <label for="validationCustom04">Min Dose</label>
        <input :disabled="modalVisible" type="number" v-model="inputObj.minDose" class="adduser-text-input peer"
          id="validationCustom04" placeholder="Min Dose" required :step="minDoseStep" :min="minDoseMin"
          :max="minDoseMax">
        <div class="invalid-feedback">
          Min dose must be a numeric value from {{ minDoseMin }} to {{ minDoseMax }}.
        </div>
      </div>

      <div class="adduser-form-cell">
        <label for="validationCustom04">Dose Increment</label>
        <input :disabled="modalVisible" type="number" v-model="inputObj.doseIncrement" class="adduser-text-input peer"
          id="validationCustom04" placeholder="Dose Increment" required :step="doseIncrementStep"
          :min="doseIncrementMin" :max="doseIncrementMax">
        <div class="invalid-feedback">
          Dose Increment must be a numeric value from {{ doseIncrementMin }} to {{ doseIncrementMax }}.
        </div>
      </div>
    </div> <!-- end form fields -->
    <div v-if="debugModeStore.debugMode">
      <div>inputvalid: {{ inputValid.valid }}</div>
      <div>problems: {{ inputValid.problems }}</div>
      <div>inputobj: {{ inputObj }}</div>
    </div>
    <!-- "sumbit" control -->
    <div class="adduser-form-cell flex justify-center">
      <div class="adduser-form-cell flex justify-center">
        <button class="btn w-96" :disabled="!inputValid.valid && !debugModeStore.debugMode" @click="showModal">
          Initialize Titration and Add User
        </button>
      </div>
    </div>
    <!-- "are you sure" modal -->
    <div v-if="modalVisible" class="adduser-modal bg-transparent" id="modal-container">
      <LoadingHover v-if="addUserLoading">
        <div class="font-semibold">Submitting...</div>
      </LoadingHover>
      <div class="bg-gradient-to-b from-orange-100 from-0% via-white via-5% to-white to-10% rounded-lg w-full p-4">
        <div class="flex justify-center my-6 font-semibold">
          Review Information:
        </div>
        <div class="p-4 rounded-lg bg-white">
          <div class="flex justify-center mt-2 mb-4">
            <div class="font-semibold mx-2">Primary Info:</div>
          </div>
          <div class="p-4 mb-4 rounded-lg bg-gray-100">
            <div v-for="(value, key) in inputObj" class="grid grid-cols-2 px-4 py-1" :key="key">
              <div class="font-semibold">{{ (inputNameMap as any)[key] }}</div>
              <div>{{ value }}</div>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-lg border-2 border-orange-300">
          <div class="control-row font-semibold">Confirm information and add subject to system?</div>
          <div class="flex justify-between gap-4 mt-4 mb-2">
            <button class="profile-confirm-btn w-64 bg-gray-100" @click="hideModal" :disabled="addUserLoading">
              Cancel
            </button>
            <button class="profile-confirm-btn w-64 bg-emerald-100 font-semibold" @click="addUser"
              :disabled="addUserLoading">
              {{ addUserLoading ? 'Submitting...' : 'Confirm' }}
            </button>
            <button v-if="debugModeStore.debugMode" class="profile-confirm-btn w-64 bg-rose-300 font-semibold"
              @click="addUserRedirect">
              Redirect only
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebugModeStore } from '@/stores/debugModeStore'
import { useErrorStore } from '@/stores/ErrorStore'
import { useAuthenticator } from '@aws-amplify/ui-vue'
import { api } from '@/functions/GlobalFunctions'
import { useApiURL } from '@/globalConfigPlugin'
import { cloneDeep, lowerCase } from 'lodash'
import ToolTip from '@/components/ToolTip.vue'
import LoadingHover from '@/components/LoadingHover.vue'

export default defineComponent({
  name: 'AddParticipant',
  components: { LoadingHover, ToolTip },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const apiRootURL = useApiURL()
    const errors = useErrorStore()
    const componentName = 'AddParticipant'
    const auth = useAuthenticator()
    const groupComputed = computed(() => {
      let group = [] as string[]
      if (typeof (auth.user) !== 'undefined' &&
        typeof (auth.user.signInUserSession) !== 'undefined' &&
        typeof (auth.user.signInUserSession.idToken.payload["cognito:groups"]) !== 'undefined') {
        group = auth.user.signInUserSession.idToken.payload["cognito:groups"].map(lowerCase)
      }
      console.log(`group: ${group}`)
      return group
    })
    const tokenComputed = computed(() => {
      // 'Authorization': cognitoUser.signInUserSession.idToken.jwtToken
      let token = ''
      if (typeof (auth.user.signInUserSession) !== 'undefined' && typeof (auth.user.signInUserSession.idToken.jwtToken) !== 'undefined') {
        token = auth.user.signInUserSession.idToken.jwtToken
      }
      console.log(`token: ${token}`)
      return token
    })

    const debugModeStore = useDebugModeStore()

    const subjectIDs = ref([] as string[])
    // username 
    // email
    // weight
    // height
    // age
    // sex
    // basalDoseValue
    // basalDoseTime
    // start date
    // intervention arm
    // model number
    // serial number
    // reservoir size 
    // max does
    // min dose
    // dose increment
    // time zone

    const timezones = [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Phoenix',
      'America/Los_Angeles',
      'America/Anchorage',
      'America/Adak',
      'Pacific/Honolulu',
    ]
    const physicians = ref([] as string[])
    const crcs = ref([] as string[])
    const sexes = [
      'Male',
      'Female'
    ]
    // const tdiMin = 1
    // const tdiMax = 250
    // const tdiStep = 0.01
    const weightMin = 10
    const weightMax = 300
    const weightStep = 0.01
    const heightMin = 10
    const heightMax = 300
    const heightStep = 0.1
    const ageMin = 1
    const ageMax = 99
    const basalStep = 0.01
    const basalMin = 1
    const basalMax = 250
    const reservoirStep = 0.01
    const reservoirMin = 1
    const reservoirMax = 900
    const maxDoseStep = 0.01
    const maxDoseMin = 1
    const maxDoseMax = 250
    const minDoseStep = 0.01
    const minDoseMin = 1
    const minDoseMax = 250
    const doseIncrementStep = 0.1
    const doseIncrementMin = 0.5
    const doseIncrementMax = 5

    const subjectsLoading = ref(false)
    const subjectsErrors = ref(null)
    const idFieldLoading = computed(() => {
      return subjectsLoading.value ? 'Loading IDs...' : 'ID'
    })
    function loadSubjectIDS() {
      subjectsLoading.value = true
      // Endpoint: // /getallparticipantids
      // Input: username(string)
      const endpoint = 'getparticipantidssupervisedbytheuser'
      console.log(`GET request to /${endpoint}`)
      const req_url = `${apiRootURL}/${endpoint}?username=${auth.user.username}`
      console.log(`request to ${req_url}`)
      api.getAuth<any>(req_url, tokenComputed.value).then(
        (response: any[]) => {
          // sites.value = ['site 1', 'site 2', 'site 3']
          console.log(`successful ${endpoint} request`)
          console.log(response)
          if (typeof (response) !== 'undefined') {
            subjectIDs.value = response.map(function (value, index) {
              return value.id
            })
          }
          // TODO ADD LOGIC THAT POPULATES EITHER
          // physicians OR crcs
          // DEPENDING ON USER GROUP
        }).catch(err => {
          subjectsErrors.value = err.message
          console.log(err.message)
          errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
        }).finally(() => {
          subjectsLoading.value = false
        })
    }
    loadSubjectIDS()

    const physAndCRCLoading = ref(false)
    const physAndCRCErrors = ref(null)
    function loadPhysAndCRC() {
      physAndCRCLoading.value = true
      // Endpoint: /getphysiciansandcrcs 
      // Method: GET
      // Input: username(string)
      console.log('GET request to /getphysiciansandcrcs')
      const req_url = `${apiRootURL}/getphysiciansandcrcs?username=${auth.user.username}&role=${groupComputed.value[0]}`
      console.log(`request to ${req_url}`)
      api.getAuth<any>(req_url, tokenComputed.value).then(
        (response: any) => {
          // sites.value = ['site 1', 'site 2', 'site 3']
          console.log('successful getphysiciansandcrcs request')
          console.log(response)
          if (typeof (response.physicians) !== 'undefined') {
            physicians.value = response.physicians
          }
          if (typeof (response.crcs) !== 'undefined') {
            crcs.value = response.crcs
          }
          // TODO ADD LOGIC THAT POPULATES EITHER
          // physicians OR crcs
          // DEPENDING ON USER GROUP
        }).catch(err => {
          physAndCRCErrors.value = err.message
          console.log(err.message)
          errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`)
        }).finally(() => {
          physAndCRCLoading.value = false
        })
    }
    loadPhysAndCRC()

    const modalVisible = ref(false)

    const inputObjOrig = ref({
      id: '',
      crc: '',
      physician: '',
      sex: '',
      height: null as number | null,
      weight: null as number | null,
      age: null as number | null,
      // email: '',
      timezone: '',
      modelNum: '',
      serial: '',
      // tdi: null as number | null,
      tdiBaseline: null as number | null,
      startDate: ''
    })

    const inputObj = ref({
      id: '',
      crc: '',
      physician: '',
      email: '',
      weight: null as number | null,
      height: null as number | null,
      age: null as number | null,
      sex: '',
      basalDose: null as number | null,
      basalDoseTime: '',
      startDate: '',
      timezone: '',
      interventionArm: '',
      modelNumber: '',
      serialNumber: '',
      reservoirSize: null as number | null,
      maxDose: null as number | null,
      minDose: null as number | null,
      doseIncrement: null as number | null,
    })

    const inputNameMap = ref({
      id: 'Subject ID',
      crc: 'CRC',
      physician: 'Physician',
      email: 'Email',
      weight: 'Weight',
      height: 'Height',
      age: 'Age',
      sex: 'Sex',
      basalDose: 'Basal Dose',
      basalDoseTime: 'Basal Dose Time',
      startDate: 'Start Date',
      timezone: 'Time Zone',
      interventionArm: 'Intervention Arm',
      modelNumber: 'Model Number',
      serialNumber: 'Serial Number',
      reservoirSize: 'Reservoir Size',
      maxDose: 'Max Dose',
      minDose: 'Min Dose',
      doseIncrement: 'Dose Increment',
    })

    // had to pull this stuff out of inputValid to check ID manually against list
    const idNotTaken = computed(() => {
      // console.log(`${inputObj.value.id}: ${!subjectIDs.value.includes(inputObj.value.id)}`)
      return !subjectIDs.value.includes(inputObj.value.id)
    })
    const idRegex = /\d{5}/
    const idIsDigits = computed(() => { return inputObj.value.id.match(idRegex) !== null })
    const idIsLen = computed(() => { return inputObj.value.id.length === 5 })
    const idValid = computed(() => { return idNotTaken.value && idIsDigits.value && idIsLen.value })

    const inputValid = computed(() => {
      const problems = [] as string[]
      let validTmp = true

      if (!idIsDigits.value) { problems.push('ID must be comprised of only digits') }
      if (!idIsLen.value) { problems.push('ID must be 5 characters in length') }
      if (!idNotTaken.value) { problems.push('ID must not already be assigned to an existing subject') }
      validTmp &&= idIsDigits.value && idIsLen.value && idNotTaken.value

      const crcValid = inputObj.value.crc !== ''
      const physicianValid = inputObj.value.physician !== ''
      if (groupComputed.value.includes('crc') || groupComputed.value.includes('admin')) {
        if (!physicianValid) { problems.push('Select a physician') }
        validTmp &&= physicianValid
      }
      if (groupComputed.value.includes('physician') || groupComputed.value.includes('admin')) {
        if (!crcValid) { problems.push('Select a CRC') }
        validTmp &&= crcValid
      }

      const sexValid = sexes.includes(inputObj.value.sex)
      if (!sexValid) { problems.push('Select a sex') }
      validTmp &&= sexValid

      const timezoneValid = timezones.includes(inputObj.value.timezone)
      if (!timezoneValid) { problems.push('Select a timezone') }
      validTmp &&= timezoneValid

      const modelNumValid = inputObj.value.modelNumber !== ''
      if (!modelNumValid) { problems.push('Input a model number') }
      validTmp &&= modelNumValid

      const serialValid = inputObj.value.serialNumber !== ''
      if (!serialValid) { problems.push('Input a serial number') }
      validTmp &&= serialValid

      const dateValid = inputObj.value.startDate !== ''
      validTmp &&= dateValid

      // const weightMin = 10
      // const weightMax = 300
      // const weightStep = 0.01
      // const heightMin = 10
      // const heightMax = 300
      // const heightStep = 0.1
      const weightIsNum = typeof (inputObj.value.weight) === 'number'
      const weightInRange = Number(inputObj.value.weight) >= weightMin && Number(inputObj.value.weight) <= weightMax
      if (!weightIsNum) { problems.push('Input a weight value') }
      if (!weightInRange) { problems.push(`Weight input of ${inputObj.value.weight} is not between ${weightMin} and ${weightMax}`) }
      validTmp &&= weightIsNum && weightInRange

      const heightIsNum = typeof (inputObj.value.height) === 'number'
      const heightInRange = Number(inputObj.value.height) >= heightMin && Number(inputObj.value.height) <= heightMax
      if (!heightIsNum) { problems.push('Input a height value') }
      if (!heightInRange) { problems.push(`Height input of ${inputObj.value.height} is not between ${heightMin} and ${heightMax}`) }
      validTmp &&= heightIsNum && heightInRange
      // const ageMin = 1
      // const ageMax = 99
      const ageIsNum = typeof (inputObj.value.age) === 'number'
      const ageInRange = Number(inputObj.value.age) >= ageMin && Number(inputObj.value.age) <= ageMax
      if (!ageIsNum) { problems.push('Input an age value') }
      if (!ageInRange) { problems.push(`Age input of ${inputObj.value.age} is not between ${ageMin} and ${ageMax}`) }
      validTmp &&= ageIsNum && ageInRange
      // const basalStep = 0.01
      // const basalMin = 1
      // const basalMax = 250
      const basalIsNum = typeof (inputObj.value.basalDose) === 'number'
      const basalInRange = Number(inputObj.value.basalDose) >= basalMin && Number(inputObj.value.basalDose) <= basalMax
      if (!basalIsNum) { problems.push('Input a basal dose value') }
      if (!basalInRange) { problems.push(`Basal dose input of ${inputObj.value.basalDose} is not between ${basalMin} and ${basalMax}`) }
      validTmp &&= basalIsNum && basalInRange

      const basalTimeValid = inputObj.value.basalDoseTime !== ''
      validTmp &&= basalTimeValid
      // const reservoirStep = 0.01
      // const reservoirMin = 1
      // const reservoirMax = 250
      const reservoirIsNum = typeof (inputObj.value.reservoirSize) === 'number'
      const reservoirInRange = Number(inputObj.value.reservoirSize) >= reservoirMin && Number(inputObj.value.reservoirSize) <= reservoirMax
      if (!reservoirIsNum) { problems.push('Input a reservoir size value') }
      if (!reservoirInRange) { problems.push(`Reservoir size input of ${inputObj.value.reservoirSize} is not between ${reservoirMin} and ${reservoirMax}`) }
      validTmp &&= reservoirIsNum && reservoirInRange
      // const maxDoseStep = 0.01
      // const maxDoseMin = 1
      // const maxDoseMax = 250
      const maxDoseIsNum = typeof (inputObj.value.maxDose) === 'number'
      const maxDoseInRange = Number(inputObj.value.maxDose) >= maxDoseMin && Number(inputObj.value.maxDose) <= maxDoseMax
      if (!maxDoseIsNum) { problems.push('Input a max dose value') }
      if (!maxDoseInRange) { problems.push(`Max dose input of ${inputObj.value.maxDose} is not between ${maxDoseMin} and ${maxDoseMax}`) }
      validTmp &&= maxDoseIsNum && maxDoseInRange
      // const minDoseStep = 0.01
      // const minDoseMin = 1
      // const minDoseMax = 250
      const minDoseIsNum = typeof (inputObj.value.minDose) === 'number'
      const minDoseInRange = Number(inputObj.value.minDose) >= minDoseMin && Number(inputObj.value.minDose) <= minDoseMax
      if (!minDoseIsNum) { problems.push('Input a min dose value') }
      if (!minDoseInRange) { problems.push(`Min dose input of ${inputObj.value.minDose} is not between ${minDoseMin} and ${minDoseMax}`) }
      validTmp &&= minDoseIsNum && minDoseInRange
      // const doseIncrementStep = 0.01
      // const doseIncrementMin = 1
      // const doseIncrementMax = 250
      const doseIncrementIsNum = typeof (inputObj.value.doseIncrement) === 'number'
      const doseIncrementInRange = Number(inputObj.value.doseIncrement) >= doseIncrementMin && Number(inputObj.value.doseIncrement) <= doseIncrementMax
      if (!doseIncrementIsNum) { problems.push('Input a dose increment value') }
      if (!doseIncrementInRange) { problems.push(`Dose increment input of ${inputObj.value.doseIncrement} is not between ${doseIncrementMin} and ${doseIncrementMax}`) }
      validTmp &&= doseIncrementIsNum && doseIncrementInRange

      return {
        valid: validTmp,
        problems: problems,
      }
    })

    function setPhysOrCRC() {
      const selfVal = auth.user.username
      if (groupComputed.value.includes('crc')) {
        inputObj.value.crc = selfVal
      } else if (groupComputed.value.includes('physician')) {
        inputObj.value.physician = selfVal
      }
    }

    function showModal() {
      setPhysOrCRC()
      modalVisible.value = true
      // profEditable.value = false
      // tirEditMode.value = false
    }

    function hideModal() {
      modalVisible.value = false
    }

    const addUserLoading = ref(false)
    const addUserErrors = ref(null)
    function addUser() {
      addUserLoading.value = true
      const requestObj = {
        requestor: {
          username: auth.user.username,
          role: groupComputed.value[0],
        },
        // new_user: {
        //   // firstname: 'none',
        //   // lastname: 'none',
        //   username: inputObj.value.id,
        //   // email: inputObj.value.email,
        //   role: 'participant',
        //   password: 'none',
        //   weight: inputObj.value.weight,
        //   height: inputObj.value.height,
        //   age: inputObj.value.age,
        //   sex: inputObj.value.sex.toLowerCase(),
        //   // tdi: inputObj.value.tdi,
        //   tdi_baseline: inputObj.value.tdiBaseline,
        //   idps: [profileSuggAPIFormat.value],
        //   idpa: [profileAPIFormat.value],
        //   sleep: initSleep.value,
        //   startDate: inputObj.value.startDate,
        //   model_number: inputObj.value.modelNum,
        //   serial_number: inputObj.value.serial,
        //   tz: inputObj.value.timezone,
        //   active_profile: 0,
        // },
        new_user: {
          username: inputObj.value.id,
          crc: inputObj.value.crc,
          physician: inputObj.value.physician,
          role: 'participant',
          email: inputObj.value.email,
          weight: inputObj.value.weight,
          height: inputObj.value.height,
          age: inputObj.value.age,
          sex: inputObj.value.sex,
          basalDose: inputObj.value.basalDose,
          basalDoseTime: inputObj.value.basalDoseTime,
          startDate: inputObj.value.startDate,
          tz: inputObj.value.timezone,
          interventionArm: inputObj.value.interventionArm,
          model_number: inputObj.value.modelNumber,
          serial_number: inputObj.value.serialNumber,
          reservoirSize: inputObj.value.reservoirSize,
          maxDose: inputObj.value.maxDose,
          minDose: inputObj.value.minDose,
          doseIncrement: inputObj.value.doseIncrement,
        },
        project: 'novonordisktitration'
      }

      console.log('POST request to /addnewuser')
      console.log(requestObj)
      const req_url = `${apiRootURL}/addnewuser?username=${auth.user.username}`
      console.log(`request to ${req_url}`)
      api.postAuth<any, any>(req_url, tokenComputed.value, JSON.stringify(
        requestObj
      )).then((response: any) => {
        console.log(response)
        addUserRedirect()
      }).catch(err => {
        console.log(err.message)
        addUserErrors.value = err.message
        errors.errorLog(`${componentName}; request to ${req_url}: ${err.message}`, true)
      }).finally(() => {
        addUserLoading.value = false
      })
    }

    function addUserRedirect() {
      router.push({ name: 'StudyOverview' })
    }

    return {
      debugModeStore, inputObj, timezones,
      sexes, weightMin, weightMax, weightStep, heightMin, heightMax,
      heightStep, ageMin, ageMax, inputValid, addUser, auth, groupComputed, route,
      modalVisible, showModal, hideModal, inputNameMap,
      addUserRedirect, physicians,
      crcs, subjectsLoading, idValid, idNotTaken, idIsDigits, idIsLen, addUserErrors,
      addUserLoading, subjectsErrors, idFieldLoading,
      subjectIDs, basalStep, basalMin, basalMax, reservoirStep, reservoirMin, reservoirMax,
      maxDoseStep, maxDoseMin, maxDoseMax, minDoseStep, minDoseMin, minDoseMax, doseIncrementStep,
      doseIncrementMin, doseIncrementMax, physAndCRCLoading
    }
  }
})
</script>