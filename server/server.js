const express    = require('express');
const bodyParser = require('body-parser');
const fs 		 = require('fs');
const puppeteer  = require('puppeteer');
const path       = require('path');
const extractGit = require('./extractGithub');
const extractFl  = require('./extractFl');
const extractUpwork  = require('./extractUpwork');
// login params
const LP = require('./lp');

var app  = express();

app.use(express.static(path.join(__dirname, "../client/public")));
app.use(bodyParser.json());

app.get('/api/search', function(req, res){
	var language  = req.query.language;
	var location  = req.query.location;
	var resources = JSON.parse(req.query.checkbox);
	var turn      = req.query.turn;
	console.log('request body', req.query);
	console.log('Resources -- ', resources);

	if (resources.value1==true) {
		if(turn == '1') {
			extractGit.extract(language, location, 1)
					  .then( (users) => {
						console.log('\nextract success');
						res.send({
							users: users
						}).status(200); 
					  })
					  .catch( (err) => {
						console.log('error ',err);
						res.send(err);
					  });
		}
		if(turn == '2') {
			extractGit.extract(language, location, 2)
			  .then( (users) => {
				console.log('\nextract success');
				res.send({
					users: users
				}).status(200); 
			  })
			  .catch( (err) => {
				console.log('error ',err);
				res.send(err);
			  });		
		}
	}

	if (resources.value2==true) {
	extractFl.extractFl(language, location)
			  .then( (users) => {
				console.log('\nextract success');
				res.send({
					users: users
				}).status(200); 
			  })
			  .catch( (err) => {
				console.log('error ',err);
				res.send(err);
			  });
	}

	if (resources.value3==true) {
	extractUpwork.extractUpwork(language, location)
			  .then( (users) => {
				console.log('\nextract success');
				res.send({
					users: users
				}).status(200); 
			  })
			  .catch( (err) => {
				console.log('error ',err);
				res.send(err);
			  });
	}

})

var port = 3010;
app.listen(port, function() {
	console.log('server started on post: ', + port);
})