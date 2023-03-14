
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
    <div class="control-row">
      <button class="btn" @click="auth.signOut">Sign Out</button>
    </div>
  </div>
</template>
  
<script lang="ts">

import { defineComponent, ref } from 'vue'
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-vue'

export default defineComponent({
  name: 'UserSettings',
  components: {},
  setup() {
    const auth = useAuthenticator()
    // const authGroup = auth.user.signInUserSession.idToken.payload["cognito:groups"].toString()
    // console.log('setup')
    return { auth }
  }
})
</script>