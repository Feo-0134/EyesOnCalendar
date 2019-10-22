<template>
  <div :class="{'pickRow': usrrecord,'row': true}">
        <div v-if="large" class="cellxII name">{{displayName}}</div>
        <div v-if="!large" class="cellxII name">{{shortName}}</div>
      <Moveable v-if= "open"
        @click="open=false"
        class="moveable"
        v-bind="moveable"
        @drag="handleDrag"
        @resize="handleResize"
        @scale="handleScale"
        @rotate="handleRotate"
        @warp="handleWarp">
          <div class="help-dialogII">
                <div class="dayTypes">
                    <div class="typeTitle">
                    <h5 class = "blackFont">Work Day Type</h5>
                    </div>
                    <div class="box-container">
                        <div v-on:click="cycle($event,0)" class="box0 green"></div>
                        <div v-on:click="cycle($event,8)" class="box0 green">MS</div>
                        <div v-on:click="cycle($event,9)" class="box0 green1">NS</div>
                        <!-- <h5 class = "blackFont">Work Day</h5> -->
                    </div>
                    <div class="typeTitle">
                    <h5 class = "blackFont">Leave Type (Sick Leave / Annual Leave)</h5>
                    </div>
                    <div class="box-container">
                    <el-popover
                      placement="bottom"
                      width="200"
                      trigger="click">
                      <p>Please inform the team about your absence.</p>
                      <a href="mailto:YOUR_TEAMNAME_HERE@microsoft.com"><img class = "outlookLogo" src="../../static/img/outlook.png"  alt="Outlook" /></a>
                      <div slot="reference" v-on:click="cycle($event,2)" class="box0 purple">SL</div>
                    </el-popover>
                    <el-popover
                      placement="bottom"
                      width="200"
                      trigger="click">
                      <p>Please inform the team about your absence.</p>
                      <a href="mailto:YOUR_TEAMNAME_HERE@microsoft.com"><img class = "outlookLogo" src="../../static/img/outlook.png"  alt="Outlook" /></a>
                      <div slot="reference" v-on:click="cycle($event,3)" class="box0 purple">AL</div>
                    </el-popover>
                    </div>
                    <div class="typeTitle">
                    <h5 class = "blackFont">Half-day Leave Type </h5>
                    <h5 class = "blackFont">(SL/AL + Morning / Afternoon)</h5>
                    </div>
                    <div class="box-container">
                    <el-switch v-model="alORsl" active-text="AL" inactive-text="SL"> </el-switch>
                    <el-popover
                      placement="bottom"
                      width="200"
                      trigger="click">
                      <p>Please inform the team about your absence.</p>
                      <a href="mailto:YOUR_TEAMNAME_HERE@microsoft.com"><img class = "outlookLogo" src="../../static/img/outlook.png"  alt="Outlook" /></a>
                      <div slot="reference" v-on:click="cycle($event,12)" class="box1" :class="alORsl?'purple2':'purple1'">H(M)</div>
                    </el-popover>
                    <el-popover
                      placement="bottom"
                      width="200"
                      trigger="click">
                      <p>Please inform the team about your absence.</p>
                      <a href="mailto:YOUR_TEAMNAME_HERE@microsoft.com"><img class = "outlookLogo" src="../../static/img/outlook.png"  alt="Outlook" /></a>
                      <div slot="reference" v-on:click="cycle($event,14)" class="box1" :class="alORsl?'purple2':'purple1'">H(A)</div>
                    </el-popover>
                    </div>
                    <div class="typeTitle">
                    <h5 class = "blackFont">Public Holiday On-duty type </h5>
                    <h5 class = "blackFont">(OnDuty / MorningShift)</h5>
                    </div>
                    <div class="box-container">
                        <div v-on:click="cycle($event,10)" class="box0 orange">PO</div>
                        <div v-on:click="cycle($event,11)" class="box0 orange">PM</div>
                        <!-- <h5 class = "blackFont">OnDuty / MorningShift(PH)</h5> -->
                    </div>
                    <div class="typeTitle">
                    <h5 class = "blackFont">Other Type</h5>
                    </div>
                    <div class="box-container">
                    <el-popover
                      placement="bottom"
                      width="200"
                      trigger="click">
                      <p>Please inform the team about your absence.</p>
                      <a href="mailto:YOUR_TEAMNAME_HERE@microsoft.com"><img class = "outlookLogo" src="../../static/img/outlook.png"  alt="Outlook" /></a>
                      <div slot="reference" v-on:click="cycle($event,7)" class="box2 blue">T</div>
                    </el-popover>
                    <h5 class = "blackFont">Training</h5>
                    <div v-on:click="cycle($event,1)" class="box0 red">PH</div><h5 class = "blackFont">Public Holiday</h5>
                    </div>
                    <span slot="footer" class="dialog-footer">
                        <!-- <el-button @click="handleOpen">Cancel</el-button> -->
                        <el-button class="confirmBtn" type="primary" @click="handleOpen()">Confirm</el-button>
                    </span>
                </div>
            </div> 
      </Moveable>
      <day class = "dayCell" @customEvent="handleEvent" v-for="(d,index) in person.days" :large="large" :key="d._id" :day="d" :pindex="pindex" :dindex="index" :testparam="dayType" :testparamII="date"/>
  </div>
</template>

<script>
import Day from "@/components/DayCell";
import Moveable from 'vue-moveable';
var store = require('store')
export default {
  components: { Day, Moveable },
  props: ["person", "pindex","userName","openflag"],

  data() {
      return {
        alias: '', // permission control

        workTypes: ["W", "PH", "SL", "AL", "H(M)", "H(A)", "V", "T", "MS", "NS", "PO", "PM","HMSL","HMAL","HASL","HAAL"],
        dayType: "W", // default value for data update
        date: null, // default value for data update

        /* window view params */
        usrrecord: false, // highlight the record of the current usr
        moveable: {       // operation panel
          keepRatio: true,
          draggable: true,
          resizable: false,
          scalable: false,
          rotatable: false,
          throttleDrag: 0,          
          throttleResize: 1,
          throttleScale: 0,
          throttleRotate: 0
        },
        open: false, // operation panel params
        alORsl: false, // AL or SL default false means sick leave
        size: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
      }
  },

  computed: {
    /* permission control */
    admin() {
      return store.get('user').admin
    },
    /* window views */
    displayName() {
      return (this.person.name.split(" "))[0] + ' ' + this.person.alias;
    },
    shortName() {
      return (this.person.name.split(" "))[0]
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
  mounted() {
    this.alias = store.get('user').alias
    if(this.alias === this.person.alias) {this.usrrecord = true}
  },
  methods: {
    /* moveable method */
    handleDrag({ target, left, top }) {
      // console.log('onDrag left, top', left, top);
      target.style.left = `${left}px`;
      target.style.top = `${top}px`;
    },
    handleResize({
      target, width, height, delta,
    }) {
      // console.log('onResize', width, height);
      delta[0] && (target.style.width = `${width}px`);
      delta[1] && (target.style.height = `${height}px`);
    },
    handleScale({ target, transform, scale }) {
      // console.log('onScale scale', scale);
      target.style.transform = transform;
    },
    handleRotate({ target, dist, transform }) {
      // console.log('onRotate', dist);
      target.style.transform = transform;
    },
    handleWarp({ target, transform }) {
      // console.log('onWarp', target);
      target.style.transform = transform;
    },
   
    /* data update */
    handleEvent:function(msg) {
      if( this.alias === this.person.alias || this.admin === true ) {
        if(this.openflag == false || this.open == true) {
          if(this.open === false){ this.dayType = msg.split("@")[1] }
          this.open = true
          this.$emit('opensync',true)
          this.date = msg.split("@")[0] - 1
        }
      }
    },
    handleOpen: function() {
      this.open=false;
      this.$emit('opensync',false)
      // location.reload();
    },
    cycle(e, arg) {
      // if(arg === -1) return;
      if(this.alORsl && (arg == 12 || arg == 14)) arg = arg + 1;
      this.dayType = this.workTypes[arg];      
    },

    /* Window View */
    getWindowWidth() {
        this.size = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    },
  }
};
</script>


<style>
day {
  color: black !important;
}
.row-head {
  display: flex;
  height: 40px;
  justify-content: center;
}
.row {
  display: inline-flex;
  height: 40px;
  justify-content: center;
}
.pickRow {
  border: 2px solid #409eff;
}
.row:hover:not(:first-child) {
    background: #444;
}
.row:hover>.cellxII {
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
  width: 180px;
  font-size: 18px;
  text-align: left;
  font-family: "Roboto", Corbel, Avenir, "Lucida Grande", "Lucida Sans", sans-serif;
}
.workday {
  color: #C2C4CE;
  /* cursor: pointer; */
}
.cellxII {
  color: #eaeaea;
  border-radius: 2px;
  margin: 4px;
  user-select: none;
  border: 0px solid;
  font-size: 16px;
  font-family: "Roboto", Corbel, Avenir, "Lucida Grande", "Lucida Sans", sans-serif;
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
.dayTypes {
  width: 267px;
}
.box-container {
  display: flex;
}
.box-container .el-button {
  background: inherit;
  padding: inherit;
  color:inherit;
  margin: inherit;
}
.box1 {
  border: 1px solid #404040;
  cursor: pointer;
  margin: 5px;
  width: 40px;
  height: 25px;
  color: white;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  padding-left: 3px;
  padding-top: 10px;
}
.box0 {
  border: 1px solid #404040;
  cursor: pointer;
  margin: 5px;
  width: 40px;
  height: 25px;
  color: white;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  padding-left: 3px;
  padding-top: 10px;
}
.box2 {
  border: 1px solid #404040;
  cursor: pointer;
  margin: 5px;
  width: 40px;
  height: 25px;
  color: white;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  padding-left: 1px;
  padding-top: 10px;
}
.large {
  flex-direction: column;
  width: 90px;
  font-weight: 700;
}
.help-dialogII {
  border: 5px solid #404040;
  background-color: #3D5B5E;
  position: absolute;
  border-radius: 20px;
  top: 25%;
  left: 50%;
  margin-left: -150px;
  width: 280px;
  padding: 30px;
  color: black;
  display: flex;
  justify-content: left;
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
  /* cursor: pointer; */
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

.outlookLogo {
  width: 70px;
  height: 40px;
  margin-left: 5px;
  margin-bottom: 5px;
}
.moveable {
  position: relative;
  text-align: center;
  font-size: 10px;
  margin: 0 auto;
  font-weight: 100;
  letter-spacing: 1px;
}

.el-switch {
  margin:15px;
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

.green1 {
  background-color: #3B4D50;
}

.blue {
  background-color: #375c8c;
}

.purple {
  background-color: #403259;
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
.typeTitle {
  text-align: left;
}
.confirmBtn{
  margin-top:15px;
}
</style>
