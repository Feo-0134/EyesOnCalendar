# Shift Arrangement Tool — Develop Note



Shift Arrangement Website will help to show all team members' shift data in a monthly calendar view.

Users can easily access the site to modify his/her own data: morning shift, night shift, working day, vacation(annual leave, sick leave).

For managers and TAs, they have the administrative permission to upload the draft data, view each day's on-duty percentage, export the monthly statistics . When a day is marked as 'Desired Vacation / Vacation / Training', the site will notify the user to send S+ to team.



## Features

| Feature Name                | Logic: Need + Method                                         |      |
| --------------------------- | ------------------------------------------------------------ | ---- |
| 1. Add New Status           | Need: Illustrate the Morning Shift & Night Shift status in the calendar;                                                                                                                    Method: Add two more status(dayType) to the existing option array. |      |
| 2. UX for Modify Status     | Need: Replace an existing 'click' method of switch the status (dayType);                                                                                                                      Method: Set a dialog module in the PersonRow and its Children-Component use DayCell click event as the trigger（emit & property attributes are used）. |      |
| 3. On-Duty Rate             | Need: Make it clear about when there would be a lack of engineer;                                                                                                                      Method: Calculate the number of people whose status fits working condition and divided the total amount & show the digits on top of the calendar together with the date column. |      |
| 5. Monthly Report           | Need: Summary the personal monthly attendance;                                                                                                                      Method: Get personal attendance status from API. Form a table as requests from the TAs. |      |
| 4. Easy Authentication(AAD) | Need: Fetch the User Info & Make the application a private tool;                                                                                                                      Method: Use "Promise" to get the authentication data and show the username in the application. | ∆    |
|                             |                                                              |      |



| Feature Name               | Logic: Need + Method                                         |      |
| :------------------------- | ------------------------------------------------------------ | ---- |
| 6.PermissionControl        | Need: In case mis-operation, one only have access to his or her status, while TAs & Managers have an admin access to all data;                                                                                                      Method: The permission system is build base on the Easy Authentication. The App would compare the username and the record owner. |      |
| 7. MongoDB Insert          | Need: Add newComers to the tool with a default status;                                                                                                                      Method: Get the personal info from front-end and call the Insert_Record_to_DB function: incrementMonth( ). | ∆    |
| 8. MongoDB Delete          | Need: Delete member from the tool;                                                                                                                      Method: use decrement function to remove a record from the db.document. | ∆    |
| 9. Initiate a new Calendar | Need: Generate the default calendar template automaticly(To replace the last uploading .csv file feature);                                                                                                                      Method: Get last month data as a parameter for the function join with a dictionary includes the day numbers to derivate the calendar for this month. |      |
| 10. Absence Mail Service   | Need: Hint one to mail team about his absence;                                                                                                                      Method: Add a pop dialog with the message to the status set button and use html Hypertext Reference to start local Outlook file. |      |
|                            |                                                              |      |



## Scenario & Troubleshooting

1. Q: How to deploy a web App-Service ( Vue.js + Node.js + CosmosDB(mongodb)) to Azure App Service

   A:

   ```  bash
   # go to the app PATH
   npm run build

   # Copy the resulting dist folder inside server
   # Run ```npm install``` inside the server folder
   # The mongo connection string is hardcoded inside the server.js file

   # Create an app service on Azure(http://yourSiteName.azurewebsites.net)
   # Enable App Service websockets from Azure portal

   # Navigate to kudu console (http://yourSiteName.scm.azurewebsites.net)
   # Click "Debug Console/CMD" & Go to PATH ./site/wwwroot/
   # Deploy the contents of the server folder and dist folder
   ```



2. Q: User authentication and authorization usage problems

   A:

   1. Enable built-in authentication and authorization

      :link:https://docs.microsoft.com/en-us/azure/app-service/configure-authentication-provider-aad



   2. Use Azure Active Directory as the identity provider

      ```bash
      GET https://<appname>.azurewebsites.net/.auth/me
      Content-Type: application/json

      {"id_token":"<token>","access_token":"<token>"}
      ```

      Fuzzy Matching of access_token



   3. Secure service-to-service calls with token authentication
      1. Use access tokens from server code
      2. Use access tokens from client (browser) code



3. Q: mongoDB (CosmosDB)

   1. connString

      ```javascript
      var connString = "mongodb://mayocalendarv2-dev:CiXxW30UqowaAs8CiAVyNiLgJ2UkRmpN6KXBGcJWamGmN2sNYkwcfhRhXQqGfi6jOFH6imOniww5Wn6tX2dIIA%3D%3D@mayocalendarv2-dev.documents.azure.com:10255/?ssl=true&replicaSet=globaldb"

      mongoose.connect(connString)

      const db = mongoose.connection;

      db.on('error', console.error.bind(console, 'connection error:'));
      db.once('open', function () {
          console.log("Connected to DB");
      });
      ```

   2. CURD

      ```javascript
      collection.dialog.push()
      var collectionObject = await collection.findOne()
      await collectionObject.save()
      collection.deleteOne()
      ```



4. Q: Vue.js

   1. Vue Devtools

      ```javascript
      // add this line to main.js to enable vue devtool
      Vue.config.devtools = true
      ```



5. Q:  Service Unavailable

   | StatusCode | HttpSubStatus | Time_Taken | Details                                    |
   | ---------- | ------------- | ---------- | ------------------------------------------ |
   | 503        |               | 2.90s      | It turns out to be 503 Service Unavailable |



   A: In this case the server is not responding. Wait and then refresh the page to get the web resource.

   LINK: https://www.csssupportwiki.com/index.php/curated:Azure_App_Service_-_Perf_-_Crash



3. Q: The WebApp is either slow or not responding at all. Symptoms are that the browser keeps on spinning and returns the page after a long time.

   A: Platform Issue includes:

   1. CHECK_PLATFORM_OUTAGE - Any known outage or LSI happening during the time the customer reported an issue.
   2. IS_CANARY_WORKING - Platform Availability showing a number less than 100% during the time customer reported a problem
   3. CPU_AND_MEMORY_CONSUMPTION_VERY_HIGH on the App Service Plan but customer’s worker process / web jobs / child processes started by the customer’s application are not consuming HIGH CPU or HIGH MEMORY
   4. STORAGE_FAILOVERS_OR_LATENCY - Storage blips and Storage File System Failovers causing worker process restarts
   5. INSTANCE_CHANGE_EVENTS – Most likely due to UD Walks or VM failovers



## Other Resource

1. Deployment Crash
   - 400 Bad Request

   - 404 Not Found

   - 500 Internal Server Error

   - 502 Bad Gateway

   - 503 Service Unavailable



2. Studio3T trial expired

   Run Script (studio3t.bat)

   ``` bash
   @echo off
   FOR /f "tokens=1,2,* " %%i IN ('reg query "HKEY_CURRENT_USER\Software\JavaSoft\Prefs\3t\mongochef\enterprise" ^| find /V "installation" ^| find /V "HKEY"') DO ECHO yes | reg add "HKEY_CURRENT_USER\Software\JavaSoft\Prefs\3t\mongochef\enterprise" /v %%i /t REG_SZ /d ""
   pause>nul
   exit
   ```



