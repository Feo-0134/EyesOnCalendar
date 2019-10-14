<template>
  <div>
      <div class = "head">
        <div class="testClass">
          <el-dropdown>
            <span>
                <el-autocomplete
                  v-model="teamName"
                  :fetch-suggestions="querySearchAsync"
                  placeholder="SEARCH POD"
                  @select="handleSelect"
                >
                </el-autocomplete>
            </span>
          </el-dropdown>
          <el-dropdown>
            <el-button type="primary" v-show="admin" @click="goPortal()">Portal</el-button>
          </el-dropdown>
        </div>
      </div>
      <div class="testClassII welcome">
        <p>Welcome, {{displayName}} {{displayTitle}}</p>
      </div>
      <h1>
        <a :href="prevMonth" class="pointer">&lt;</a>
        {{prettyDate}}
        <a :href="nextMonth" class="pointer">&gt;</a>
      </h1>
      <h2 v-if="!month">{{message}}</h2>
      <!-- <button v-if="!month" class = "button"
      :class="{buttonBackground: initUndo}" v-on:click="init">
        Init Table
      </button>
      <button v-if="!month" class = "button"
      :class="{buttonBackground: !initUndo}" v-on:click="reload">
        Reload Table
      </button> -->
      <div  v-if="month">
          <el-tabs id="rolesTabview" v-model="activeName" @tab-click="handleClick">
            <el-tab-pane class="mainPanel" label="All Members" name="first">
               <div id="tablehead" :class="{sticky: scrolled}" class="row tablehead">
               <div class="name"></div>
               <div v-for="(p,index) in month.people[0].days"
               :key="index" class="cellx">{{index+1}}</div>
               </div>
              <div id="tablehead" class="row tablehead">
                <div class="name">On Duty</div>
                <div v-for="(p,index) in month.people[0].days"
                :key="index" class="cellx">{{percentage(index)}}%</div>
              </div>
              <person  v-for="(p,index) in month.people" :key="p._id"
              :pindex="index" :person="p"  v-show="p.principle != 'TM' " :userName="displayName"
              :openflag = "openflag" @opensync = "handleOpenPanel"/>
            </el-tab-pane>
            <el-tab-pane class="mainPanel" label="FTE Members" name="second">
              <div id="tablehead" :class="{sticky: scrolled}" class="row tablehead">
                <div class="name"></div>
                <div v-for="(p,index) in month.people[0].days"
                :key="index" class="cellx">{{index+1}}</div>
              </div>
              <div id="tablehead" class="row tablehead">
                <div class="name">On Duty</div>
                <div v-for="(p,index) in month.people[0].days"
                :key="index" class="cellx">{{percentageFTE(index)}}%</div>
              </div>
              <person  v-for="(p,index) in month.people" v-show="p.role == 'FTE' && p.principle != 'TM' "
              :key="p._id" :pindex="index" :person="p" :userName="displayName"
              :openflag = "openflag" @opensync = "handleOpenPanel"/>
            </el-tab-pane>
            <el-tab-pane class="mainPanel" label="Vendor Members" name="third">
               <div id="tablehead" :class="{sticky: scrolled}" class="row tablehead">
                <div class="name"></div>
                <div v-for="(p,index) in month.people[0].days"
                :key="index" class="cellx">{{index+1}}</div>
              </div>
              <div id="tablehead" class="row tablehead">
                <div class="name">On Duty</div>
                <div v-for="(p,index) in month.people[0].days"
                :key="index" class="cellx">{{percentageVendor(index)}}%</div>
              </div>
              <person  v-for="(p,index) in month.people" v-show="p.role =='Vendor'"
              :key="p._id" :pindex="index" :person="p" :userName="displayName"
              :openflag = "openflag" @opensync = "handleOpenPanel"/>
            </el-tab-pane>
          </el-tabs>
      </div>
      <help-screen />
      <!-- <transition name="fade">
        <loading v-if="isLoading"></loading>
      </transition> -->
  </div>
</template>

<script>
import moment from 'moment';
import Person from '@/components/PersonRow';
import HelpScreen from '@/components/HelpScreen';
// import Loading from '@/components/LoadButton';
var store = require('store')
export default {
  components: { Person, HelpScreen },
  data() {
    return {
      su: false,
      alias: '',
      links: [],
      timeout:  null,
      message: 'Loading month...',
      scrolled: false,
      changed: false,
      initUndo: true,
      isLoading: false,
      activeName: 'first',
      openflag: false,
      state: null,
      teamName: this.$router.currentRoute.path.split('/')[1],
    };
  },
  asyncComputed: {
    month: {
      async get() {
        try {
          const res = await this.$http.get(`/api${this.date}`);
          this.socket = io({
            query: {
              path: this.date,
            },
          });
          this.socket.on('update', (data) => {
            if (data.randomNumber === this.$randomNumber) return;
            this.month.people[data.indexes.p].days[data.indexes.d].workDay = data.workDay;
            this.month.people[data.indexes.p].days[data.indexes.d].workType = data.workType;
          });
          res.data.people = res.data.people.sort((x, y) => x.name.localeCompare(y.name));
          return res.data;
        } catch (e) {
          console.log(e);
          this.socket = null;
          this.message = 'Month not found';
          return null;
        }
      },
      watch() {
        this.changed;
      },
    },
  },
  computed: {
    displayName() {
      return store.get('user').displayName;
    },
    displayTitle() {
      var title = store.get('user').title
      if(title === 'default') { return }
      else{ return '(' + title + ')'}
    },
    admin() {
      var path = '/'
      if(store.get('user')===undefined) {
        this.$message("Please Login.")
        this.$router.push({ path })
        setTimeout(()=>{location.reload()},2000)
      }
      this.su = store.get('user').su
      this.alias = store.get('user').alias
      return store.get('user').admin;
    },
    totalamount() {
      return (this.month.people).length;
    },
    totalamountFTE() {
      let sum = 0;
      for (const b of Object.keys(this.month.people)) {
        if ((this.month.people[b].role).match('FTE') == 'FTE') {
          sum += 1;
        }
      }
      return sum;
    },
    totalamountVendor() {
      let sum = 0;
      for (const b of Object.keys(this.month.people)) {
        if ((this.month.people[b].role).match('Vendor') == 'Vendor') {
          sum += 1;
        }
      }
      return sum;
    },
    date() {
      this.changed = !this.changed;
      return this.$router.currentRoute.path;
    },
    dateSplit() {
      return this.date.split('/');
    },
    prettyDate() {
      return moment(this.date, '/YYYY/M').format('MMMM YYYY');
    },
    nextMonth() {
      return (
        `/${this.date.split('/')[1].toString()
        }${moment(this.date, '/YYYY/M')
          .add(1, 'M')
          .format('/YYYY/M')}`);
    },
    prevMonth() {
      return (
        `/${this.date.split('/')[1].toString()
        }${moment(this.date, '/YYYY/M')
          .subtract(1, 'M')
          .format('/YYYY/M')}`);
    },
    goPortal() {
        const path = '/portal'
        this.$router.push({ path });
        // location.reload();
    },
    goReport() {
      return (`/${this.date.split('/')[1].toString()}${moment(this.date, '/YYYY/M').format('/YYYY/M')}/report`);
    },
    goAddPerson() {
      return (`/${this.date.split('/')[1].toString()}${moment(this.date, '/YYYY/M').format('/YYYY/M')}/person`);
    },
    goDeletePerson() {
      return (`/${this.date.split('/')[1].toString()}${moment(this.date, '/YYYY/M').format('/YYYY/M')}/delete`);
    },
    percentage() {
      return function (val) {
        let sum = 0;
        for (const b of Object.keys(this.month.people)) {
          if (this.month.people[b].days[val].workType === 'W'
          || this.month.people[b].days[val].workType === 'MS'
          || this.month.people[b].days[val].workType === 'NS'
          || this.month.people[b].days[val].workType === 'PO'
          || this.month.people[b].days[val].workType === 'PM') {
            sum += 1;
          }
        }
        return ((sum / this.totalamount) * 100).toFixed(0);
      };
    },
    percentageFTE() {
      return function (val) {
        let sum = 0;
        for (const b of Object.keys(this.month.people)) {
          if ((this.month.people[b].role).match('FTE') == 'FTE'
          && (this.month.people[b].days[val].workType === 'W'
          || this.month.people[b].days[val].workType === 'MS'
          || this.month.people[b].days[val].workType === 'NS'
          || this.month.people[b].days[val].workType === 'PO'
          || this.month.people[b].days[val].workType === 'PM')) {
            sum += 1;
          }
        }
        if (this.totalamountFTE == 0) return 0;
        return ((sum / this.totalamountFTE) * 100).toFixed(0);
      };
    },
    percentageVendor() {
      return function (val) {
        let sum = 0;
        for (const b of Object.keys(this.month.people)) {
          if ((this.month.people[b].role).match('Vendor') == 'Vendor'
          && (this.month.people[b].days[val].workType === 'W'
          || this.month.people[b].days[val].workType === 'MS'
          || this.month.people[b].days[val].workType === 'NS'
          || this.month.people[b].days[val].workType === 'PO'
          || this.month.people[b].days[val].workType === 'PM')) {
            sum += 1;
          }
        }
        if (this.totalamountVendor == 0) return 0;
        return ((sum / this.totalamountVendor) * 100).toFixed(0);
      };
    },
    apiPath() {
      return (
        `/api${
          this.$router.currentRoute.path
        }/init`
      );
    },
    apiPayload() {
      return {
        year: '2019',
      };
    },
    apiPath2() {
      return (
        `/api${
          this.$router.currentRoute.path
        }/reload`
      );
    },
    apiPayload2() {
      return {
        year: '2019',
      };
    },
    getTeamApiPath() {
      if(this.su === true) {return ( `/api${ this.$router.currentRoute.path}/allTeamName`);}
      else {
        return '/api'+ this.$router.currentRoute.path +'/ownTeamName/'+ this.alias;
      }
    },
  },
  created() {
    window.addEventListener('scroll', this.handleScroll);
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  mounted() {
    this.loadTeamName()
    this.state = this.$store.state
    window.addEventListener('keyup', (ev) => {
      this.callUndo(ev);
    });
  },
  methods: {
    loadTeamName () {
      new Promise((resolve, reject) => {
        this.$http.get(this.getTeamApiPath)
        .then((response)=> {
          this.links = response.data;
        })
        .catch((error) => {
            this.addFeedback('error', 'System Error. Please turn to the developer.');
            return [];
        })
      })
    },
    querySearchAsync(queryString, cb) {
      var links = this.links;
      //var results = queryString ? links.filter(this.createFilter(queryString)) : links;
      var results = links
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 500);// * Math.random()); // what is this?? check it out later
    },
    createFilter(queryString) {
      return (link) => {
        return (link.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      };
    },
    handleSelect(item) {
      const path = item.link
      this.$router.push({ path });
      location.reload();
    },
    addMonth() {
      const path = moment(this.date, '/YYYY/M')
        .add(1, 'M')
        .format('/YYYY/M');
      this.$router.push({ path });
    },
    subMonth() {
      const path = moment(this.date, '/YYYY/M')
        .subtract(1, 'M')
        .format('/YYYY/M');
      this.$router.push({ path });
    },
    init() {
      if (this.admin === false) {
        this.initDeny('noPermission', 'You have no permission to init this month.');
      }
      if (this.admin === true) {
        const that = this;
        let flag = false;
        const newMon = (new Date().getMonth() + 2) % 12 ? (new Date().getMonth() + 2) % 12 : 12;
        const thisMon = this.date.split('/');
        if (newMon == thisMon[3]) { // 弱类型相等；
          flag = true;
        } else {
          this.initDeny('forbid', 'Only the month after the current month can be initiated. The current month is ');          
        }
        if (flag) {
          this.isLoading = true;
          this.initUndo = false;
          this.$http.post(this.apiPath, this.apiPayload);
          setTimeout(() => {
            that.isLoading = false;
          }, 5000);
        }
      }
    },
    initDeny(type, msg) {
      const mon = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      if (type === 'noPermission') {
        this.$notify({
          title: 'Notification',
          message: msg,
          position: 'top-left',
          type: 'warning',
        });
      } else if (type === 'forbid') {
        this.$notify({
          title: 'Notification',
          message: msg + mon[new Date().getMonth()],
          position: 'top-left',
          type: 'warning',
        });
      }
    },
    reload() {
      if (this.initUndo === false) {
        this.$http.post(this.apiPath2, this.apiPayload2);
        setTimeout(() => {
          location.reload();
        }, 4000);
      }
    },
    handleOpenPanel(msg) {
      this.openflag = msg;
    },
    handleScroll() {
      const header = document.getElementById('tablehead');
      const sticky = header.offsetTop;
      // console.log(window.pageYOffset);
      if (window.pageYOffset <= 300) {
        this.scrolled = false;
        return;
      }
      if (window.pageYOffset >= sticky) {
        this.scrolled = true;
      } else {
        this.scrolled = false;
      }
    },
    handleClick(tab, event) {
      // console.log(tab, event);
    },
    // callUndo(ev) {
    //   if (ev.code !== "KeyZ" || ev.ctrlKey !== true) return;
    //   else if (this.$history.length == 0) return;
    //   {
    //     var x = this.$history.pop();
    //     var data = x.payload;
    //     this.month.people[data.indexes.p].days[data.indexes.d].workDay =
    //       data.workDay;
    //     this.month.people[data.indexes.p].days[data.indexes.d].workType =
    //       data.workType;
    //     this.$http.post(x.path, x.payload);
    //   }
    // },
  },
};
</script>

<style>
.tablehead {
  width: 100%;
}

.sticky {
  position: fixed;
  top: 0;
  background: rgb(37, 37, 37);
}

.sticky + .tablehead {
  padding-top: 102px;
}

.pointer {
  cursor: pointer;
  margin: 0 5px 0 5px;
  padding: 0 10px 0 10px;
  text-decoration: none;
  color: white;
}

.navigationLink {
    font-size: 15px;
    color:gray;
}

.el-button a:-webkit-any-link {
    text-decoration: none;
}

.testClass {
  margin-right: 40px;
    margin-bottom: 55px;
    text-align:right;

}
.testClassII {
    text-align: right;
}
.marginLeft {
  margin-left: 30px
}
.button {

  border: none;
  margin: 10px;
  color: rgb(255, 255, 255);
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  border-radius: 15px;

}
.buttonBackground {
  background-color: #4CAF50; /* Green */
}
.el-icon-arrow-down {
  font-size: 12px;
}
#rolesTabview .el-tabs__item{
  color:#808080;
}
#rolesTabview .el-tabs__nav-scroll {
  margin-left:50px;
}

.el-tabs__nav-wrap::after {
  visibility: hidden;
}
.moveable-line {
  visibility: hidden;
}
.mainPanel {
  min-height: 1000px;
  min-width: fit-content;
}
.el-input-group--append .el-input__inner, .el-input-group__prepend {
  background-color: #373737;
  color:#fff;
}
.el-dropdown .el-button {
  background-color: #373737;
  border-color: #808080;
  margin-left: 25px;
}
.el-autocomplete .el-input__inner {
    background-color: #262626;
    border: 1px solid #808080;
}
</style>
