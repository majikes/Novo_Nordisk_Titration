<template>
  <div class="study-overview">
    <div class="control-row-header">
      <h1 class="text-2xl font-bold">Study Overview</h1>
    </div>
    <div
      v-if="subjectListError"
      class="text-l font-semibold grid content-center place-items-center h-48"
    >
      <h2 class="h-full">{{ subjectListError }}</h2>
    </div>
    <div v-else>
      <SubjectCardList :cards="cardList" :loading="subjectListLoading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
// import CircleDataQualityChart from '@/components/CircleDataQualityChart.vue'
import SubjectCardList from "@/components/SubjectCardList.vue";
import {
  type SubjectCardFrontendType,
  type SubjectCardFromAPIType,
  CGMDataAvail5MinDiasType,
} from "@/types/SubjectCardTypes";
import { type SubjectListItemFromAPIType } from "@/types/SubjectListItemFromAPIType";
import { type SubjectListItemType } from "@/types/SubjectListItemType";
import { api } from "@/functions/GlobalFunctions";
import { useApiURL } from "@/globalConfigPlugin";
import { useAuthenticator } from "@aws-amplify/ui-vue";
import { useErrorStore } from "@/stores/ErrorStore";

const apiRootURL = useApiURL();
const auth = useAuthenticator();
const errors = useErrorStore();
const componentName = "StudyOverview";
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

const subjectListLoading = ref(false);
const subjectList = ref([] as SubjectListItemFromAPIType[]);
const subjectListError = ref(null)

function loadSubjectList() {
  console.log("loading new subjectlist for dropdown");
  subjectListLoading.value = true;
  let endpoint = "getparticipantidssupervisedbytheuser";
  // if (groupComputed.value.includes('admin')) {
  //   endpoint = 'getassignedusers'
  // }
  const req_url = `${apiRootURL}/${endpoint}?username=${auth.user.username}`;
  console.log(`request to ${req_url}`);
  api
    .getAuth<SubjectListItemFromAPIType[]>(req_url, tokenComputed.value)
    .then((apiSubjectList: SubjectListItemFromAPIType[]) => {
      console.log(apiSubjectList);
      subjectList.value = apiSubjectList;
    })
    .catch((err) => {
      subjectListError.value = err.message
      console.log(err.message);
      errors.errorLog(
        `${componentName}; request to ${req_url}: ${err.message}`
      );
    })
    .finally(() => {
      subjectListLoading.value = false;
      populateStudyOverviewSubjectList();
    });
}
loadSubjectList()

const cardList = ref([] as SubjectCardFrontendType[]);
function populateStudyOverviewSubjectList() {
  for (const participant of subjectList.value) {
    const tmpSubjectCard = {} as SubjectCardFrontendType;
    // stuff from frontend
    tmpSubjectCard.subject_id = participant.id;
    tmpSubjectCard.interventionArm = participant.interventionArm;
    tmpSubjectCard.active = participant.active === 1;
    // extra card-specific stuff
    tmpSubjectCard.loading = false;
    tmpSubjectCard.empty = true;
    tmpSubjectCard.cgm_availability = [] as CGMDataAvail5MinDiasType[];

    cardList.value.push(tmpSubjectCard);
    loadStudyOverview(tmpSubjectCard.subject_id);
  }
}

function loadStudyOverview(
  participantOverviewCardUsername: string,
  force = false
) {
  const index = cardList.value.findIndex(
    (user) => user.subject_id === participantOverviewCardUsername
  );
  if (index !== -1) {
    const participantOverviewCard = cardList.value[index];
    if (participantOverviewCard.empty || force) {
      if (participantOverviewCard.empty) {
        console.log(
          `first load of participant ${participantOverviewCard.subject_id}`
        );
      }
      if (force) {
        console.log(
          `FORCING load of info for participant ${participantOverviewCard.subject_id}`
        );
      }

      participantOverviewCard.loading = true;
      console.log(
        `loading cgm availability for participant ${participantOverviewCard.subject_id}`
      );

      const endpoint = "getdataforstudyoverviewbysubject";
      const req_username = auth.user.username;
      // const req_username = "testuser";
      console.log(`GET request to /${endpoint}`);
      const req_url = `${apiRootURL}/${endpoint}?requestor_username=${req_username}&subject_id=${participantOverviewCard.subject_id}`;
      console.log(`request to ${req_url}`);
      // TODO RELOAD FUNCTIONALITY
      // api.getAuth<any>(req_url, tokenComputed.value).then(
      api
        .getAuth<SubjectCardFromAPIType>(req_url, tokenComputed.value)
        .then((response: SubjectCardFromAPIType) => {
          console.log(
            `successful ${endpoint} request for participant ${participantOverviewCard.subject_id}`
          );
          console.log(response);
          participantOverviewCard.cgm_availability = response.cgm_availability;
          participantOverviewCard.empty = false;
        })
        .catch((err) => {
          console.log(err.message);
          errors.errorLog(
            `${componentName}; request to ${req_url}: ${err.message}`
          );
        })
        .finally(() => {
          // console.log("done");
          participantOverviewCard.loading = false;
        });
    } else {
      console.log(
        `participant ${participantOverviewCard.subject_id} info already loaded`
      );
    }
  }
}
</script>
