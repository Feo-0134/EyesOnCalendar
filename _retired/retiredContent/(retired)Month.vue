<template>
  <div>
      <h2 v-if="date.year">{{date.year}}/{{date.month}}</h2>
      <div class="row">
          <div class="name"> </div>
          <div v-for="i in numberOfDays" :key="i" class="cell workday" style="color: black">{{i}}</div>
      </div>
      <calendar-row v-for="(item, index) in rows" :key="index" :caldata="item" :personkey="index">

      </calendar-row>
  </div>
</template>

<script>
import CalendarRow from "@/components/CalendarRow";
export default {
  components: { CalendarRow },
  computed: {
    date() {
      return {
        year: this.$store.state.calendar.year,
        month: this.$store.state.calendar.month
      };
    },
    numberOfDays() {
      return this.$store.state.calendar.numberOfDays;
    },
    rows() {
      return this.$store.state.calendar.calendar;
    },
    calendar() {
      return this.$store.state.calendar;
    }
  }
};
</script>

<style>
</style>
