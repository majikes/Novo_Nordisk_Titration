
<template>
  <div class="data-download">
    <div id="header">
      <h1>DataDownload</h1>
      <p>DataDownload page.</p>
    </div>
    <SubjectDropdown />
    <div id="date-select">
      <label for="startDate">Date:</label>
      <input type="date" id="startDate">
    </div>
    <div id="data-select">
      <!-- div table with checkboxes -->
    </div>
    <div id="data-format-div">
      <select name="date-format" id="date-format-select">
        <option disabled value="" selected>Format</option>
        <option value="json">JSON</option>
        <option value="csv">CSV</option>
      </select>
    </div>
    <div id="download">
      <button id="download-button">Download</button>
    </div>
  </div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'DataDownload',
    components: {}
  })
</script>