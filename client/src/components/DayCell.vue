<template>
  <div unselectable="on" v-bind:style="{'background-color': getColor(), 'border-color': getBorderColor()}"  class="cellx workday"  v-on:click="toggle" >
    {{displayValue}}
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  props: ["day", "pindex", "dindex","testparam","testparamII"],
  data() {
    return {
      open:false, // sign to open opertation panel
    };
  },
  methods: {
    /* get color */
    getBorderColor() {
      switch (this.day.workDay) {
        case 0:
          return "#ED5565";
          break;
        case 1:
          return "#bada55";
          break;
        case 2:
          return "#9742b3";
          break;
        case 3:
          return "#5D9CEC";
          break;
        case 4:
          return "#ffcc80";
          break;
        case 5:
          return "#808F85";
          break;
      }
    },
    getColor() {
      switch (this.day.workDay) {
        case 1:
          return "#557037";
          break;
        case 0:
          return "#8c2230";
          break;
        case 2:
          return "#403259";
          break;
        case 3:
          return "#375c8c";
          break;
        case 4:
          return "#b36b00";
          break;
        case 5:
          return "#3B4D50";
          break;
        case 6:
          return "#63474D";
          break;
        case 7:
          return "#360036";
          break;
      }
    },
    /* data update */
    toggle() {
      this.open = !this.open
      // this is stupid. Plz use multi params replace later. i m so sorry about that
      this.$emit('customEvent',this.dindex + 1 + "@" + this.day.workType)
      // var undoStep = { path: this.apiPath, payload: this.apiPayload }; // UNDO STEP HERE -- TODO
      // this.$history.push(undoStep);
      this.$http.post(this.apiPath, this.apiPayload);
    },
  },
  computed: {
    /* get color */
    displayValue() {
      if(this.testparamII == this.dindex) {
        this.day.workType = this.testparam
        if (this.day.workType == "V") this.day.workDay = 0;
        if (this.day.workType == "PH") this.day.workDay = 0;
        if (this.day.workType == "W") this.day.workDay = 1;
        if (this.day.workType == "MS") this.day.workDay = 1;
        if (this.day.workType == "NS") this.day.workDay = 5;
        if (this.day.workType == "SL") this.day.workDay = 2;
        if (this.day.workType == "AL") this.day.workDay = 2;
        if (this.day.workType == "H(M)") this.day.workDay = 2;// //"HMSL","HASL","HMAL","HAAL"
        if (this.day.workType == "H(A)") this.day.workDay = 2;
        if (this.day.workType == "T") this.day.workDay = 3;
        if (this.day.workType == "PO") this.day.workDay = 4;
        if (this.day.workType == "PM") this.day.workDay = 4;
        if (this.day.workType == "HMAL") this.day.workDay = 6;
        if (this.day.workType == "HAAL") this.day.workDay = 6;
        if (this.day.workType == "HASL") this.day.workDay = 7;
        if (this.day.workType == "HMSL") this.day.workDay = 7;
        this.dbFunc()
      }
      if (this.day.workType == "W") return " "; // not display "W" in the calendar for there are TOO MANY WORKING DAYS
      if (this.day.workType == "HMSL" || this.day.workType == "HMAL") return " H(M)"; // not display "W" in the calendar for there are TOO MANY WORKING DAYS
      if (this.day.workType == "HASL" || this.day.workType == "HAAL") return " H(A)"; // not display "W" in the calendar for there are TOO MANY WORKING DAYS
      
      // if (this.day.workType == "PH") return " ";
      else return this.day.workType;
    },
    /* data update */
    dbFunc() {
      return _.debounce(()=>{this.$http.post(this.apiPath,this.apiPayload)},1080)
    },
    apiPayload() {
      return {
        workDay: this.day.workDay,
        workType: this.day.workType,
        indexes: {
          p: this.pindex,
          d: this.dindex
        },
        randomNumber: this.$randomNumber
      };
    },
    apiPath() {
      return (
        "/api" +
        this.$router.currentRoute.path +
        "/" +
        this.$parent.person._id +
        "/" +
        this.day._id
      );
    }
  }
};
</script>

<style>
.cellx {
  border-radius: 2px;
  /* text-transform: uppercase; */
  margin: 4px;
  user-select: none;
  border: 0px solid;
  font-size: 16px;
}

.workday:hover {
  font-size: 21px;
  margin: 0px;
  padding: 1px;
  border: 3px solid;
}

@media only screen and (max-width: 1600px) {
  .cellx {
    margin: 3px;
    font-size: 14px;
  }

  .workday:hover {
    font-size: 18px;
    padding: 1px;
    border: 2px solid;
  }
}
</style>