<template>
  <div class="q-ma-md" style="min-width: 1000px">
    <q-form
      class="q-gutter-md q-ma-md"
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      "
    >
      <q-select
        class="full-width"
        square
        outlined
        v-model="inputValue"
        :options="getLocations"
        label="Choose location"
        @update:modelValue="updateCoordinates"
      />
      <q-input
        label="Latitude"
        class="full-width"
        v-model.number="latitudeInput"
        type="number"
        outlined
        square
        step="any"
        min="-90"
        max="90"
        style="max-width: 200px"
      />
      <q-input
        label="Longitude"
        class="full-width"
        v-model.number="longitudeInput"
        type="number"
        outlined
        square
        step="any"
        min="-180"
        max="180"
        style="max-width: 200px"
      />
      <q-btn
        label="Submit"
        type="submit"
        color="primary"
        @click="fetchWeatherData"
      />
    </q-form>
    <div class="q-ma-md">
      <q-banner inline-actions rounded class="text-white bg-primary q-mb-sm">
        <div class="row justify-between items-center">
          <div v-if="currentCoordinates" class="flex" style="gap: 10px">
            <div class="text-weight-bold">Your current location:</div>
            Latitude: {{ currentCoordinates.latitude }}, Longitude:
            {{ currentCoordinates.longitude }}
          </div>
          <div v-else>Loading coordinates...</div>

          <q-btn class="bg-green q-ml-sm" @click="acceptCurrentCoordinates"
            >Accept</q-btn
          >
        </div>
      </q-banner>
      <q-linear-progress indeterminate v-if="!currentCoordinates" />
    </div>
  </div>
  <div class="q-pa-md">
    <!-- Alternative -->
    <div
      v-if="
        (inputValue !== '' && weatherData) ||
        (latitudeInput !== null && longitudeInput !== null && weatherData)
      "
    >
      <q-card
        class="text-h4 q-pa-lg q-mb-lg bg-primary"
        style="color: #fff"
        v-if="weatherData"
      >
        {{ title }}
      </q-card>
      <q-card
        flat
        bordered
        class="bg-secondary row"
        v-for="(day, index) in formattedWeatherData"
        :key="index"
        style="
          margin-bottom: 10px;
          align-items: center;
          font-family: sans-serif;
          color: #fff;
          text-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
        "
        @click="formattedWeatherDataHourly(index)"
      >
        <q-card-section style="flex: 1">
          <q-item>
            <q-item-section>
              <q-item-label class="text-h4">{{ day.day }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-separator vertical inset color="white" size="1.5px" />

        <q-card-section style="flex: 1">
          <div class="text-h6">
            {{ day.temperature_2m_max }}°C / {{ day.temperature_2m_min }}°C
          </div>
        </q-card-section>

        <q-separator vertical inset color="white" size="1.5px" />

        <q-card-section style="flex: 1">
          <div class="text-h6">Sunrise: {{ day.sunrise }}</div>
          <div class="text-h6">Sunset: {{ day.sunset }}</div>
        </q-card-section>

        <q-separator vertical inset color="white" size="1.5px" />

        <q-card-section style="flex: 1">
          <div class="text-h6">UV Index: {{ day.uv_index_max }}</div>
        </q-card-section>

        <q-separator vertical inset color="white" size="1.5px" />

        <q-card-section style="flex: 1">
          <div class="text-h6">Rain sum: {{ day.rain_sum }} mm</div>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="show" class="column">
      <q-card class="q-pa-md full-width">
        <q-card-section class="row items-center">
          <div class="text-h6">Hourly Weather</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section
          flat
          bordered
          class="row"
          :class="
            index === currentHour && hourlyArray[currentHour].hour === 'Now'
              ? 'bg-primary'
              : 'bg-secondary'
          "
          v-for="(hour, index) in hourlyArray"
          :key="index"
          style="
            margin-bottom: 10px;
            align-items: center;
            font-family: sans-serif;
            color: #fff;
            text-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
          "
          @click="show = true"
        >
          <div style="flex: 1" class="row justify-center">
            {{ hour.hour }}
          </div>

          <div style="flex: 1" class="row justify-center">
            <div>{{ hour.temperature_2m }} °C</div>
          </div>

          <div style="flex: 1" class="row justify-center">
            <div>Rain: {{ hour.precipitation_probability }} %</div>
          </div>

          <div style="flex: 1" class="row justify-center">
            <div>Wind Speed: <br />{{ hour.wind_speed_10m }} km/h</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- <q-table
      class="q-ma-md"
      v-if="
        (inputValue !== '' && weatherData) ||
        (latitudeInput !== null && longitudeInput !== null && weatherData)
      "
      flat
      bordered
      separator="cell"
      :rows-per-page-options="[0]"
      :hide-pagination="true"
      :title="getTitle()"
      :rows="mapWeatherDataToRows(weatherData)"
      :columns="columns"
      row-key="day"
      dark
      color="amber"
    /> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      inputValue: null,
      latitudeInput: null,
      longitudeInput: null,
      currentCoordinates: null,
      hourlyArray: null,
      title: "",
    };
  },
  methods: {
    updateCoordinates() {
      if (this.inputValue === "Select a city") return;
      const location = this.$store.state.locations.find((location) => {
        return location.name === this.inputValue;
      });
      const lat = location.latitude;
      const long = location.longitude;
      this.latitudeInput = lat;
      this.longitudeInput = long;
    },
    async fetchWeatherData() {
      if (this.latitudeInput === null || this.longitudeInput === null) {
        alert("Choose a city or fill in coordinates");
      } else {
        this.setLocation();
        await this.$store.dispatch("fetchWeatherData", {
          latitude: this.latitudeInput,
          longitude: this.longitudeInput,
        });
      }
    },
    setLocation() {
      if (this.inputValue) {
        this.title = this.inputValue;
      } else {
        const latitude = this.latitudeInput >= 0 ? "n.B." : "s.B.";
        const longitude = this.longitudeInput >= 0 ? "ö.L." : "w.L.";
        this.title = `Coordinates: ${this.latitudeInput}° ${latitude}, ${this.longitudeInput}° ${longitude}`;
      }
    },
    getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.showPosition);
      } else {
        return "Geolocation is not supported by this browser.";
      }
    },
    showPosition(position) {
      this.currentCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    },
    mapWeatherDataToRows(weatherData) {
      loopLength = weatherData.daily.time.length;
      // const daysOfWeek = [
      //   "Sunday",
      //   "Monday",
      //   "Tuesday",
      //   "Wednesday",
      //   "Thursday",
      //   "Friday",
      //   "Saturday",
      // ];

      // return weatherData.daily.time.map((day, index) => {
      //   const date = new Date(day);
      //   const dayOfWeek = daysOfWeek[date.getDay()];

      //   return {
      //     day: dayOfWeek,
      //     mintemperature: weatherData.daily.temperature_2m_min[index],
      //     maxtemperature: weatherData.daily.temperature_2m_max[index],
      //     sunrise: weatherData.daily.sunrise[index].substr(11),
      //     sunset: weatherData.daily.sunset[index].substr(11),
      //     uvindex: weatherData.daily.uv_index_max[index],
      //     rainsum: weatherData.daily.rain_sum[index],
      //   };
      // });
    },
    formatDay(day) {
      const daysOfWeek = ["Su", "Mo", "Tu", "We", "Thu", "Fr", "Sa"];
      return daysOfWeek[new Date(day).getDay()];
    },
    formatHour(hour) {
      return new Date(hour).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    formatTime(isoTime) {
      return new Date(isoTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    acceptCurrentCoordinates() {
      try {
        this.latitudeInput = this.currentCoordinates.latitude;
        this.longitudeInput = this.currentCoordinates.longitude;
      } catch (error) {
        if (error) {
          this.$q.notify({
            caption: "Error",
            type: "negative",
            message: "The location hasn't loaded yet",
            position: "bottom",
            color: "red",
            actions: [
              {
                icon: "close",
                color: "white",
                round: true,
              },
            ],
            timeout: 2000,
          });
        }
      }
    },
    getTitle() {
      const latitude = this.latitudeInput > 0 ? "N" : "S";
      const longitude = this.longitudeInput > 0 ? "O" : "W";
      const title =
        this.inputValue === "Select a city" || this.inputValue === null
          ? `${this.latitudeInput}° ${latitude} ${this.longitudeInput}° ${longitude}`
          : this.inputValue;
      if (
        this.inputValue === null &&
        this.latitudeInput === null &&
        this.longitudeInput === null
      ) {
        return;
      } else {
        return title;
      }
    },
    formattedWeatherDataHourly(index) {
      this.show = true;

      const add = index * 24;

      this.hourlyArray = this.weatherData.hourly.time
        .slice(0, 24)
        .map((hour, index) => ({
          hour:
            add === 0 && index === this.currentHour
              ? "Now"
              : this.formatHour(hour) + " Uhr",
          precipitation_probability:
            this.weatherData.hourly.precipitation_probability[index + add],
          temperature_2m: this.weatherData.hourly.temperature_2m[index + add],
          wind_speed_10m: this.weatherData.hourly.wind_speed_10m[index + add],
        }));
    },
  },
  computed: {
    formattedWeatherData() {
      return this.weatherData.daily.time.slice(0, 7).map((day, index) => ({
        day: index === 0 ? "Today" : this.formatDay(day),
        temperature_2m_max: this.weatherData.daily.temperature_2m_max[index],
        temperature_2m_min: this.weatherData.daily.temperature_2m_min[index],
        sunrise: this.formatTime(this.weatherData.daily.sunrise[index]),
        sunset: this.formatTime(this.weatherData.daily.sunset[index]),
        uv_index_max: this.weatherData.daily.uv_index_max[index],
        rain_sum: this.weatherData.daily.rain_sum[index],
      }));
    },
    getLocations() {
      return this.$store.state.locations.map((location) => location.name);
    },
    weatherData() {
      return this.$store.state.weatherData;
    },
    currentHour() {
      return new Date().getHours();
    },
    // columns() {
    //   return [
    //     {
    //       name: "day",
    //       required: true,
    //       label: "Day",
    //       align: "left",
    //       field: "day",
    //       format: (val) => `${val}`,
    //     },
    //     {
    //       name: "mintemperature",
    //       align: "center",
    //       label: "Min. Temp. (°C)",
    //       field: "mintemperature",
    //       sortable: true,
    //     },
    //     {
    //       name: "maxtemperature",
    //       align: "center",
    //       label: "Max. Temp. (°C)",
    //       field: "maxtemperature",
    //       sortable: true,
    //     },
    //     {
    //       name: "sunrise",
    //       align: "center",
    //       label: "Sunrise",
    //       field: "sunrise",
    //       sortable: true,
    //     },
    //     {
    //       name: "sunset",
    //       align: "center",
    //       label: "Sunset",
    //       field: "sunset",
    //       sortable: true,
    //     },
    //     {
    //       name: "uvindex",
    //       align: "center",
    //       label: "UV Index",
    //       field: "uvindex",
    //       sortable: true,
    //     },
    //     {
    //       name: "rainsum",
    //       align: "center",
    //       label: "Rain Sum (mm)",
    //       field: "rainsum",
    //       sortable: true,
    //     },
    //   ];
    // },
  },
  mounted() {
    this.getLocation();
  },
};
</script>

<style scoped></style>
