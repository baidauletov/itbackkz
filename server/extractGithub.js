const fs 		 = require('fs');
const puppeteer  = require('puppeteer');
const LP = require('./lp');

	const extract = async (lan, loc, turn) => {

	console.log('language ', lan);
	if (loc == undefined) {
		var loc = "Almaty";
	}
	if (lan == undefined) {
		var lan = "Ruby";
	}
	console.log('language ', lan);
	fs.writeFile('extract-git.txt', 'Hello content!', function (err) {
	  if (err) throw err;
	  console.log('Content!');
	});

	const browser   = await puppeteer.launch({headless: false});
	const page 		= await browser.newPage();
	const loginUrl  = 'https://github.com/login'
	var   response  = [];

	// await page.setRequestInterception(true);
 //  	page.on('request', request => {
 //    	if (request.resourceType() === 'script')
 //      		request.abort();
 //    	else
 //      		request.continue();
 //  	});

	await page.goto(loginUrl, {waitUntil: 'networkidle0'});
	// await page.waitFor(1000);

	// login begin
	const USERNAME_SELECTOR = '#login_field';
	const PASSWORD_SELECTOR = '#password';
	const BUTTON_SELECTOR   = '#login > form > div.auth-form-body.mt-3 > input.btn.btn-primary.btn-block';
	await page.focus(USERNAME_SELECTOR);
	await page.keyboard.type(LP.username);

	await page.focus(PASSWORD_SELECTOR);
	await page.keyboard.type(LP.password);

	await page.focus(BUTTON_SELECTOR);
	await page.click(BUTTON_SELECTOR);
	await page.waitFor(1000);
	// login end

	var arrLinks = [];
	const searchUrl = 'https://github.com/search?utf8=%E2%9C%93&q=location%3A%22'+loc+'%22+language%3A'+lan+'&type=Users';
	// github serach
	await page.goto(searchUrl);
	var numPages = await getNumPages(page);
	console.log('Numpages: ', numPages);
	const LENGTH_SELECTOR_CLASS = 'user-list-item';
	
	if (turn == '1') {

	// await page.waitFor(1000);
	// github search end

	// const LIST_USER_URL = 'https://github.com/search?utf8=%E2%9C%93&q=location%3A%22Almaty%22+language%3AJavaScript&type=Users'
	// const LIST_USER_URL = 'https://github.com/search?utf8=%E2%9C%93&q=location%3A%22'+loc+'%22+language%3A'+lan+'&type=Users';	

	// find all users on page 

		let pageUrl = searchUrl + '&p=' + 1;
    
		await page.goto(pageUrl);
		await page.waitFor(500);

		let listLength = await page.evaluate((sel) => {
					return document.getElementsByClassName(sel).length;
			}, LENGTH_SELECTOR_CLASS);

		// let pageArr = await page.evaluate((list, list2) => {
		// 	let arr = [];
		// 	for (let i = 1; i <= list; i++) {
		// 		let userClickSelector = list2.replace('INDEX', i);
		// 		let name  = 'https://github.com' + document.querySelector(userClickSelector).getAttribute("href");
		// 		arr.push(name);
		// 	}
		// 	return arr;
		// }, listLength, LIST_USER_CLICK_SELECTOR);

		let result = await page.evaluate((listLength) => {

				const LIST_USER_CLICK_SELECTOR = '#oContractorResults > div > section:nth-child(INDEX)';
				const LIST_USER_PHOTO_SELECTOR = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.d-flex.flex-auto > a > img';
				const LIST_USER_URL_SELECTOR   = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.d-flex.flex-auto > div > a';
				const LIST_USER_NAME_SELECTOR  = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.d-flex.flex-auto > div > div';
				const LIST_USER_LOCATION_SELECTOR = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.d-flex.flex-auto > div > ul > li:nth-child(1)';

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
					        		data[key] = data[key].innerText;
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

		// console.log('arr ',pageArr);
			
		arrLinks = arrLinks.concat(result);

		console.log('arrLinks ', arrLinks);

    }

	//  find pages number
	async function getNumPages(page) {
	  const NUM_USER_SELECTOR = '#js-pjax-container > div > div.col-12.col-md-9.float-left.px-2.pt-3.pt-md-0.codesearch-results > div > div.d-flex.flex-column.flex-md-row.flex-justify-between.border-bottom.pb-3.position-relative > h3';

	  let inner = await page.evaluate((sel) => {
	    		let html = document.querySelector(sel).innerHTML;
	    
	    		// format is: "69,803 users"
	    		return html.replace(',', '').replace('users', '').trim();
	  }, NUM_USER_SELECTOR);

	  let numUsers = parseInt(inner);

	  console.log('numUsers: ', numUsers);

	  // GitHub shows 10 resuls per page
	  let numPages = Math.ceil(numUsers / 10);
	  return numPages;
	}

	// const LIST_USER_CLICK_SELECTOR = '#user_search_results > div.user-list > div:nth-child(1) > div.d-flex.flex-auto > div > a'
	const LIST_USER_CLICK_SELECTOR = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.d-flex.flex-auto > div > a';

	if (turn == '2') {
		for (let h = 2; h <= numPages; h++) {

			let pageUrl = searchUrl + '&p=' + h;

			await page.goto(pageUrl);
			await page.waitFor(500);

			let listLength = await page.evaluate((sel) => {
						return document.getElementsByClassName(sel).length;
				}, LENGTH_SELECTOR_CLASS);

			let result = await page.evaluate((listLength) => {

					const LIST_USER_CLICK_SELECTOR = '#oContractorResults > div > section:nth-child(INDEX)';
					const LIST_USER_PHOTO_SELECTOR = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.d-flex.flex-auto > a > img';
					const LIST_USER_URL_SELECTOR   = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.d-flex.flex-auto > div > a';
					const LIST_USER_NAME_SELECTOR  = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.d-flex.flex-auto > div > div';
					const LIST_USER_LOCATION_SELECTOR = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.d-flex.flex-auto > div > ul > li:nth-child(1)';

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
						        		data[key] = data[key].innerText;
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

			// console.log('arr ',pageArr);
				
			arrLinks = arrLinks.concat(result);

			console.log('arrLinks ', arrLinks);
		}
	}
	// for (let i = 0; i < arrLinks.length; i++) {
	// 	await page.goto(arrLinks[i]);
	// 		const result = await page.evaluate(() => {
	// 				        let name     = document.querySelector('#js-pjax-container > div > div.h-card.col-3.float-left.pr-3 > div.vcard-names-container.py-3.js-sticky.js-user-profile-sticky-fields > h1 > span.p-name.vcard-fullname.d-block.overflow-hidden');
	// 				        let nickName = document.querySelector('#js-pjax-container > div > div.h-card.col-3.float-left.pr-3 > div.vcard-names-container.py-3.js-sticky.js-user-profile-sticky-fields > h1 > span.p-nickname.vcard-username.d-block');
	// 				        let nickUrl  = document.querySelector('#js-pjax-container > div > div.h-card.col-3.float-left.pr-3 > div.vcard-names-container.py-3.js-sticky.js-user-profile-sticky-fields > h1 > span.p-nickname.vcard-username.d-block');
					        
	// 				        let company  = document.querySelector('#js-pjax-container > div > div.h-card.col-3.float-left.pr-3 > div.js-profile-editable-area > ul > li[itemprop="worksFor"] > span');
	// 				        let location = document.querySelector('#js-pjax-container > div > div.h-card.col-3.float-left.pr-3 > div.js-profile-editable-area > ul > li[itemprop="homeLocation"] > span');
	// 				        let photo    = document.querySelector('#js-pjax-container > div > div.h-card.col-3.float-left.pr-3 > a > img');
				        
	// 				        let data = {
	// 				        	name,
	// 				        	nickName,
	// 				        	nickUrl,
	// 				            company,
	// 				            location
	// 				        }

	// 				        for(let key in data) {
	// 				        	if(data[key] == null) {
	// 				        		data[key] = 'not found'
	// 				        	}
	// 				        	else {
	// 				        		data[key] = data[key].innerText;
	// 				        	} 
	// 				        }

	// 				        data.nickUrl  = "https://github.com/" + data.nickUrl;
					        
	// 				        if(photo == null) {
	// 				        		data.photo = 'not found'
	// 				        	}
	// 				        	else {
	// 				        		data.photo = photo.src;
	// 				        	}
					        

	// 				      	console.log('location: ', location);
	// 				        return data
	// 				    });

	// 			fs.appendFile("extract-test.txt", JSON.stringify(result, null, 3), function(err) {
	// 			    if(err) {
	// 			        return console.log(err);
	// 			    }

	// 		    	console.log("The file was saved!");
	// 			});

	// 			response.push(result);
	// }

	fs.appendFile("extract-git.txt", JSON.stringify(arrLinks, null, 3), function(err) {
		if(err) {
			return console.log(err);
		}
		console.log("The file was saved!");
	});

	browser.close();
	return arrLinks;
};

module.exports = {
	extract
}