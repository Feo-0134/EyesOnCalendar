<!-- /**************************************
Feature 5 Monthly report
**************************************/ -->
<template>
  <div class="row">
      <div class="cellx name">{{displayName}}</div>
      <div class = "celly ">
        {{fullDayCnt(['W','MS','NS','PO','PM']) +
         halfDayCnt(["H(A)","H(M)","HMSL","HASL","HMAL","HAAL"])}}
      </div>
      <div class = "celly ">{{fullDayCnt(['MS','PM'])}}</div>
      <div class = "celly ">{{fullDayCnt(['NS'])}}</div>
      <div class = "celly ">{{fullDayCnt(['T'])}}</div>
      <div class = "celly ">
        {{fullDayCnt(['SL','AL','V']) +
         halfDayCnt(["H(A)","H(M)","HMSL","HASL","HMAL","HAAL"])}}
      </div>
      <div class = "celly ">{{fullDayCnt(['PH'])}}</div>
      <div class = "celly ">{{fullDayCnt(['PO', 'PM'])}}</div>
  </div>
</template>

<script>
import Day from "@/components/DayCell";
export default {
  components: { Day },
  props: ["person"],
  data() {
      return {
        size: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
      } 
  },
  computed: {
    displayName() {
      var nameArray = this.person.name.split(" ");
      return nameArray[0] + " " + this.person.alias;
    },
    large() {
      if (this.size > 1600) return true;
      else return false;
    },
  },
  created() {
    window.addEventListener('resize',()=>{
        this.getWindowWidth()
    })  
  },
  methods: {
    /* count day type for report */
    fullDayCnt:function(typeArray) {
      var cnt = 0;
      for(const w of this.person.days) {
        typeArray.forEach(type => {
          if(w.workType === type) cnt += 1
        });
      }
      return cnt
    },
    halfDayCnt:function(typeArray) {
      var cnt = 0;
      for(const w of this.person.days) {
        typeArray.forEach(type => {
          if(w.workType === type) cnt += 0.5
        });
      }
      return cnt
    },
    /* window view */
    getWindowWidth() {
      this.size = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    },
  }
};
</script>


<style>
.row {
  display: inline-flex;
  height: 40px;
  justify-content: center;
}

.row:hover:not(:first-child) {
    background: #444;
}

.row:hover>.name {
    text-align: left;
    color: white !important;
    font-weight: 500;
}

.cellx {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  vertical-align: middle;
  width: 40px;
}
.name {
  text-align: left;
  width: 200px;
  font-size: 18px;
  color: #eaeaea;
  font-family: "Roboto", Corbel, Avenir, "Lucida Grande", "Lucida Sans", sans-serif;
}
.workday {
  color: white;
  cursor: pointer;
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

  .name {
    text-align: left;
    width: 100px;
    font-family: "Roboto", Corbel, Avenir, "Lucida Grande", "Lucida Sans", sans-serif;
  }
}
.colorCodes {
  text-align: left;
}
.dayTypes {
  width: 267px;
}
.separator {
  height: 20px;
  margin: 20px auto 0 auto;
  border-top: 1px gray solid;
  width: 80%;
}
.box-container {
  display: flex;
}

.box {
  margin: 5px;
  width: 40px;
  height: 40px;
  color: white;
  border-radius: 3px;
  display: flex;
  justify-content: center;
  vertical-align: middle;
  flex-direction: column;
}

.grey {
  background-color: #555555;
}
.red {
  background-color: #8c2230;
}

.green {
  background-color: #557037;
}

.blue {
  background-color: #375c8c;
}

.purple {
  background-color: #513567;
}
.purple1 {
  background-color: #360036;
}
.purple2 {
  background-color: #63474D;
}

.orange {
  background-color: #b36b00;
}
.hr {
  text-align: left;
}
.legenda-container {
  display: flex;
  justify-content: left;
}
.icon-container {
  display: flex;
  justify-content: left;
}

.iconPreview {
  width: 50px;
  height: 50px;
  background-size: cover;
  display: flex;
  justify-content: center;
  vertical-align: middle;
}
.large {
  flex-direction: column;
  width: 90px;
  font-weight: 700;
}

.overlay {
  position: fixed;
  top: 0;
  width: 100vw;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
}

.blackFont {
  color: white;
}
.fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 30px;
  border: none;
  background-color: #600;
  color: white;
  font-weight: 700;
  font-size: 30px;
  cursor: pointer;
  transition: all 0.1s ease-in-out;
}

.fab:hover {
  box-shadow: 0 6px 14px 0 #000;
  transform: scale(1.05);
}
.colorCell {
  background-color: #0A122A;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  vertical-align: middle;
  width: 40px;
  color: white;
}
.colorFont {
  color: cornflowerblue;
}
.celly {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  vertical-align: middle;
  width: 90px;
  margin: 2px;
  background-color: #373737;
  border-radius: 2px;
}

.workday:hover {
  font-size: 21px;
  margin: 0px;
  padding: 1px;
  border: 3px solid;
}
</style>