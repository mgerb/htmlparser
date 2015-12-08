//imports
var request = require('request');
var fs = require('fs');
var cookieJar = request.jar();
var nodemailer = require('nodemailer');

//------------------------ CONFIG ----------------
var WEB_USERNAME = '';
var WEB_PASSWORD = '';

var LOGIN_URL = '';
var PARSE_URL = '';
var SEARCH_STRING = '';

var EMAIL_SENDER_EMAIL = '';
var EMAIL_SENDER_PASSWORD = '';

var EMAIL_RECIPIENT_EMAIL = '';

//how often to check in seconds
var LOOP_TIME = 60;

//------------------------------------------------

//set up mailing services ------------------------
// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: EMAIL_SENDER_EMAIL,
        pass: EMAIL_SENDER_PASSWORD
    }
});

//set up email

var mailOptions = {
	from : 'HTML Checker Script',
	to : EMAIL_RECIPIENT_EMAIL,
	subject : 'Alert',
	text : 'String found - ' + SEARCH_STRING
}
//------------------------------------------------


//set parameters for each form name
function getHtmlFile(loginPage, parsePage, callback){
	request.post({
		url: loginPage,
		jar: cookieJar,
		
		//-!!!!!!!!!!!!!set these parameters correct for the form!!!!!!!!!!!!!!!!!!!
		form: {userName:WEB_USERNAME, password:WEB_PASSWORD, Login: "Login"}
		
	}, function(error, response, body){
		//console.log(response);
	
	
		request.get({
			url: parsePage,
			jar: cookieJar,
			header: response.headers
		},function(error, response, body){
			// The full html of the authenticated page
			//console.log(body);
			
			fs.writeFile('fileToParse.html', body, function(err){
				
				console.log("html response output to file");
				
				callback();
			})
		});
	});
}

//open file and search for string
function searchForString(string){
	fs.readFile('fileToParse.html', function(err, data) {
		if (err){
			console.log("error reading file");
		}
		else {
			var searchString = data;
			
			if (searchString.indexOf(string) != -1){
				console.log("string found - sending email");
				transporter.sendMail(mailOptions, function(error, info){
					if(error){
						return console.log(error);
					}
					console.log('Message sent: ' + info.response);

				});
			}
			else {
				console.log("string not found");
			}
		}
	});
}

getHtmlFile(LOGIN_URL, PARSE_URL, function(){
		searchForString(SEARCH_STRING);
	});
	
setInterval(function(){
	getHtmlFile(LOGIN_URL, PARSE_URL, function(){
		searchForString(SEARCH_STRING);
	});
}, LOOP_TIME*1000);

