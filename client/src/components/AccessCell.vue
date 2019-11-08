<template>
    <el-container>
    <el-header class="headbar">Welcome to EyesOnCalendar</el-header>
        <h2 v-if="noInform">Sorry we can not find your information in the system. Please turn to your TM/TA for permission.</h2>       
        <el-container class="welcomPage">
            <el-autocomplete class="pickTeam InputButton1"
                v-if="podSelect"
                v-model="teamName"
                :fetch-suggestions="querySearchAsync"
                placeholder="SEARCH POD"
                @select="handleSelect"
            >
            </el-autocomplete>
            <h2 v-if="podSelect" class="pickTeam InputButton2" >OR</h2>
            <h2 v-if="podSelect" class="goto" >Go to</h2>
            <el-button v-if="podSelect" class="pickTeam InputButton3" type="primary" @click="goPortal()">Portal</el-button>
            <el-button v-if="!podSelect && manualLoginBtn" class="InputButton3" type="primary" @click="manualLogin = true">Login</el-button>
        </el-container>
        <el-dialog title="Manual Login" :visible.sync="manualLogin">
            <el-form>
                <el-form-item label="Alias" :label-width="formLabelWidth">
                    <el-input v-model="alias"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="getTeamName();manualLogin = false">Sign In</el-button>
            </div>
        </el-dialog> 
        <div class="PersonalInfo" v-loading="loading" v-if="loading"> 
            {{accessmsg}}
        </div>
    </el-container>
</template>

<script>
var store = require('store')
import moment from 'moment'
export default {
    name: 'AccessCell',
    data() {
        return {
            loading: true,         // add loading img while doing asyc func

            /* Manual Login */
            manualLoginBtn: false, // if AAD not works use manual login
            manualLogin:false,
            // alias: '',

            /* AAD API params */
            msalConfig: {
                auth: {
                    clientId: "c6c7e163-aa0b-4185-b95d-0073ee49fa22", //This is your client ID
                    authority:
                    "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47" //This is your tenant info
                },
                cache: {
                    cacheLocation: "localStorage",
                    storeAuthStateInCookie: true
                }
            },
            graphConfig: {
                graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
            },
            requestObj: {
                    scopes: ["user.read"]
            },

            /* AAD result */
            noInform: false, // if failed to get data
            accessmsg: '',   // result object 
            title: 'default',
            displayName: '',
            alias: '',
            admin: false,    // admin access
            su: false,       // super usr access (DEV GROUP 3 members)

            /* Team Selection */
            teamName: '',
            podSelect: false, // for those admin who have no team data in system
            
            /* format */
            formLabelWidth: '100px',
        }
    },
    mounted() {
        this.loginManually()
        this.acquireTokenPopupAndCallMSGraph();
    },
    computed: {
        getTeamApiPath() { 
            if(this.su === true) {
                return ('/api/default/' + new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/allTeamName')
            } // su can get all team names;
            else {
                return ('/api/default/' + new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/ownTeamName/'+ this.alias)
            } // admin can only get his/her team and TEMPLATE team;
        },
    },
    methods: {
        // if AAD have no feedback after 6s switch to manual login
        loginManually() {
          setTimeout(() => {
            this.loading = false;
            this.manualLoginBtn = true;
          }, 7000);
        },

        /* Search team name */
        loadTeamName () {
            new Promise((resolve, reject) => {
                this.$http.get(this.getTeamApiPath)
                .then((response)=> {
                this.links = response.data;
                })
                .catch((error) => {
                    console.log(error)
                    this.addFeedback('error', 'System Error. Please turn to the developer.');
                    return [];
                })
            })
        },

        querySearchAsync(queryString, cb) {
            var links = this.links;
            // var results = queryString ? links.filter(this.createFilter(queryString)) : links;
            var results = links
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                cb(results);
            }, 3000 * Math.random());
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

        /* AAD related */
        acquireTokenPopupAndCallMSGraph() {
            var that = this
            //Always start with acquireTokenSilent to obtain a token in the signed in user from cache
            var myMSALObj = new Msal.UserAgentApplication(this.msalConfig);
            // (optional when using redirect methods) register redirect call back for Success or Error
            // myMSALObj.handleRedirectCallback(this.authRedirectCallBack);
            myMSALObj.acquireTokenSilent(this.requestObj)
            .then(function (tokenResponse) {
                that.callMSGraph(that.graphConfig.graphMeEndpoint, tokenResponse.accessToken, that.graphAPICallback);
            })
            .catch(function (error) {
                console.log(error);
                //this.addFeedback('error', 'System Error. Please turn to the developer.');
                // Upon acquireTokenSilent failure (due to consent or interaction or login required ONLY)
                // Call acquireTokenPopup(popup window)
                if (that.requiresInteraction(error.errorCode)) {
                    myMSALObj.acquireTokenPopup(that.requestObj).then(function (tokenResponse) {
                        that.callMSGraph(that.graphConfig.graphMeEndpoint, tokenResponse.accessToken, that.graphAPICallback);
                    }).catch(function (error) {
                        console.log(error);
                        that.addFeedback('error', 'System Error. Please turn to the developer.');
                    });
                }
            });
        },
        
        // callback for using redirect methods
        authRedirectCallBack(error, response) {
            if (error) {
                console.log(error);
                //this.addFeedback('error', 'System Error. Please turn to the developer.');
            } else {
                if (response.tokenType === "access_token") {
                    callMSGraph(this.graphConfig.graphMeEndpoint, response.accessToken, this.graphAPICallback);
                } else {
                    console.log("token type is:" + response.tokenType);
                }
            }
        },

        // a savage for request AAD resource
        callMSGraph(theUrl, accessToken, callback) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200)
                callback(JSON.parse(this.responseText));
            };
            xmlHttp.open("GET", theUrl, true); // true for asynchronous
            xmlHttp.setRequestHeader("Authorization", "Bearer " + accessToken);
            xmlHttp.send();
        },

        // process AAD result
        graphAPICallback(data) {
            console.log("graphAPICallback");
            let result = JSON.stringify(data, null, 4);
            let jsonresult = JSON.parse(result);
            this.title = jsonresult.jobTitle
            this.displayName = jsonresult.displayName
            this.alias = '(' + (jsonresult.userPrincipalName.split('@'))[0] + ')'
            
            if(jsonresult.userPrincipalName == 'jianalu@microsoft.com' 
                || jsonresult.userPrincipalName == 't-junzhu@microsoft.com'
                || jsonresult.userPrincipalName == 'danzha@microsoft.com')
            {
                this.su = true
            } 
            console.log("jsonresult.jobTitle"+ jsonresult.jobTitle);

            if(jsonresult.jobTitle == null) {
                // console.log("null jobTitle" + jsonresult);
                jsonresult.jobTitle = 'SUPPORT ENG'
                this.getTeamName();
            } else if( jsonresult.jobTitle.includes('TECHNICAL ADVISOR')
                || jsonresult.jobTitle.includes('TECH ADVISOR')
                || jsonresult.jobTitle.includes('MGR')
                || jsonresult.jobTitle.includes('MANAGER')
                || jsonresult.userPrincipalName == 'jianalu@microsoft.com'
                || jsonresult.userPrincipalName == 't-junzhu@microsoft.com'
                || jsonresult.userPrincipalName == 'danzha@microsoft.com'
                )
            {
                this.admin = true;
                console.log('admin');
                this.getTeamName();
            }
            // this.getTeamName();
        },

        requiresInteraction(errorCode) {
            if (!errorCode || !errorCode.length) {
                return false;
            }
            return errorCode === "consent_required" ||
                errorCode === "interaction_required" ||
                errorCode === "login_required";
        },

        /* Smart Router */
        getTeamName() {
            if(this.admin) {
                this.loadTeamName() 
            }
            if(!(this.podSelect) && this.manualLoginBtn) {
                if(this.alias[0] != '(') {
                    this.alias = '('+this.alias+')'
                    if(this.alias[1] !== 'v' || this.alias[2] !== '-') {
                        this.addFeedback('notify', 'FTE please use https://eyesoncalendar.azurewebsites.net.');
                    }
                }
            }
            var that = this
            var apipath = '/api/getpod/' + new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/' + this.alias
            console.log(apipath)
            return new Promise((resolve, reject) => {
                this.$http.get(apipath)
                .then((response)=> {
                    console.log(response.data)
                    if(!(this.podSelect) && this.manualLoginBtn) {
                        this.displayName = response.data.name
                        if(response.data.principal == 'TM' || response.data.principal == 'TA') this.admin = true 
                    }
                    if(response.data.pod == "default") {                            
                        store.set('user', {displayName:this.displayName, alias: this.alias, admin: this.admin, su: this.su, title: this.title, team: 'TEMPLATE'})
                    } else {
                        store.set('user', {displayName:this.displayName, alias: this.alias, admin: this.admin, su: this.su, title: this.title, team: response.data.pod})
                    }
                    if(response.data.pod === 'default' && this.admin) {
                      this.podSelect = true
                      this.loading = false
                    } else if(response.data.pod === 'default') {
                      this.loading = false
                    //   this.manualLoginBtn = false
                      this.noInform = true
                    } else {
                      this.$router.push(response.data.pod + moment().format('/YYYY/M'))
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.addFeedback('error', 'System Error. Please turn to the developer.');
                })
            }) 
        },
        
        goPortal() {
            const path = '/portal'
            this.$router.push({ path });
        },

        /* System Feedback */
        addFeedback(type, msg) {
            const h = this.$createElement;
            if(type == 'error') {
                this.$notify.error({
                    title:'Error',
                    message: msg,
                    position:'top-left',
                    duration: 0
                });
            }
            if(type == 'notify') {
                this.$notify({
                    title:'Notification',
                    message: msg,
                    position:'top-left',
                    type:'warning',
                    duration: 6000
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
    }
}
</script>

<style>
.PersonalInfo{
    height: 500px;
    margin: auto;
    display: inline-block;
}
.el-container .el-loading-mask {
    background-color:#262626
}
.welcomPage {
    margin-top: 300px; 
    margin-left: auto;
    margin-right: auto;
}
.pickTeam {
   display: inline;
}
.headbar {
    background-color: inherit;
    font-size: 30px;
}
.navigationLink {
    font-size: 15px;
    color:gray;
}
.InputButton1 {
    width: 200px;
    margin-right: 0px;
    float: right;
}
.InputButton2 {
    width: 200px;
    padding-left: 50px;
    margin-right: 10px;
    margin-left: 10px;
    margin-top: 10px;
}
.goto {
    margin-top: 10px;
    margin-right: 10px;
}
.welcomPage .InputButton3 {
    width: 200px;
    float: left;
    height: fit-content;
    background-color: #373737;
}
.el-autocomplete .el-input__inner {
    background-color: #373737;
}
</style>