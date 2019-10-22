<!-- /**************************************
Feature 7 Add a new member to the calendar
**************************************/ -->
<template>
  <el-container>
  <el-header>Adding Member</el-header>
  <p>Welcome, {{displayName}}</p>
    <el-main class="newPer">
      <img src="../../static/img/joinus.png" alt="joinPic" />
      <div class="inputBox">
       Alias:
      <el-input v-model="person.alias" placeholder="eg. danzha"></el-input>
       Name:
      <el-input v-model="person.name" placeholder="eg. Danielle Zhao"></el-input>
      </div>
      <div class="inputBox">
       Role:
      <el-input v-model="person.role" placeholder="eg. FTE / Vendor"></el-input>
       Principle:
      <el-input v-model="person.principle" placeholder="eg. TM / TA / None"></el-input>
      </div>
      <el-button type="primary" v-on:click="upload">Confirm</el-button>
      <el-button type="primary" v-on:click="linkToCalendar">Back to Calendar</el-button>
    </el-main>
  </el-container>
</template>

<script>
var store = require('store')
export default {
    data() {
      return {
        person: {
          alias:"",
          name:"",
          role:"",
          principle:""
        },
        state: null,
      }
    },
    methods:{
      //only TA and Manager have access to add a person
      upload() {
        if(this.person.name == "" || this.person.role == "" || this.person.alias == ""|| this.person.principle == "") {
          this.addFeedback('notify', 'Please fill the blanks.')
          // console.log('err0')
          return;
        }
        // name
        var nameStr
        if(this.person.name.toString() === ' ') {
          // console.log('err1')
          this.addFeedback('notify', 'Name invalid. eg. Danielle Zhao')
          return;
        }
        var nameArr = this.person.name.toString().toLowerCase().split(" ");
        if(nameArr.length > 1) {
          nameArr[0] = (nameArr[0].toString())[0].toUpperCase() + (nameArr[0].toString()).substr(1);
          nameArr[nameArr.length - 1] = nameArr[nameArr.length - 1][0].toUpperCase() + nameArr[nameArr.length - 1].substr(1);
          nameStr = nameArr[0] + " " + nameArr[nameArr.length - 1];
        }else {
          // console.log('err1')
          this.addFeedback('notify', 'Name invalid. eg. Danielle Zhao')
          return;
        }
        // role
        var roleStr
        if(this.person.role == "FTE" || this.person.role == "fte") {
          roleStr = "FTE";
        }else if(this.person.role == "Vendor" || this.person.role == "vendor" || this.person.role == "v") {
          roleStr = ""
        }else {
          // console.log('err2')
          this.addFeedback('notify', 'Role invalid. eg. FTE or Vendor')
          return;
        }
        // alias
        var aliasStr
        if(this.person.alias.toString() === ' ') {
          // console.log('err5')
          this.addFeedback('notify', 'alias invalid. eg. danzha')
          return;
        }
        if(this.person.role == "Vendor" || this.person.role == "vendor" || this.person.role == "v") {
          if(this.person.alias.toString().match('v-') != 'v-') {
            // console.log('err5')
            this.addFeedback('notify', 'vendor alias with no \'v-\' is invalid.')
            return;
          }
        }
        if(this.person.alias[0] == "(" && this.person.alias[(this.person.alias).length-1] == ")") {
          aliasStr = this.person.alias
        }else {
          aliasStr = "(" + this.person.alias + ")";
        }
        if(this.admin) {
          new Promise((resolve, reject) => {
            this.$http.post(this.apiPath, this.apiPayload)
            .then((response)=> {
              if(response.data == "success") {
                this. addFeedback('success', 'Person Added to Team')}
              else{
                this.addFeedback('notify', 'This employee is already in the system.');}
            })
            .catch((error) => {
                this.addFeedback('error', 'System Error. Please turn to the developer.');
            })
          }) 
        }
      },
      addFeedback(type, msg) {
        const h = this.$createElement;
        if(type == 'error') {
          this.$notify.error({
            title:'Request Denied',
            message: msg,
            position:'top-left',
            
          });
        }
        if(type == 'notify') {
          this.$notify({
            title:'Notification',
            message: msg,
            position:'top-left',
            type:'warning'
          });
        }
        if(type == 'success') {
          this.$notify({
            title: 'Success',
            message: h('i', { style: 'color: teal'}, msg),
            position:'top-left',
            type: 'success',
            
          });
        }
      },
      linkToCalendar() {
          this.$router.push((this.$router.currentRoute.path).replace('/person',''));
      },
    },
    mounted() {
        this.state = this.$store.state
    },
    computed:{
        admin() {
        var path = '/'
          if(store.get('user')===undefined) {
            this.$message("Please Login.")
            this.$router.push({ path })
            setTimeout(()=>{location.reload()},2000)
          }
          return store.get('user').admin;
        },
        displayName() {
          return store.get('user').displayName;
        },
        apiPath() {
            return (
                "/api/" +
                this.$router.currentRoute.path
            );
        },
        apiPayload() {
            return {
                name: this.person.name,
                role:this.person.role,
                principle:this.person.principle,
                alias:this.person.alias,
                randomNumber: this.$randomNumber
            };
        },
        
    }
}
</script>

<style>
 .el-header {
    background: rgb(37, 37, 37);
    color: #fff;
    text-align: center;
    line-height: 60px;
    font-family: Roboto Condensed,sans-serif;
    font-size: 40px;
  }
  
  .newPer {
    background: rgb(37, 37, 37);
    color: #fff;
    text-align: center;
    line-height: 150px;
  }
  
  body > .el-container {
    margin-bottom: 40px;
  }

  .inputBox .el-input {
    width: 20%;
    margin: 5px;
  }
  
  .inputBox {
    width:100%;
    position:relative;
  }

  .toolCase {
    margin:10px;
    height: 50px;
  }

</style>
