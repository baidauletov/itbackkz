const fs         = require('fs');
const puppeteer  = require('puppeteer');
const UL         = require('./ul');

let extractUpwork = async (lan, loc) => {

	console.log('language ', lan);
	if (loc == undefined) {
		var loc = "Almaty";
	}
	else {
		var loc = loc;
	}
	if (lan == undefined) {
		var lan = "Ruby";
	}
	else {
		var lan = lan;
	}
	console.log('language ', lan);

	// reserve txt for data
	fs.writeFile('extractUpwork-test.txt', 'Hello content!', function (err) {
	  if (err) throw err;
	  console.log('Content!');
	});

	const browser   = await puppeteer.launch({headless: false});
	const page 		= await browser.newPage();
	await page.setViewport({width: 1000, height: 500});
	const loginUrl  = 'https://www.upwork.com/ab/account-security/login';

	// login begin
	// await page.goto(loginUrl, {waitUntil: 'networkidle0'});
	// await page.waitFor(1000);

	// const EMAIL_SELECTOR = '#login_username';
	// const EMAIL_SELECTOR_BUTTON = '#main-auth-card > form > div.ng-animate-disabled.p-xs-top.auth-growable-flex > div > div > button';
	// const PASSWORD_SELECTOR = '#login_password';
	// const PASSWORD_SELECTOR_BUTTON = '#main-auth-card > form > div.text-center.ng-animate-disabled.flex-1.auth-growable-flex > div > div > button'	
	// await page.focus(EMAIL_SELECTOR);
	// await page.keyboard.type(UL.email);
	// await page.waitFor(1000);
	
	// await page.focus(EMAIL_SELECTOR_BUTTON);
	// await page.click(EMAIL_SELECTOR_BUTTON);
	// await page.waitFor(1000);

	// await page.focus(PASSWORD_SELECTOR);
	// await page.keyboard.type(UL.password);
	// await page.waitFor(1000);

	// await page.focus(PASSWORD_SELECTOR_BUTTON);
	// await page.click(PASSWORD_SELECTOR_BUTTON);
	// await page.waitFor(1000);
	// login end

	// upwork serach
	//https://www.upwork.com/o/profiles/browse/?q=javascript&location=almaty
	const searchUrl = 'https://www.upwork.com/o/profiles/browse/?q='+lan+'&location='+loc;

	// save all user here
	var usersArray = [];

	// selector to find users on page for counting
	const LENGTH_SELECTOR_CLASS = 'air-card-hover_tile' 

	// permament 7, to 20
	for (let h = 1; h <= 2; h++) {

		let pageUrl = searchUrl + '&p=' + h;

		await page.goto(pageUrl, {waitUntil: 'networkidle0'});
		await page.waitFor(500);

		// count users on page
		let listLength = await page.evaluate((sel) => {
					return document.getElementsByClassName(sel).length;
			}, LENGTH_SELECTOR_CLASS);

		console.log('listLength ', listLength);

		let result = await page.evaluate((listLength) => {

				const LIST_USER_CLICK_SELECTOR = '#oContractorResults > div > section:nth-child(INDEX)';
				const LIST_USER_PHOTO_SELECTOR = '#oContractorResults > div > section:nth-child(INDEX) > div > article > div.col-xs-12.col-md-10.m-0-bottom > div > div.col-xs-2.col-sm-1.col-lg-2 > div > div > div > a > img';
				const LIST_USER_URL_SELECTOR   = '#oContractorResults > div > section:nth-child(INDEX) > div > article > div.col-xs-12.col-md-10.m-0-bottom > div > div.col-xs-10.col-sm-11.col-lg-10.p-md-left-sm-md.p-md-left-xs-sm.p-md-left-lg > div.m-0-top-bottom.ellipsis > div > a';
				const LIST_USER_NAME_SELECTOR  = '#oContractorResults > div > section:nth-child(INDEX) > div > article > div.col-xs-12.col-md-10.m-0-bottom > div > div.col-xs-10.col-sm-11.col-lg-10.p-md-left-sm-md.p-md-left-xs-sm.p-md-left-lg > div.m-0-top-bottom.ellipsis > div > a';
				const LIST_USER_LOCATION_SELECTOR = '#oContractorResults > div > section:nth-child(INDEX) > div > article > div.col-xs-12.col-md-10.m-0-bottom > div > div.col-xs-12.col-md-offset-1.col-md-11.col-lg-offset-2.col-lg-10.m-sm-bottom.p-md-left-sm-md.p-md-left-lg.p-xlg-top-agg-lg.p-lg-top-agg-sm-lg > div:nth-child(1) > div:nth-child(4) > div > div > strong.d-none.d-md-inline-block';

				var pageUserArr = [];

				for (let i=1; i< listLength; i++) {
					
					let photoSelector = LIST_USER_PHOTO_SELECTOR.replace('INDEX', i);
					let urlSelector   = LIST_USER_URL_SELECTOR.replace('INDEX', i);
					let nameSelector  = LIST_USER_NAME_SELECTOR.replace('INDEX', i);
					let locationSelector = LIST_USER_LOCATION_SELECTOR.replace('INDEX', i);

					let name     = document.querySelector(nameSelector);
					let nickName = document.querySelector(nameSelector);
					let nickUrl  = document.querySelector(urlSelector);
					        
					// let company  = document.querySelector('#js-pjax-container > div > div.h-card.col-3.float-left.pr-3 > div.js-profile-editable-area > ul > li[itemprop="worksFor"] > span');
					let location = document.querySelector(locationSelector);
					let photo    = document.querySelector(photoSelector);
				        
					let data = {
						name,
					    location
					}

					// check name and location
					for(let key in data) {
					        	if(data[key] == null) {
					        		data[key] = 'not found'
					        	}
					        	else {
					        		data[key] = data[key].innerText.trim();
					        	} 
		        	}

		        	// check url
		        	if (nickUrl) {
							data.nickUrl = nickUrl.href;
							console.log('nickUrl ', data.nickUrl);
					} else { 
							data.nickUrl = "not found";
					}
					
					// check photo
					if(photo == null) {
					        		data.photo = 'not found'
					}
					else {
					        		data.photo = photo.src;
					}	        

					pageUserArr.push(data);
				}
				console.log('pageUserArr ', pageUserArr);
				return pageUserArr;
			}, listLength);

		await page.waitFor(500);
		// let pageArr = await page.evaluate((list, list2) => {
		// 	let arr = [];
		// 	for (let i = 1; i <= list; i++) {
		// 		let userClickSelector = list2.replace('INDEX', i);
		// 		let name  = 'https://github.com' + document.querySelector(userClickSelector).getAttribute("href");
		// 		arr.push(name);
		// 	}
		// 	return arr;
		// }, listLength, LIST_USER_CLICK_SELECTOR);

		console.log('pageResult ',result);
			
		usersArray = usersArray.concat(result);

		console.log('usersArray ', usersArray);

		// if (listLength==0) break;
	}

	fs.appendFile("extractUpwork-test.txt", JSON.stringify(usersArray, null, 3), function(err) {
		if(err) {
			return console.log('fs error ',err);
		}
		console.log("The file was saved!");
	});	

	browser.close();
	return usersArray;
}

module.exports = {
	extractUpwork
}