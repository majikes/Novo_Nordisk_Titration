<template>
  <div
    v-if="
      groupComputed.includes('crc') ||
      groupComputed.includes('cdt technical') ||
      groupComputed.includes('cdt overseer')
    "
    class="cgm-data-availability"
  >
    <!-- lil title / filter control -->
    <div class="control-row-header" id="header">
      <h1 class="text-2xl font-bold">CGM Data Availability</h1>
      <div class="flex">
        <!-- tz selector -->
        <div class="adduser-form-cell">
          <label for="tz-select">Timezone</label>
          <select
            :disabled="allLoading"
            v-model="selectedTimezone"
            class="form-select select-input"
            id="tz-select"
            required
          >
            <option v-for="tz in timezones" :value="tz" :key="tz">
              {{ tz }}
            </option>
          </select>
          <div class="invalid-feedback">Please select a time zone.</div>
        </div>
        <!-- sort / randomization selector container -->
        <div class="grid">
          <div class="adduser-form-cell">
            <label for="sort-select">Sort criteria</label>
            <select
              :disabled="allLoading"
              class="form-select select-input"
              name="sort"
              id="sort-select"
              v-model="sortVar"
            >
              <option
                :value="sortVar"
                v-for="sortVar in Object.keys(sortables)"
                :key="sortVar"
              >
                {{ (sortables as any)[sortVar] }}
              </option>
            </select>
          </div>
          <!-- randomization selector -->
          <!-- filterByEnrolled onlyRealParticipants controls -->
          <div class="flex content-evenly gap-2 p-2">
            <input
              class="h-5 rounded aspect-square"
              type="checkbox"
              v-model="filterByEnrolled"
            />
            Randomization only
          </div>
          <div
            class="flex content-evenly gap-2 py-2"
            v-if="debugModeStore.debugMode"
          >
            <input
              class="h-5 rounded aspect-square"
              type="checkbox"
              v-model="onlyRealParticipants"
            />
            Only real participants
          </div>
          <div
            class="flex content-evenly gap-2 py-2"
            v-if="debugModeStore.debugMode"
          >
            <input
              class="h-5 rounded aspect-square"
              type="checkbox"
              v-model="useOldValues"
            />
            Use old data
          </div>
        </div>
      </div>
    </div>
    <!-- debug info -->
    <!-- <div v-if="debugModeStore.debugMode">
      <div>cgmAvailabilityLoading: {{ cgmAvailabilityLoading }}</div>
      <div>subjectListLoading: {{ subjectListLoading }}</div>
    </div> -->
    <!-- body -->
    <div v-if="allLoading">
      <LoadingHover>
        <div class="font-semibold">Loading participant data</div>
      </LoadingHover>
    </div>
    <div
      v-for="(
        cgmValidList, index
      ) in cgmAvailabilityPercentagesSortedBySelected"
      :key="index"
      class="p-2 my-2 grid grid-cols-4 rounded-md bg-gray-200 font-mono"
    >
      <div
        class="m-1 p-1 col-span-4 grid grid-cols-4 justify-between rounded-sm"
        :class="{
          'bg-emerald-200':
            cgmValidList.percentageOfCgmAvailable >= thresholdTotal,
          'bg-red-300': cgmValidList.percentageOfCgmAvailable < thresholdTotal,
        }"
      >
        <h2 class="flex justify-between col-span-3 text-xl font-semibold p-3">
          {{ cgmValidList.username }} :
          {{ cgmValidList.percentageOfCgmAvailable }}%
        </h2>
        <div class="text-m font-semibold px-2 pt-1 w-full">
          <h2 class="flex justify-between">
            <div>first:</div>
            <div>{{ dateFormat(cgmValidList.firstTimestamp) }}</div>
          </h2>
          <h2 class="flex justify-between">
            <div>last:</div>
            <div>{{ dateFormat(cgmValidList.lastTimestamp) }}</div>
          </h2>
        </div>
      </div>
      <div class="p-1 col-span-4 flex flex-wrap w-full gap-1 justify-start">
        <div
          v-for="(cgmDay, index2) in cgmValidList.dailyPercentageOfCgmAvailable"
          :key="index2"
          :title="`Day start at ${String(
            new Date(cgmDay.dayStartTimestamp * 1000).toLocaleString('en-US')
          )}`"
          class="aspect-square w-20 force-center-content rounded-sm"
          :class="{
            'bg-emerald-200': cgmDay.percentageOfCgmAvailable >= thresholdDaily,
            'bg-red-300': cgmDay.percentageOfCgmAvailable < thresholdDaily,
          }"
        >
          {{ cgmDay.percentageOfCgmAvailable }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "@/functions/GlobalFunctions";
import { useApiURL } from "@/globalConfigPlugin";
import { type CGMDataAvailType } from "@/types/CGMDataAvailType";
import { cloneDeep, lowerCase } from "lodash";
import type { CGMDataAvailDayType } from "@/types/CGMDataAvailDayType";
import { type CGMDataFromAPIType } from "@/types/CGMDataFromAPIType";
import SubjectListItemFromAPIType from "@/types/SubjectListItemFromAPIType";
import { useAuthenticator } from "@aws-amplify/ui-vue";
import { useDebugModeStore } from "@/stores/debugModeStore";
import { useErrorStore } from "@/stores/ErrorStore";
import LoadingHover from "@/components/LoadingHover.vue";

export default defineComponent({
  name: "CGMDataAvailability",
  components: {
    LoadingHover,
  },
  props: {},
  setup() {
    const apiRootURL = useApiURL();
    const auth = useAuthenticator();
    const errors = useErrorStore();
    const route = useRoute();
    const router = useRouter();
    const componentName = "CGMDataAvailability";
    const debugModeStore = useDebugModeStore();
    // let groups = ref([] as string[])
    // if (typeof (auth.user.signInUserSession.idToken.payload["cognito:groups"]) !== 'undefined') {
    //   groups.value = auth.user.signInUserSession.idToken.payload["cognito:groups"].map(lowerCase)
    // }
    const groupComputed = computed(() => {
      let group = [] as string[];
      if (
        typeof auth.user !== "undefined" &&
        typeof auth.user.signInUserSession !== "undefined" &&
        typeof auth.user.signInUserSession.idToken.payload["cognito:groups"] !==
          "undefined"
      ) {
        group =
          auth.user.signInUserSession.idToken.payload["cognito:groups"].map(
            lowerCase
          );
      }
      console.log(`group: ${group}`);
      return group;
    });
    const tokenComputed = computed(() => {
      // 'Authorization': cognitoUser.signInUserSession.idToken.jwtToken
      let token = "";
      if (
        typeof auth.user.signInUserSession !== "undefined" &&
        typeof auth.user.signInUserSession.idToken.jwtToken !== "undefined"
      ) {
        token = auth.user.signInUserSession.idToken.jwtToken;
      }
      console.log(`token: ${token}`);
      return token;
    });
    // const debugModeStore = useDebugModeStore()
    // const auth = useAuthenticator()
    // const errors = useErrorStore()
    // const componentName = 'BasalDoseHistory'
    // const groupComputed = computed(() => {
    //   let group = [] as string[]
    //   if (typeof (auth.user) !== 'undefined' &&
    //     typeof (auth.user.signInUserSession) !== 'undefined' &&
    //     typeof (auth.user.signInUserSession.idToken.payload["cognito:groups"]) !== 'undefined') {
    //     group = auth.user.signInUserSession.idToken.payload["cognito:groups"].map(lowerCase)
    //   }
    //   console.log(`group: ${group}`)
    //   return group
    // })
    // const tokenComputed = computed(() => {
    //   // 'Authorization': cognitoUser.signInUserSession.idToken.jwtToken
    //   let token = ''
    //   if (typeof (auth.user.signInUserSession) !== 'undefined' && typeof (auth.user.signInUserSession.idToken.jwtToken) !== 'undefined') {
    //     token = auth.user.signInUserSession.idToken.jwtToken
    //   }
    //   console.log(`token: ${token}`)
    //   return token
    // })
    // const route = useRoute()
    const thresholdTotal = ref(70);
    const thresholdDaily = ref(70);

    const validIDRegex = /^102\d{3}$/;
    const onlyRealParticipants = ref(true);
    // loaded by the function way lower, used to filter out subjects that are already enrolled
    const subjectListSimple = ref([] as string[]);
    const useOldValues = ref(false);

    const cgmAvailabilityPercentages = ref([] as CGMDataAvailType[]);
    const cgmAvailabilityPercentagesValid = computed(() => {
      const retArr = [] as any[];
      const cgmAvailPcnts = cloneDeep(cgmAvailabilityPercentages.value);
      for (const subj of cgmAvailPcnts) {
        if (subj.username !== null && validIDRegex.test(subj.username)) {
          const subjCopy = {} as CGMDataAvailType;
          subjCopy.username = String(subj.username);
          // toggle total percent with old values
          const selectedPcntAvail = useOldValues.value
            ? subj.percentageOfCgmAvailableOld
            : subj.percentageOfCgmAvailable;
          subjCopy.percentageOfCgmAvailable = Number(selectedPcntAvail);
          // toggle percent per day with old values
          const dailyPcntAvail = useOldValues.value
            ? cloneDeep(subj.dailyPercentageOfCgmAvailableOld)
            : cloneDeep(subj.dailyPercentageOfCgmAvailable);
          subjCopy.dailyPercentageOfCgmAvailable = [] as CGMDataAvailDayType[];
          for (const day of dailyPcntAvail) {
            const tmpDay = {} as CGMDataAvailDayType;
            tmpDay.dayStartTimestamp = day.dayStartTimestamp;
            tmpDay.percentageOfCgmAvailable =
              Math.round(day.percentageOfCgmAvailable * 100) / 100;
            subjCopy.dailyPercentageOfCgmAvailable.push(tmpDay);
          }
          subjCopy.firstTimestamp = subj.firstTimestamp;
          subjCopy.lastTimestamp = subj.lastTimestamp;
          retArr.push(subjCopy);
        }
      }
      return retArr;
    });

    const filterByEnrolled = ref(true);

    const cgmAvailabilityPercentagesValidAndEnrolled = computed(() => {
      return [...cgmAvailabilityPercentagesValid.value].filter(
        (participant) => {
          if (filterByEnrolled.value) {
            return !subjectListSimple.value.includes(participant.username);
          } else {
            return true;
          }
        }
      );
    });

    // ACTUAL OBJECT KEY WE'RE SORTING WITH
    const sortVar = ref("firstTimestamp");
    const sortables = {
      username: "Participant ID",
      firstTimestamp: "First timestamp",
    };

    // const filterVar = ref('none')

    const cgmAvailabilityPercentagesValidByDate = computed(() => {
      return [...cgmAvailabilityPercentagesValidAndEnrolled.value].sort(
        (a, b) => {
          if (a.firstTimestamp > b.firstTimestamp) {
            return 1;
          } else {
            return -1;
          }
        }
      );
    });

    const cgmAvailabilityPercentagesSortedBySelected = computed(() => {
      return [...cgmAvailabilityPercentagesValidAndEnrolled.value].sort(
        (a, b) => {
          if (
            typeof (a as any)[sortVar.value] !== "undefined" &&
            typeof (b as any)[sortVar.value] !== "undefined"
          ) {
            if ((a as any)[sortVar.value] > (b as any)[sortVar.value]) {
              return 1;
            } else {
              return -1;
            }
          } else {
            return 1;
          }
        }
      );
    });

    const timezones = [
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Phoenix",
      "America/Los_Angeles",
      "America/Anchorage",
      "America/Adak",
      "Pacific/Honolulu",
    ];
    const selectedTimezone = ref("America/New_York");

    // const filteredBySelected = computed(() => {
    //   return [...sortedBySelected.value].filter((card) => {
    //     if (filterVar.value === 'none') { return true }
    //     else {
    //       return card.status.toLowerCase() === 'active'
    //     }
    //   })
    // })

    function dateFormat(timestamp: number) {
      const date = new Date(timestamp * 1000);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hr = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      const retStr = `${month}/${day} ${hr}:${min}`;
      return retStr;
    }

    const cgmAvailabilityLoading = ref(false);
    function getCgmAvailabilityPercentage() {
      cgmAvailabilityLoading.value = true;
      console.log("loading");
      const endpoint = "getCgmAvailabilityPercentage";
      // const req_username = auth.user.username
      const req_username = "testuser";
      console.log(`GET request to /${endpoint}`);
      const req_url = `${apiRootURL}/${endpoint}?requestor_username=${req_username}&timezone=${selectedTimezone.value}`;
      console.log(`request to ${req_url}`);
      // api.getAuth<any>(req_url, tokenComputed.value).then(
      api
        .get<CGMDataFromAPIType>(req_url)
        .then((response: CGMDataFromAPIType) => {
          console.log(`successful ${endpoint} request`);
          console.log(response);
          cgmAvailabilityPercentages.value = response.cgmPercentage;
          if (response.timezone !== selectedTimezone.value) {
            errors.errorLog(
              `${componentName}; backend returned a different timezone than expected. Requested: ${selectedTimezone.value}; Returned: ${response.timezone}. Forcibly setting dropdown to ${response.timezone}...`
            );
            selectedTimezone.value = response.timezone;
          }
        })
        .catch((err) => {
          console.log(err.message);
          errors.errorLog(
            `${componentName}; request to ${req_url}: ${err.message}`
          );
        })
        .finally(() => {
          cgmAvailabilityLoading.value = false;
          console.log("done");
        });
    }
    getCgmAvailabilityPercentage();

    // also trigger that function whenever we change selectedTimezone
    watch(
      () => selectedTimezone.value,
      (tz) => {
        console.log(
          `selected new tz ${tz}. requesting new percentages from API...`
        );
        getCgmAvailabilityPercentage();
      }
    );

    const subjectListLoading = ref(false);
    const subjListError = ref(null);
    function loadSubjectList() {
      console.log("loading new subjectlist for dropdown");
      subjectListLoading.value = true;
      let endpoint = "getparticipantidssupervisedbytheuser";
      // if (groupComputed.value.includes('admin')) {
      //   endpoint = 'getassignedusers'
      // }
      const req_url = `${apiRootURL}/${endpoint}?username=${auth.user.username}&cgmAvailReq`;
      console.log(`request to ${req_url}`);
      api
        .getAuth<SubjectListItemFromAPIType[]>(req_url, tokenComputed.value)
        .then((apiSubjectList: SubjectListItemFromAPIType[]) => {
          console.log(apiSubjectList);
          subjectListSimple.value = apiSubjectList.map((entry) => entry.id);
        })
        .catch((err) => {
          subjListError.value = err.message;
          console.log(subjListError.value);
          errors.errorLog(
            `${componentName}; request to ${req_url}: ${err.message}`
          );
        })
        .finally(() => {
          subjectListLoading.value = false;
        });
    }
    loadSubjectList();

    const allLoading = computed(() => {
      return cgmAvailabilityLoading.value || subjectListLoading.value;
    });

    return {
      cgmAvailabilityLoading,
      cgmAvailabilityPercentages,
      cgmAvailabilityPercentagesValid,
      dateFormat,
      thresholdTotal,
      thresholdDaily,
      debugModeStore,
      groupComputed,
      subjectListSimple,
      subjectListLoading,
      sortables,
      sortVar,
      filterByEnrolled,
      onlyRealParticipants,
      cgmAvailabilityPercentagesValidAndEnrolled,
      cgmAvailabilityPercentagesValidByDate,
      cgmAvailabilityPercentagesSortedBySelected,
      allLoading,
      timezones,
      selectedTimezone,
      getCgmAvailabilityPercentage,
      useOldValues,
    };
  },
});
</script>
