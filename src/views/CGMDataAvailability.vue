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
    </div>
    <div class="grid grid-cols-4">
      <!-- tz selector -->
      <div class="adduser-form-cell col-start-3">
        <label for="tz-select">Timezone</label>
        <select
          disabled
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
      <div class="grid col-start-4">
        <div class="grid grid-cols-12">
          <!-- sort criteria selector -->
          <div class="adduser-form-cell col-span-10">
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
          <!-- sort order selector, desc/asc -->
          <div class="grid content-end py-3.5 col-span-2">
            <!-- https://feathericons.dev/?search=arrow-down&iconset=feather -->
            <div
              class="interactive-svg-container force-center-content w-8"
              @click="reverseSortDir"
            >
              <svg
                v-if="sortDirDesc"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                class="interactive-svg"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
              >
                <line x1="12" x2="12" y1="5" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
              <!-- https://feathericons.dev/?search=arrow-up&iconset=feather -->
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                class="interactive-svg"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
              >
                <line x1="12" x2="12" y1="19" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </div>
          </div>
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
    <CGMAvailabilityBlock
      v-for="(
        cgmValidList, index
      ) in cgmAvailabilityPercentagesSortedBySelected"
      :key="index"
      :thresholdDaily="thresholdDaily"
      :thresholdTotal="thresholdTotal"
      :time-zone="selectedTimezone"
      v-model:participantCGMAvail="
        cgmAvailabilityPercentagesSortedBySelected[index]
      "
    >
    </CGMAvailabilityBlock>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "@/functions/GlobalFunctions";
import { useApiURL } from "@/globalConfigPlugin";
import {
  type CGMDataAvailDayType,
  type CGMDataAvailTypeMinimal,
  type CGMDataAvailFrontendType,
  type CGMDataFromAPIType,
} from "@/types/CGMDataAvailTypes";
import { cloneDeep, lowerCase } from "lodash";
import SubjectFullListItemFromAPIType from "@/types/SubjectFullListFromAPIType";
import { useAuthenticator } from "@aws-amplify/ui-vue";
import { useDebugModeStore } from "@/stores/debugModeStore";
import { useErrorStore } from "@/stores/ErrorStore";
import LoadingHover from "@/components/LoadingHover.vue";
import CGMAvailabilityBlock from "@/components/CGMAvailabilityBlock.vue";

export default defineComponent({
  name: "CGMDataAvailability",
  components: {
    LoadingHover,
    CGMAvailabilityBlock,
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
    const enrolledListSimple = ref([] as string[]);
    const randomizationListSimple = ref([] as string[]);
    const useOldValues = ref(false);

    // const cgmAvailabilityPercentages = ref([] as CGMDataAvailTypeMinimal[]);
    // const cgmAvailabilityPercentagesValid = computed(() => {
    //   const retArr = [] as any[];
    //   const cgmAvailPcnts = cloneDeep(cgmAvailabilityPercentages.value);
    //   for (const subj of cgmAvailPcnts) {
    //     if (subj.username !== null && validIDRegex.test(subj.username)) {
    //       const subjCopy = {} as CGMDataAvailFrontendType;
    //       subjCopy.username = String(subj.username);
    //       subjCopy.
    //       // toggle total percent with old values

    //       // toggle percent per day with old values
    //       const dailyPcntAvail = useOldValues.value
    //         ? cloneDeep(subj.dailyPercentageOfCgmAvailableOld)
    //         : cloneDeep(subj.dailyPercentageOfCgmAvailable);
    //       subjCopy.dailyPercentageOfCgmAvailable = [] as CGMDataAvailDayType[];
    //       for (const day of dailyPcntAvail) {
    //         const tmpDay = {} as CGMDataAvailDayType;
    //         tmpDay.dayStartTimestamp = day.dayStartTimestamp;
    //         tmpDay.percentageOfCgmAvailable =
    //           Math.round(day.percentageOfCgmAvailable * 100) / 100;
    //         subjCopy.dailyPercentageOfCgmAvailable.push(tmpDay);
    //       }
    //       subjCopy.firstTimestamp = subj.firstTimestamp;
    //       subjCopy.lastTimestamp = subj.lastTimestamp;
    //       retArr.push(subjCopy);
    //     }
    //   }
    //   return retArr;
    // });
    const cgmAvailabilityPercentagesValid = ref(
      [] as CGMDataAvailFrontendType[]
    );

    const filterByEnrolled = ref(true);

    const cgmAvailabilityPercentagesValidAndEnrolled = computed(() => {
      return [...cgmAvailabilityPercentagesValid.value].filter(
        (participant) => {
          if (filterByEnrolled.value) {
            return !enrolledListSimple.value.includes(participant.username);
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
      firstTimestamp: "Oldest timestamp",
      lastTimestamp: "Newest timestamp",
    };
    const sortDirDesc = ref(true);
    function reverseSortDir() {
      sortDirDesc.value = !sortDirDesc.value;
    }

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
            const directionality = sortDirDesc.value ? -1 : 1;
            if ((a as any)[sortVar.value] > (b as any)[sortVar.value]) {
              return 1 * directionality;
            } else {
              return -1 * directionality;
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
    // TODO DETECT TZ
    const selectedTimezone = ref("America/New_York");
    selectedTimezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone

    // const filteredBySelected = computed(() => {
    //   return [...sortedBySelected.value].filter((card) => {
    //     if (filterVar.value === 'none') { return true }
    //     else {
    //       return card.status.toLowerCase() === 'active'
    //     }
    //   })
    // })

    // also trigger that function whenever we change selectedTimezone
    watch(
      () => selectedTimezone.value,
      (tz) => {
        console.log(
          `selected new tz ${tz}. requesting new percentages from API...`
        );
        // TODO UPDATE (refresh all???)
        // getCgmAvailabilityPercentage();
      }
    );

    const subjectListLoading = ref(false);
    const subjListError = ref(null);
    function loadSubjectList() {
      console.log("loading new subjectlist for dropdown");
      subjectListLoading.value = true;
      const endpoint = "getallruninparticipants";
      // if (groupComputed.value.includes('admin')) {
      //   endpoint = 'getassignedusers'
      // }
      const req_url = `${apiRootURL}/${endpoint}?username=${auth.user.username}&cgmAvailReq`;
      console.log(`request to ${req_url}`);
      api
        .getAuth<SubjectFullListItemFromAPIType>(req_url, tokenComputed.value)
        .then((apiSubjectList: SubjectFullListItemFromAPIType) => {
          console.log(apiSubjectList);
          enrolledListSimple.value = apiSubjectList.enrolledSubjects;
          randomizationListSimple.value = apiSubjectList.randomizationSubjects;
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
          populateSubjectListAvail();
        });
    }
    loadSubjectList();

    function populateSubjectListAvail() {
      for (const participant of randomizationListSimple.value) {
        const tmpCGMAvailBlockInfo = {} as CGMDataAvailFrontendType;
        tmpCGMAvailBlockInfo.username = participant;
        tmpCGMAvailBlockInfo.dailyPercentageOfCgmAvailable =
          [] as CGMDataAvailDayType[];
        tmpCGMAvailBlockInfo.firstTimestamp = 0;
        tmpCGMAvailBlockInfo.lastTimestamp = 0;
        tmpCGMAvailBlockInfo.loading = false;
        tmpCGMAvailBlockInfo.empty = true;
        tmpCGMAvailBlockInfo.randomization = false;
        if (!enrolledListSimple.value.includes(participant)) {
          tmpCGMAvailBlockInfo.randomization = true;
        }
        cgmAvailabilityPercentagesValid.value.push(tmpCGMAvailBlockInfo);
        loadSubjectCGMAvail(tmpCGMAvailBlockInfo.username);
      }
    }

    function loadSubjectCGMAvail(
      participantCGMAvailUsername: string,
      force = false,
      timezone?: string
    ) {
      const index = cgmAvailabilityPercentagesValid.value.findIndex(
        (user) => user.username === participantCGMAvailUsername
      );
      if (index !== -1) {
        const participantCGMAvail = cgmAvailabilityPercentagesValid.value[index]
        if (participantCGMAvail.empty || force) {
          if (participantCGMAvail.empty) {
            console.log(
              `first load of participant ${participantCGMAvail.username}`
            );
          }
          if (force) {
            console.log(
              `FORCING load of info for participant ${participantCGMAvail.username}`
            );
          }
          // set selected timezone properly
          let requestTimezone = "America/New_York";
          if (typeof selectedTimezone.value !== "undefined" && selectedTimezone.value !== "undefined") {
            requestTimezone = selectedTimezone.value;
          }
          if (typeof timezone !== "undefined" && timezone !== "undefined") {
            requestTimezone = timezone;
          }

          participantCGMAvail.loading = true;
          console.log(
            `loading cgm availability for participant ${participantCGMAvail.username}`
          );
          // push new fake obj onto list with username and loading = true
          // const tmpParticipant = {} as CGMDataAvailFrontendType;
          // tmpParticipant.username = participant
          // tmpParticipant.dailyPercentageOfCgmAvailable = [] as CGMDataAvailDayType[]
          // tmpParticipant.firstTimestamp = 0
          // tmpParticipant.lastTimestamp = 0
          // tmpParticipant.loading = true
          // cgmAvailabilityPercentagesValid.value.push(tmpParticipant)

          const endpoint = "getCgmAvailabilityPercentageBySubjectv2";
          const req_username = auth.user.username;
          // const req_username = "testuser";
          console.log(`GET request to /${endpoint}`);
          const req_url = `${apiRootURL}/${endpoint}?requestor_username=${req_username}&timezone=${requestTimezone}&subject_id=${participantCGMAvail.username}`;
          console.log(`request to ${req_url}`);
          // TODO RELOAD FUNCTIONALITY
          // api.getAuth<any>(req_url, tokenComputed.value).then(
          api
            .getAuth<CGMDataFromAPIType>(req_url, tokenComputed.value)
            .then((response: CGMDataFromAPIType) => {
              console.log(`successful ${endpoint} request for participant ${participantCGMAvail.username}`);
              // console.log(response);
              const tmpCGMDataAvailMinimal = response.cgmPercentage;
              participantCGMAvail.dailyPercentageOfCgmAvailable =
                tmpCGMDataAvailMinimal.dailyPercentageOfCgmAvailable;
              participantCGMAvail.firstTimestamp =
                tmpCGMDataAvailMinimal.firstTimestamp;
              participantCGMAvail.lastTimestamp =
                tmpCGMDataAvailMinimal.lastTimestamp;
              if (response.timezone !== requestTimezone) {
                errors.errorLog(
                  `${componentName}; backend returned a different timezone for participant ${participantCGMAvail.username} than expected. Requested: ${participantCGMAvail.timezone}; Returned: ${response.timezone}. Forcibly setting dropdown to ${response.timezone}...`
                );
                participantCGMAvail.timezone = response.timezone;
              }
              participantCGMAvail.empty = false;
            })
            .catch((err) => {
              console.log(err.message);
              errors.errorLog(
                `${componentName}; request to ${req_url}: ${err.message}`
              );
            })
            .finally(() => {
              // console.log("done");
              participantCGMAvail.loading = false;
            });
        } else {
          console.log(
            `participant ${participantCGMAvail.username} info already loaded`
          );
        }
      }
    }

    const allLoading = computed(() => {
      return subjectListLoading.value;
    });

    return {
      // cgmAvailabilityLoading,
      cgmAvailabilityPercentagesValid,
      thresholdTotal,
      thresholdDaily,
      debugModeStore,
      groupComputed,
      enrolledListSimple,
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
      // getCgmAvailabilityPercentage,
      useOldValues,
      sortDirDesc,
      reverseSortDir,
    };
  },
});
</script>
