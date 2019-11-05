const http = require('http');
const express = require('express');
const app = express();
const port = 4500;
const bodyParser = require('body-parser');
var request = require('request');
var logger = require('morgan');
var db = require('./db.js');


//morgan
app.use(logger('dev'));
//body-parse
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
//static file
app.use(express.static('public'));
//pug
app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");
});

app.get('/admin',(req, res)=>{
	res.render('admin',{
	});
});

app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === 'abcxyz') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});


app.post('/webhook', (req, res)=>{
	let entries = req.body.entry;
	for(let entry of entries){
		let messaging = entry.messaging;
		for(message of messaging){
			if(!db.get('Message').find({senderId: message.sender.id}).value()){
				db.get('Message').push({senderId: message.sender.id}).write();
			}
		}
	}
});

app.post('/admin/sendMessage',(req, res)=>{
	let message = req.body.message;
	let senderIds = db.get('Message').value();
	for(let senderId of senderIds){
		sendMessage(senderId.senderId, message);
	}
	res.redirect('/admin');
});

function sendMessage(senderId, message) {
  request({
    url: 'https://graph.facebook.com/me/messages',
    qs: {
      access_token: "EAARBZAzYCYgABALerDNZCN1a7eAkRuQhmSJGRrCMQX6kHxLdH9eRSe1PlHoUusQ4ZB9dCx4itDDWFvYnRvaF1y495oZAvSU1S8tNnleAfqQSL4kSGOUkEPSqyUGgm3ZCg6lUXZBCYKppfZCQY3Xur7AAVJjLISQ6ziZCvQyZBPbrZCZBU9aBwUVZAkNkVLUeZBVSrtDtPYSxTpmGzigZDZD",
    },
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      message: {
        text: message
      },
    }
  });
}

var server = http.createServer(app);
server.listen(port,'127.0.0.1',()=>{console.log(`connect to port ${port}`)})