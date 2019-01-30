const fs         = require('fs');
const puppeteer  = require('puppeteer');
const FL         = require('./fl');
const DICT       = require('./dict');

let extractFl = async (lan, loc) => {

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
	fs.writeFile('extract-fl.txt', 'Hello content!', function (err) {
	  if (err) throw err;
	  console.log('Content!');
	});

	const browser   = await puppeteer.launch({headless: false});
	const page 		= await browser.newPage();
	const loginUrl  = 'https://www.fl.ru/login/';

	// login begin
	//, {waitUntil: 'networkidle2'}
	await page.goto(loginUrl);
	await page.waitFor(1000);
	
	const EMAIL_SELECTOR = '#el-login';
	const PASSWORD_SELECTOR = '#el-passwd';
	const BUTTON_SELECTOR = '#el-singin';

	await page.focus(EMAIL_SELECTOR);
	await page.keyboard.type(FL.email);
	await page.waitFor(200);

	await page.focus(PASSWORD_SELECTOR);
	await page.keyboard.type(FL.password);
	await page.waitFor(200);

	await page.focus(BUTTON_SELECTOR);
	await page.click(BUTTON_SELECTOR);
	// await page.waitFor(1000);
	await page.waitForNavigation({ waitUntil: 'networkidle2' });
	await page.waitFor(1500);
	// login end

	// fill serach form
	const SKILL_SELECTOR = '#search-request';
	const LOCATION_SELECTOR = '#location';
	const ADVANCED_SELECTOR = '#search-advanced-button';
	const SEARCH_BUTTON_SELECTOR = '#main-search-form > div > table > tbody > tr > td.b-layout__td.b-layout__td_width_160.b-layout__td_valign_bot.b-layout__td_padleft_10.b-layout__td_width_full_ipad.b-layout__td_pad_null_ipad > button';

	await page.focus(SKILL_SELECTOR);
	await page.keyboard.type(lan);
	await page.waitFor(500);

	await page.focus(ADVANCED_SELECTOR);
	await page.click(ADVANCED_SELECTOR);
	await page.waitFor(500);	

	await page.focus(LOCATION_SELECTOR);
	change = async (loc) => {
		if (DICT[loc] == null) {
			return 'Казахстан: Все города';
		} else {
			return DICT[loc];
		}
	}
	let locationDict = await change(loc);
	await page.keyboard.type(locationDict);
	await page.waitFor(1000);

	await page.focus(SEARCH_BUTTON_SELECTOR);
	await page.click(SEARCH_BUTTON_SELECTOR);
	await page.waitFor(1000);

	// return true;

	// upwork serach
	// const searchUrl = 'https://www.upwork.com/o/profiles/browse/?nbs=1&q='+lan+'&location='+loc;

	// save all user here
	var usersArray = [];

	// selector to find users on page for counting
	// body > div.b-page__wrapper > div > div.b-layout.b-layout__page > div > div > div.b-freelancers-collection > div.b-layout__right.b-layout__right_relative.b-layout__left_width_72ps.b-layout__left_float_left > table > tbody > tr:nth-child(2)
	const LENGTH_SELECTOR_CLASS = 'cf-line' 

	// permament 7, to 20
	for (let h = 1; h <= 1; h++) {

		// let pageUrl = searchUrl + '&p=' + h;

		// await page.goto(pageUrl);
		// await page.waitFor(500);

		// count users on page
		let listLength = await page.evaluate((sel) => {
					return document.getElementsByClassName(sel).length;
			}, LENGTH_SELECTOR_CLASS);

		console.log('listLength ', listLength);

		let result = await page.evaluate((listLength) => {

				const LIST_USER_CLICK_SELECTOR = '#oContractorResults > div > section:nth-child(INDEX)';
				const LIST_USER_PHOTO_SELECTOR = 'body > div.b-page__wrapper > div > div.b-layout.b-layout__page > div > div > div.b-freelancers-collection > div.b-layout__right.b-layout__right_relative.b-layout__left_width_72ps.b-layout__left_float_left > table > tbody > tr:nth-child(INDEX) > td.cf-user > img';
				// href attribute
				const LIST_USER_URL_SELECTOR   = 'body > div.b-page__wrapper > div > div.b-layout.b-layout__page > div > div > div.b-freelancers-collection > div.b-layout__right.b-layout__right_relative.b-layout__left_width_72ps.b-layout__left_float_left > table > tbody > tr:nth-child(INDEX) > td.cf-user > div > a.freelancer-name.freelancer-catalog';
				// title attribute
				const LIST_USER_NAME_SELECTOR  = 'body > div.b-page__wrapper > div > div.b-layout.b-layout__page > div > div > div.b-freelancers-collection > div.b-layout__right.b-layout__right_relative.b-layout__left_width_72ps.b-layout__left_float_left > table > tbody > tr:nth-child(INDEX) > td.cf-user > div > a.freelancer-name.freelancer-catalog';
				const LIST_USER_NICKNAME_SELECTOR  = 'body > div.b-page__wrapper > div > div.b-layout.b-layout__page > div > div > div.b-freelancers-collection > div.b-layout__right.b-layout__right_relative.b-layout__left_width_72ps.b-layout__left_float_left > table > tbody > tr:nth-child(INDEX) > td.cf-user > div > a.freelancer-name.freelancer-catalog > span';
				const LIST_USER_LOCATION_SELECTOR = 'body > div.b-page__wrapper > div > div.b-layout.b-layout__page > div > div > div.b-freelancers-collection > div.b-layout__right.b-layout__right_relative.b-layout__left_width_72ps.b-layout__left_float_left > table > tbody > tr:nth-child(INDEX) > td.b-txt.b-txt_right.b-txt_fs_11.b-txt_color_59.b-txt_padright_15';

				var pageUserArr = [];

				for (let i=1; i< listLength; i++) {
					
					let photoSelector = LIST_USER_PHOTO_SELECTOR.replace('INDEX', 2*i);
					let urlSelector   = LIST_USER_URL_SELECTOR.replace('INDEX', 2*i);
					let nameSelector  = LIST_USER_NAME_SELECTOR.replace('INDEX', 2*i);
					let nickNameSelector = LIST_USER_NICKNAME_SELECTOR.replace('INDEX', 2*i);
					let locationSelector = LIST_USER_LOCATION_SELECTOR.replace('INDEX', 2*i);

					let name     = document.querySelector(nameSelector);
					let nickName = document.querySelector(nickNameSelector);
					let nickUrl  = document.querySelector(urlSelector);
					        
					// let company  = document.querySelector('#js-pjax-container > div > div.h-card.col-3.float-left.pr-3 > div.js-profile-editable-area > ul > li[itemprop="worksFor"] > span');
					let location = document.querySelector(locationSelector);
					let photo    = document.querySelector(photoSelector);
				        
					let data = {
						nickName,
					    location
					}

					// check name and location
					for(let key in data) {
					        	if(data[key] == null) {
					        		data[key] = 'not found'
					        	}
					        	else {
					        		data[key] = data[key].innerText;
					        	} 
		        	}

		        	if (name) {
						data.name = name.title;
						// console.log('nickUrl ', data.nickUrl);
					} else { 
						data.name = "not found";
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

					data.location = data.location.split('\n')[1];

					pageUserArr.push(data);
				}
				console.log('pageUserArr ', pageUserArr);
				return pageUserArr;
			}, listLength);
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

	fs.appendFile("extract-fl.txt", JSON.stringify(usersArray, null, 3), function(err) {
		if(err) {
			return console.log('fs error ',err);
		}
		console.log("The file was saved!");
	});	

	browser.close();
	return usersArray;
}

module.exports = {
	extractFl
}