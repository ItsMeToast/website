const {google} = require('googleapis');
const keys =  require('./keys.json');
const fs = require('fs');
const readline = require('readline');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Calendar API.
    authorize(JSON.parse(content), createEvent);
  });

  
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }
  
  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

const client = new google.auth.JWT(
    keys.client_email, 
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);


client.authorize(function(err,tokens) {

    if (err) {
        console.log(err);
        return;
    } 
    else {
        console.log('Connected!');
        gsrun(client);
    }


});


async function gsrun(cl) {

    const gsapi =  google.sheets({version:'v4', auth: cl });
    let repeat = true;
    let row = 2;

    while(repeat) {
        let opt = {
            spreadsheetId: '1PfAmo71WQAIjCimcQpApHHghXbvdwVmpcfEcgjcsUkY',
            range: 'A' + row + ':G' + row
        }

        let data = await gsapi.spreadsheets.values.get(opt);
        let dataArray = data.data.values;

        if(dataArray == undefined) {
            repeat = false;
        }

        else {
            row++;
        }
    }

    let newDataArray = [[row-1, name, email, subject, tutor, 'whenever', otherInfo]];
    
    const updateOptions =  {

        spreadsheetId: '1PfAmo71WQAIjCimcQpApHHghXbvdwVmpcfEcgjcsUkY',
        range: 'A' + row,
        valueInputOption: 'USER_ENTERED',
        resource: {values: newDataArray}
    };

    let res = await gsapi.spreadsheets.values.update(updateOptions);
    console.log(newDataArray);
}


/**
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */// Refer to the Node.js quickstart on how to setup the environment:
      // https://developers.google.com/calendar/quickstart/node
      // Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
      // stored credentials.

function createEvent(auth) {
    const calendar = google.calendar({version: 'v3', auth});
  
  var event = {
        'summary': subject + ' Tutoring Session (Grade ' + grade + ')',
        'location': 'Colonel By Secondary School (Online Meet)',
        'description': '<b>CB Tutoring Google Meet</b> ' + '\n<b>Tutor:</b> ' + tutor + tutorID + '\nMore Info: ' + info,

        'start': {
        'dateTime': date + 'T09:00:00-07:00',
        'timeZone': 'America/Toronto',
        },
        'end': {
        'dateTime': date + 'T10:00:00-07:00',
        'timeZone': 'America/Toronto',
        },

        'attendees': [
        {'email': 'ItsMeToastyBread@gmail.com'},
        {'email': email},
        ],

        "organizer": {
          "email": 'ItsMeToastyBread@gmail.ca',
          "displayName": 'Kieron',
        },

        'reminders': {
        'useDefault': false,
        'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10},
        ],
        },
    };
      
    calendar.events.insert({
        auth: auth,
        calendarId: 'primary',
        resource: event,
    }, function(err, event) {
        if (err) {
        console.log('There was an error contacting the Calendar service: ' + err);
        return;
        }
        console.log('Event created: %s', event.htmlLink);
    });
}
