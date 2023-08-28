<template>
    <div class="add-participant">
        <div class="control-row-header" id="header">
            <h1 class="text-2xl font-bold">Add Physician</h1>
        </div>
        <form class="needs-validation" id="new-user-form" @submit="addNewPhysician">
            <div class="grid grid-cols-2 mt-4">
                <!-- form fields -->

                <div class="adduser-form-cell">
                    <label for="validationCustom01">First name</label>
                    <input type="text" class="adduser-text-input peer form-control" id="validationCustom01" placeholder="First name"
                        required v-model="firstname">
                    <div class="invalid-feedback">Please enter a valid first name.</div>
                </div>
                <div class="adduser-form-cell">
                    <!-- <label for="validationCustom02"></label> -->
                    <label for="validationCustom02">Last name</label>
                    <input type="text" class="adduser-text-input peer form-control" id="validationCustom02" placeholder="First name"
                        required v-model="lastname">
                    <div class="invalid-feedback">Please select a valid last name.</div>
                </div>
                
                <div class="adduser-form-cell">
                    <label for="validationCustom03">Email</label>
                    <input type="email" class="adduser-text-input peer" id="validationCustom03"
                        placeholder="fake.name@example.com" required v-model="email">
                    <div class="invalid-feedback">
                        Must be a valid email.
                    </div>
                </div>
                <div class="adduser-form-cell">
                    <label for="validationCustom04">Status</label>
                    <select class="adduser-select-input peer" id="validationCustom04" required v-model="status">
                        <option disabled value="" selected>Select active status...</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                    <div class="invalid-feedback">
                        Select active status of the physician.
                    </div>
                </div>

                <div class="adduser-form-cell">
                    <label for="validationCustom05">Time Zone</label>
                    <select class="adduser-select-input peer" id="validationCustom05" required v-model="timezone">
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

            </div> <!-- end form fields -->
            <!-- "sumbit" control -->
            <div class="adduser-form-cell grid content-center place-items-center">
                <button class="btn w-96 grid content-center place-items-center" :disabled="addPhysicianDisabled">
                    Add Physician
                </button>
            </div>
        </form>
    </div>  
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'AddPhysician',
  components: {},
  setup() {
    const router = useRouter()
    // TODO this should check if there's a value for subjectID i guess
    const addPhysicianDisabled = ref(false)

    // TODO v-model everything
    const firstname = ref('')
    const lastname = ref('')
    const email = ref('')
    const status = ref('')
    const timezone = ref('')

    function addNewPhysician(e: Event) {
      console.log("Add new physician");
      console.log("Details: "+firstname.value+" "+lastname.value+" "+email.value+" "+status.value+" "+timezone.value);
      e.preventDefault()
    }

    function generateProfile() {
      // TODO real variables
      // pull subjectid from valid subjid field
      router.push({ name: 'ProfileView', params: { subjectId: '81101' } })
    }

    return { addNewPhysician, generateProfile, firstname, lastname, email, status, timezone, addPhysicianDisabled }
  }
})
</script>