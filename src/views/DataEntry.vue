
<template>
    <div class="data-entry">
      <div id="header">
        <h1>DataEntry</h1>
        <p>DataEntry page.</p>
      </div>

      <div id="header2">
        <h1>Current basal insulin dose: </h1> {{ "42U" }}
        <button id="">View History</button>
      </div>

      <div>
        <button>Smbg based titration rules page (ONLY CTRL GROUP)</button>
      </div>

      <div id="date-select">
        <h1>Smbg (ONLY CTRL GROUP)</h1>
        <label for="startDate">Date:</label>
        <input type="date" id="startDate">
      </div>

      <div id="date-select">
        <h1>Hypo (EVERYONE)</h1>
        <label for="startDate">Date:</label>
        <input type="date" id="startDate">
      </div>

      <div id="data-format-div">
        <h1>Confirm used basal dose (EVERYONE)</h1>
      </div>

      <!-- <select name="date-format" id="date-format-select">
          <option disabled value="" selected>Format</option>
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
      </select> -->

      <div id="download">
        <button id="download-button">Download</button>
      </div>
    </div>
  </template>
    
  <script lang="ts">
  import { defineComponent } from 'vue';
  
    export default defineComponent({
      name: 'DataEntry',
      components: {}
    })
  </script>