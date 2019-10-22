<template>
  <div>
    <div class="overlay" v-if="open" @click="open=false">
      <div class="help-dialog">
        <h1>Contact</h1>
        <p>Please email to eyesoncalendar2@microsoft.com for any question or further support.</p>
        <a href="mailto:eyesoncalendar2@microsoft.com"><img class = "outlookLogo" src="../../static/img/outlook.png"  alt="Outlook" /></a>
      </div>
    </div>
    <button @click="open=!open" v-if="!open" class="fab">?</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      open: false
    };
  }
};
</script>

<style>
.outlookLogo {
  width: 70px;
  height: 40px;
  margin-left: 5px;
  margin-bottom: 5px;
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
.help-dialog {
  background-color: white;
  position: fixed;
  top: 15%;
  left: 50%;
  margin-left: -400px;
  width: 800px;
  padding: 30px;
  color: black;
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
</style>
