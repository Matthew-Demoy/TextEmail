var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var secret = './secrets/client_secret.json';
var schedule = require('node-schedule');   

var currentRecipent = 'mattdabom50@gmail.com';
var last_message_id = 'none';

// If modifying these scopes, delete your previously saved credentials
// at TOKEN_DIR/gmail-nodejs.json
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly',
   'https://www.googleapis.com/auth/gmail.send'];
 
// Change token directory to your system preference
var TOKEN_DIR = ('/Users/matt/projects/Dev/Frontend/textemail/tokens/');
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs.json';

var gmail = google.gmail('v1');
 
// Load client secrets from a local file.

var j = schedule.scheduleJob('30 * * * * *', function(fireDate){
  console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
  
  fs.readFile(secret, function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Gmail API.
    authorize(JSON.parse(content), getRecentEmail);
    return;
  });

});

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs))
 
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
 
    var OAuth2 = google.auth.OAuth2;
 
    var oauth2Client = new OAuth2(clientId, clientSecret,  redirectUrl);
 
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) {
        getNewToken(oauth2Client, callback);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        callback(oauth2Client);
      }
    });
}
 
/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({access_type: 'offline', scope: SCOPES});
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
 
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}
 
/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    fs.mkdir(TOKEN_DIR,{ recursive: true }, (err) => {
      if (err) throw err;
    });

  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
  });

  console.log('Token stored to ' + TOKEN_PATH);
}
 
/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  gmail.users.labels.list({auth: auth, userId: 'me',}, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
 
    var labels = response.data.labels;
 
    if (labels.length == 0) {
      console.log('No labels found.');
    } else {
      console.log('Labels:');
      for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        console.log('%s', label.name);
      }
    }
  });
}

/**
 * Get the recent email from your Gmail account
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getRecentEmail(auth) {
  // Only get the recent email - 'maxResults' parameter
  gmail.users.messages.list({auth: auth, userId: 'me', maxResults: 5,}, function(err, response) {
      if (err) {
          console.log('The API returned an error: ' + err);
          return;
      }

    // Get the message id which we will need to retreive tha actual message next.
    var message_id = response['data']['messages'][0]['id'];


    if(message_id !== last_message_id)
    {
      last_message_id = message_id;
        // Retreive the actual message using the message id
        gmail.users.messages.get({auth: auth, userId: 'me', 'id': message_id}, function(err, response) {
          if (err) {
              console.log('The API returned an error: ' + err);
              return;
          }
          response['data'].payload.headers.forEach(function (header, index) {
            if(header.name === "From" && header.value === "3399704796@vzwpix.com")
            {
              if(response['data'].labelIds.includes("INBOX"))
              {
                let data = response['data'].snippet
                //base64.decode(data.replace(/-/g, '+').replace(/_/g, '/'));
        
                console.log("data is " + data);
                parseEmail(auth, data);
              }
            }
          });
        
      });
    }else{
      console.log("checked for emails and found no new messages");
    }

  });

}

function parseEmail(auth, email, senderAddress){
  console.log("email is " + email)
  if(validateEmail(email))
  {
    console.log('subscribing to ' + email);
    currentRecipent = email;
    var raw = makeBody("3399704796@vtext.com", "umlproject48@gmail.com", "new email subscriber", "Now sending mail to " + email);
    gmail.users.messages.send({
        auth: auth,
        userId: 'me',
        resource: {
            raw: raw
        }
    }, function(err, response) {
        console.log(err);
        //console.log(response);
        //res.send(err || response)
    });
  }
  else
  {
    sendMessage(auth, email);
  }

}
function sendMessage(auth,message) {
  if(message.split('-').length === 2)
  {
    console.log("sending to email " + currentRecipent)
    var raw = makeBody(currentRecipent, "umlproject48@gmail.com", message.split('-')[0], message.split('-')[0]);
    gmail.users.messages.send({
        auth: auth,
        userId: 'me',
        resource: {
            raw: raw
        }
    }, function(err, response) {
        console.log(err);
        //console.log(response);
        //res.send(err || response)
    });

    var raw = makeBody("3399704796@vtext.com", "umlproject48@gmail.com", "", "Email Sent to " + email);
    gmail.users.messages.send({
        auth: auth,
        userId: 'me',
        resource: {
            raw: raw
        }
    }, function(err, response) {
        console.log(err);
        //console.log(response);
        //res.send(err || response)
    });
  }
  else
  {
    var raw = makeBody("3399704796@vtext.com", "umlproject48@gmail.com", "error with email", "Invalid syntax to send Email");
    gmail.users.messages.send({
        auth: auth,
        userId: 'me',
        resource: {
            raw: raw
        }
    }, function(err, response) {
        console.log(err);
        //console.log(response);
        //res.send(err || response)
    });
  }
  
  
}

function makeBody(to, from, subject, message) {
  var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
      "MIME-Version: 1.0\n",
      "Content-Transfer-Encoding: 7bit\n",
      "to: ", to, "\n",
      "from: ", from, "\n",
      "subject: ", subject, "\n\n",
      message
  ].join('');

  var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
      return encodedMail;
}

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}