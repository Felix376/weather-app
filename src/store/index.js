import { store } from "quasar/wrappers";
import { createStore } from "vuex";
import axios from "axios";

// import example from './module-example'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store(function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      // example
    },
    state: {
      locations: [
        {
          name: "Select a city",
          value: null,
        },
        {
          name: "Hamburg",
          latitude: 53.5,
          longitude: 9.9,
        },
        {
          name: "Paris",
          latitude: 48.8,
          longitude: 2.3,
        },
        {
          name: "London",
          latitude: 51.5,
          longitude: -0.1,
        },
        {
          name: "Tokio",
          latitude: 35.6,
          longitude: 139.6,
        },
        {
          name: "New York",
          latitude: 40.7,
          longitude: -74,
        },
      ],
      weatherData: null,
    },
    mutations: {
      setWeatherData(state, data) {
        state.weatherData = data;
      },
    },
    actions: {
      async fetchWeatherData({ commit }, { latitude, longitude }) {
        try {
          const response = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,rain_sum`
          );
          console.log(response.data);
          commit("setWeatherData", response.data);
        } catch (error) {
          console.log(error);
        }
      },
    },
    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING,
  });

  return Store;
});
