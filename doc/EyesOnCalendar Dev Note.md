# EyesOnCalendar Dev Note



## EyesOnCalenar related resource

### Packaging: 

Webpack

[REF]: https://tomotoes.com/blog/webpack-flight-manual/



### Framework & Components: 

#### Vue

​	vue-upload

​	vue-async-computed

​	vue-moveable

​	vue-router

​	vuejs-datepicker

​	vuex

 

#### ElementUI

​	layout

​	container

​	button

​	notification

​	autoCompleteInput

 

### Other Dependencies: 

​	msal ( AAD ) 

[REF]: https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-overview

​	store

[REF]: https://github.com/marcuswestin/store.js/

​	moment ( formatting dates )

​	lodash ( debounce )

​	axios ( Promise & httpRequest )

 

## EyesOnCalenar ADT 

### Day

props:  year, month, pod, person ( alias )

Attributes: date, workType

Methods:

```javascript
/* updateWorkType ( year, month, pod, alias, date, workType ) */
'POST' + '/:pod/:year/:month/:person/:day'



/* getWorkType ( year, month, pod, alias, date ) */ 
'GET' + '/:pod/:year/:month'

/* getContentColor ( workType ) */
getColor() // in DayCell.vue

/* getBorderColor ( workType ) */
getBorderColor() // in DayCell.vue
```



### Person

Props:  year, month, pod

Attributes:  alias(UID), name, role, principle

subADT:  day => days[ ]

Methods:

```javascript
/* addPerson ( year, month, pod, people ) */
/* + upgradePrinciple ( year, month, pod, people, principle ) */
'POST' + '/:pod/:year/:month/person'

/* delPerson ( year, month, pod, people ) */
/* + downgradePrinciple ( year, month, pod, people ) */
'POST' + '/:pod/:year/:month/delete'

/* getPrinciple ( year, month, pod, person ) 
 * // principle LVL： su > admin > none 
 */
findPrinciple() // in server.js for upgradge & downgrade

```

   

### Team

Props: year, month,

Attributes: pod

subADT: person => people[ ]

Methods:

``` javascript

/* initTeam ( year, month, pod, people ) */
// pseudocode
if ( NEWTEAM ) {
    getTeamName();
    getTeamMember(); // get team member from input
    initTemplate();
    fillTemplateWithRealData();
    addTeam2DB();
} else if (EXISTTEAM) {
    getTeamName();
    rendorTeamMember(); // get team member from db
    initTemplate();
    fillTemplateWithRealData();
    addTeam2DB();
}

/* delTeam ( year, month, pod ) 
 * empty methods 
 */

/* getTeam ( year, month, pod ) 
 * can’t update team name (attributes: pod) yet 
 */
'GET' + '/:pod/:year/:month'

/* switchTeam ( year, month, pod ) */
handleSelect() // in MainPage.vue & in PortalPage.vue

/* batchUpdateMonthlyShiftType ( year, month, pod, people, shiftType ) */
'POST' + '/:pod/:year/:month/batch/:person/:workType'

/* certainTypeCount ( year, month, pod, workType ) */
fullDayCnt()
halfdayCnt()

/* certainRoleCount ( year, month, pod, role ) */
totalamount() // serial
```



​	    

### Calendar

Props:

Attributes: year, month

subADT: team => teams[ ]

Methods:

```javascript
/* switchMonth ( year, month ) */
nextMonth() // in MainPage.vue
prevMonth()

/* sysFeedback ( type, content ) */
addFeedback() // in front-end

/* sysRouter ( url ) */
goto() // serial

/* formVisibility ( itself, condition ) */
formView() // serial in PortalPage.vue

/* templateClearer ( template, defaultValue ) */
formClearer() // serial in PoralPage.vue

/* syntaxCheck ( inputStr, regex ) */
formatCheck() // serial in PortalPage.vue

/* formulate_API_Body ( self, regex ) */
payLoad() // serial in PortalPage.vue

/* sysReturn404 (  ) */
// NotFoundPage.vue

/* sysLoading (  ) */
// v-loading

/* sysHelp (  ) */
// HelpScreen.vue

/* sysSyncLock (  ) */
// prop + $emit; vuex; 
```

 

​    

### ClientUsr

Props:

Attributes: displayName, alias(UID), admin, su, title, team,  syncLock, year, month

Methods:

```javascript
/* loginManually ( alias ) */
loginManually() // in AccessCell.vue

/* request4AAD */

/* autoLoader4TeamList ( year, month, alias ) // alias shows permission ranking */
	'GET' + '/:pod/:year/:month/ownTeamName/:alias'

/* autoRouter2TeamCalendar ( year, month, alias )  
 * And get principle at the same time.
 */
	'GET' + '/getpod/:year/:month/:alias'

/* openOperationPanel (  ) // entry for updating one’s workType */

/* moveOperationPanel (  )*/
```

