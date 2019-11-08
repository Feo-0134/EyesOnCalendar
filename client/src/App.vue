<template>
  <div id="app">
    <main>
      <router-view></router-view>
    </main>
    <footer class="footer">
      <p>Hope you enjoy using this app. For any issues, please contact eyesoncalendar2@microsoft.com</p><p> © 2019 EyesOnCalendar </p>
    </footer>
  </div>
</template>

<script>

export default {
  name: "app",
  data() {
    return {
    };
  },
  created() {
  }
};
</script>

<style>
body {
  margin: 0;
  background: rgb(37, 37, 37);
}

h1 {
  font-family: 'Roboto Condensed', sans-serif;
}

p {
  text-align: center;

}
#app {
  font-family: 'Montserrat', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: white;
}

main {
  text-align: center;
  margin-top: 40px;
}

header {
  margin: 0;
  height: 56px;
  padding: 0 16px 0 24px;
  background-color: #808080;
  color: #ffffff;
}

header span {
  display: block;
  position: relative;
  font-size: 20px;
  line-height: 1;
  letter-spacing: 0.02em;
  font-weight: 400;
  box-sizing: border-box;
  padding-top: 16px;
}
.footer {
  margin-top: 100px; 
  position: relative;
  bottom:0;
  font-size: 15px;
}
</style>
