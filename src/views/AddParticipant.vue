
<template>
  <div class="add-participant">
    <div class="control-row" id="header">
      <h1 class="text-2xl font-bold">Add User</h1>
    </div>

    <form class="needs-validation" id="new-user-form" @submit="addNewUser">
      <div class="grid grid-cols-2 mt-4">
        <!-- form fields -->
        <div class="adduser-form-cell">
          <label for="validationCustom01">ID</label>
          <input type="text" class="adduser-text-input peer form-control" id="validationCustom01" placeholder="ID"
            required pattern="\d{5}">
          <div class="invalid-feedback">
            ID must be a 5-digit number that isn't yet assigned to an existing user.
          </div>
        </div>
        <div class="adduser-form-cell">
          <!-- <label for="validationCustom02"></label> -->
          <label for="validationCustom02">Gender</label>
          <select class="adduser-select-input peer" id="validationCustom02" required>
            <option disabled value="" selected>Select gender...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <div class="invalid-feedback">Please select a gender.</div>
        </div>
        <div class="adduser-form-cell">
          <label for="validationCustom03">Time Zone</label>
          <select class="adduser-select-input peer" id="validationCustom03" required>
            <option disabled value="" selected>Select time zone...</option>
            <!--  // America/New_York
                    // America/Chicago
                    // America/Denver
                    // America/Phoenix
                    // America/Los_Angeles
                    // America/Anchorage
                    // America/Adak
                    // Pacific/Honolulu
                  -->
            <option value="America/New_York">America/New_York</option>
            <option value="America/Chicago">America/Chicago</option>
            <option value="America/Denver">America/Denver</option>
            <option value="America/Phoenix">America/Phoenix</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="America/Anchorage">America/Anchorage</option>
            <option value="America/Adak">America/Adak </option>
            <option value="Pacific/Honolulu">Pacific/Honolulu</option>
          </select>
          <div class="invalid-feedback">Please select a time zone.</div>
        </div>
        <div class="adduser-form-cell">
          <label for="validationCustom04">TDI [U]</label>
          <input type="number" class="adduser-text-input peer" id="validationCustom04" placeholder="TDI" required
            step="0.01" min="1" max="250">
          <div class="invalid-feedback">
            TDI must be a numeric value from 1 to 250.
          </div>
        </div>
        <div class="adduser-form-cell">
          <label for="validationCustom06">Model number</label>
          <input type="text" class="adduser-text-input peer" id="validationCustom06" placeholder="Model Number"
            required>
          <div class="invalid-feedback">
            Please enter a model number.
          </div>
        </div>
        <div class="adduser-form-cell">
          <label for="validationCustom07">Weight</label>
          <input type="number" class="adduser-text-input peer" id="validationCustom07" placeholder="Weight [Kg]"
            required step="0.01" min="10" max="300">
          <div class="invalid-feedback">
            Weight must be a positive number from 10 to 300.
          </div>
        </div>
        <div class="adduser-form-cell">
          <label for="validationCustom08">Serial Number</label>
          <input type="text" class="adduser-text-input peer" id="validationCustom08" placeholder="Serial Number"
            required>
          <div class="invalid-feedback">
            Please enter a serial number.
          </div>
        </div>
        <div class="adduser-form-cell">
          <label for="validationCustom09">Height</label>
          <input type="number" class="adduser-text-input peer" id="validationCustom09" placeholder="Height [cm]"
            required>
          <div class="invalid-feedback">
            Height must be a positive integer from 10 to 300.
          </div>
        </div>
        <div class="adduser-form-cell">
          <label for="validationCustom10">Email</label>
          <input type="email" class="adduser-text-input peer" id="validationCustom10"
            placeholder="fake.name@example.com" required>
          <div class="invalid-feedback">
            Must be a valid email.
          </div>
        </div>
        <div class="adduser-form-cell">
          <label for="validationCustom11">Age</label>
          <input type="number" class="adduser-text-input peer" id="validationCustom11" placeholder="Age [years]"
            required>
          <div class="invalid-feedback">
            Age must be a positive integer from 1 to 99.
          </div>
        </div>
        <div class="adduser-form-cell">
          <label for="validationCustom12">Start Date</label>
          <input type="date" class="adduser-text-input peer" id="validationCustom12" required>
          <div class="invalid-feedback">
            Please enter a start date.
          </div>
        </div>
      </div> <!-- end form fields -->
      <!-- "sumbit" control -->
      <div class="adduser-form-cell grid content-center place-items-center">
        <button class="btn w-96 grid content-center place-items-center" :disabled="genProfileDisabled">
          Initialize Titration and Add User
        </button>
      </div>
    </form>

  </div>
</template>
  
<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'AddParticipant',
  components: {},
  setup() {
    const router = useRouter()
    // TODO this should check if there's a value for subjectID i guess
    const genProfileDisabled = ref(true)
    // TODO v-model everything

    function addNewUser(e: Event) {
      e.preventDefault()
    }
    function generateProfile() {
      // TODO real variables
      // pull subjectid from valid subjid field
      router.push({ name: 'ProfileView', params: { subjectId: '81101' } })
    }

    return { addNewUser, generateProfile, genProfileDisabled }
  }
})
</script>