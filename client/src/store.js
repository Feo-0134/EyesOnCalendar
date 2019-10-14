/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    calendar: null,
    socket: null,
  },
  mutations: { // sync
    toggleDay(state, data) {
      // console.log("Something is wrong!")
      state.calendar.calendar[data.personkey].days[data.toggleevent.index].work = !data.toggleevent.item.work;
      state.socket.emit('updateCalendar', state.calendar);
    },
  },
  actions: { // async
    toggleWork({ commit }, data) {
      commit('toggleDay', data);
    },
  },
});

export default store;
