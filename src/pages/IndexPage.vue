<template>
  <q-page>
    <weather-table />
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import WeatherTable from "../components/WeatherTable.vue";

export default defineComponent({
  name: "IndexPage",
  components: {
    "weather-table": WeatherTable,
  },
});
</script>
