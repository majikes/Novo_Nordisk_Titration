
<template>
  <div class="user-settings">
    <div class="flex justify-start my-3">
      <h1 class="text-2xl font-bold">User Settings</h1>
    </div>
    <div class="flex justify-start my-3">
      <div class="w-24 font-semibold">User: </div>
      {{ auth.user?.username }}
    </div>
    <div class="flex justify-start my-3">
      <div class="w-24 font-semibold">Email: </div>
      {{ auth.user?.attributes.email }}
    </div>
    <div class="flex justify-start my-3">
      <div class="w-24 font-semibold">Group: </div>
      {{ authGroupState.authGroup }}
    </div>
    <div class="control-row">
      <button class="btn" @click="auth.signOut">Sign Out</button>
    </div>
  </div>
</template>
  
<script lang="ts">

import { onMounted, defineComponent, ref, reactive } from 'vue'
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-vue'
import { Auth } from 'aws-amplify'

export default defineComponent({
  name: 'UserSettings',
  components: {},
  setup() {
    const auth = useAuthenticator()

    const authGroupState = reactive({ authGroup: ''})
    onMounted(
      async()=>{
      const user =  await Auth.currentAuthenticatedUser();
      authGroupState.authGroup = user.signInUserSession.accessToken.payload["cognito:groups"].toString();
      console.log("Current authenticated user: "+authGroupState.authGroup);
    })

    return { auth, authGroupState}
  }
})
</script>