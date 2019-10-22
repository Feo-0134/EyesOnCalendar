<template>
  <div class="container">
    <div class="column">
      <datepicker v-model="datepicked" :minimumView="'month'" :maximumView="'month'" :inline="true" />
      <div class="input-box">
        <input type="file" class="inputfile" id="file" ref="file" v-on:change="handleFileUpload()"/>
        <label for="file">{{inputLabel}}</label>
        <button class="subbut" :disabled="datepicked=='' || file==''" v-on:click="submitFile()">Submit</button>
      </div>
      <h1>
        <span v-if="status==1">Success!</span>
        <span v-if="status==2">Something went wrong. Either CSV is badly formatted or month already exists</span>
        <span v-if="status==3">Processing...</span>
      </h1>
    </div>
  </div>
</template>

<script>
import Datepicker from "vuejs-datepicker";
import moment from "moment";
export default {
  components: { Datepicker },
  /*
      Defines the data used by the component
    */
  data() {
    return {
      status: 0,
      file: "",
      datepicked: ""
    };
  },
  computed: {
    inputLabel() {
      if (this.file == "") return "Choose a file";
      else return "CSV Selected";
    },
    year() {
      return moment(this.datepicked).format("YYYY");
    },
    month() {
      return moment(this.datepicked).format("M");
    }
  },
  methods: {
    /*
        Submits the file to the server
      */
    submitFile() {
      let _this = this;
      _this.status = 3;
      let formData = new FormData();
      formData.append("recfile", this.file);
      // console.log(this.$router.app._route.fullPath)
      if((this.$router.app._route.fullPath).match("AppService")) {
        this.$http
        .post("/api/AppService/upload/" + this.year + "/" + this.month, formData, { 
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(function() {
          _this.status = 1;
        })
        .catch(function() {
          _this.status = 2;
        });
      }
      else if((this.$router.app._route.fullPath).match("DEV")) {
        this.$http
        .post("/api/DEV/upload/" + this.year + "/" + this.month, formData, { 
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(function() {
          _this.status = 1;
        })
        .catch(function() {
          _this.status = 2;
        });
      }
    },

    /*
        Handles a change on the file upload
    */
    handleFileUpload() {
      this.file = this.$refs.file.files[0];
    }
  }
};
</script>

<style>
.container {
  width: 100vw;
  height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.column {
  max-width: 605px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.cell {
  color: black;
}

.input-box {
  display: flex;
  flex-direction: row;
  margin: 10px;
  width: 100%;
  height: 50px;
}
.subbut {
  background-color: #bada55;
  border: none;
  width: 50%;
  font-size: 1.25em;
  font-weight: 700;
  font-family: "Montserrat", sans-serif;
}

.inputfile {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.inputfile + label {
  font-size: 1.25em;
  font-weight: 700;
  color: white;
  background-color: #8c2230;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50%;
}

.inputfile:focus + label,
.inputfile + label:hover {
  background-color: #e5374e;
}
</style>
