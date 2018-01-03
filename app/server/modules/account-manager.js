
var crypto 		= require('crypto');
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');
var Promise = require("bluebird");
var request = require('request');

var tokenValues = {
	stageOne : 1.5,
	stageTwo : 2.5,
	stageThree : 4
}

var RefSysTimer = 60; // minutes

/*
	ESTABLISH DATABASE CONNECTION
*/

var dbName = process.env.DB_NAME || 'SIPCOIN';
var dbHost = process.env.DB_HOST || 'localhost'
var dbPort = process.env.DB_PORT || 27017;

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
db.open(function(e, d){
	if (e) {
		console.log(e);
	} else {
		if (process.env.NODE_ENV == 'live') {
			db.authenticate(process.env.DB_USER, process.env.DB_PASS, function(e, res) {
				if (e) {
					console.log('mongo :: error: not authenticated', e);
				}
				else {
					console.log('mongo :: authenticated and connected to database :: "'+dbName+'"');
				}
			});
		}	else{
			console.log('mongo :: connected to database :: "'+dbName+'"');
			exports.insertSIPStageDocument();

			setInterval(()=>{
				exports.updateSIPStageDocument()
			},3000)

			// setInterval(()=>{
			// 	console.log("Referral System Update Executed")
			// 	RefSysUpdate();
			// },1000* 60 * RefSysTimer)
		}
	}
});

var accounts = db.collection('accounts');
var transactions = db.collection('transactions');
var referrals = db.collection('referrals');
var sipStage = db.collection('SIPStage');
var Res = db.collection('RES');


// function to return the child node of the parent referral node
var getChildren = function(referral)
{
	return new Promise(function(resolve,reject){
		referrals.find({parentReferralCode:referral},{_id:0,selfReferralCode:1,parentReferralCode:1,sponsorReferralCode:1,link:1,username:1}).toArray(function(e,res){
			resolve(res);
		})
	})
}

exports.formTreeData = function(referral, callback)
{
	var finalData = [];

	var getEverything = function(referral)
	{
		getChildren(referral).then((resArray)=>{
			if(resArray.length == 2)
			{
				if(resArray[0].link == "left")
				{
					finalData.push({
						key : resArray[0].selfReferralCode,
						parent : resArray[0].parentReferralCode,
						name : resArray[0].username
					})
					finalData.push({
						key : resArray[1].selfReferralCode,
						parent : resArray[1].parentReferralCode,
						name : resArray[1].username
					})

				}
				else {
					finalData.push({
						key : resArray[1].selfReferralCode,
						parent : resArray[1].parentReferralCode,
						name : resArray[1].username
					})
					finalData.push({
						key : resArray[0].selfReferralCode,
						parent : resArray[0].parentReferralCode,
						name : resArray[0].username
					})
				}
				return resArray;
			}
			else if(resArray.length == 1)
			{
				if(resArray[0].link == "left")
				{
					finalData.push({
						key : resArray[0].selfReferralCode,
						parent : resArray[0].parentReferralCode,
						name : resArray[0].username
					})
					finalData.push({
						key : "Empty",
						parent : resArray[0].parentReferralCode,
						name : "No Child"
					})

				}
				else
				{
					finalData.push({
						key : "Empty",
						parent : resArray[0].parentReferralCode,
						name : "No Child"
					})
					finalData.push({
						key : resArray[0].selfReferralCode,
						parent : resArray[0].parentReferralCode,
						name : resArray[0].username
					})
				}
				return resArray;
			}
			else if(resArray.length == 0)
			{
				return resArray;
			}
		})
		.then((resArray)=>{
			if(resArray.length == 2)
			{
				getEverything(resArray[0].selfReferralCode);
				getEverything(resArray[1].selfReferralCode);
			}
			else if(resArray.length == 1)
			{
				getEverything(resArray[0].selfReferralCode);
			}
		})
	}

	getEverything(referral);

	setTimeout(function(){
		callback(finalData);
	},8000);

}




//get total coins available from the inital 9 million
exports.getTotalCoinsAvailable = function(callback)
{
	sipStage.findOne({},function(e,res){
		var coinsRemaining = 9000000 - res.totalCoins;
		callback(coinsRemaining);
	})
}

//get secret of resendActivation
exports.getDataForResend = function(user, callback)
{
	accounts.findOne({user:user},{secret:1,email:1,_id:0},function(e,res){
		if(res != null) {
			console.log(res);
			callback(res);
		}
		else {
			callback(null);
		}
	})
}

//get total coins and stage
exports.getProgress = function(callback)
{
	sipStage.findOne({},{totalCoins:1,stage:1,_id:0},function(e,res){
		if(res != null) callback(res.totalCoins, res.stage);
		else callback(0,1);
	})
}

exports.incrementTotalCoins = function(coins, callback)
{
	sipStage.update({about:"sipStage"},{$inc:{totalCoins:coins}}, callback("Incremented Coins in SIP Stage Document"));
}

var getTime = function()
{
	return new Promise(function(resolve,reject){
		resolve(moment().format('MMMM Do YYYY, h:mm:ss a'));
	})
}

exports.updateSIPStageDocument = function()
{
	sipStage.findOne({},function(e,res){
		if(res != null && res.totalCoins >= 9000000){
			res.stage = 4;
			res.tokenValue = 0;
			res.stageThreeEndTime = moment().format('MMMM Do YYYY, h:mm:ss a');

			getTime().then((time)=>{
				res.stageThreeEndTime = time;
				//return getTime();
			})
			.then((time)=>{
				//res.stageTwoStartTime = time;
			})
			.then(()=>{
				sipStage.save(res,{safe:true});
			})

		}
		else if (res != null && res.totalCoins >= 6000000) {
			res.stage = 3;
			res.tokenValue = tokenValues.stageThree;

			getTime().then((time)=>{
				res.stageTwoEndTime = time;
				return getTime().then((time)=>{return time});
			})
			.then((time)=>{
				res.stageThreeStartTime = time;
			})
			.then(()=>{
				sipStage.save(res,{safe:true});
			})


		}
		else if (res != null && res.totalCoins >= 3000000) {
			res.stage = 2;
			res.tokenValue = tokenValues.stageTwo;

			getTime().then((time)=>{
				res.stageOneEndTime = time;
				return getTime().then((time)=>{return time});
			})
			.then((time)=>{
				res.stageTwoStartTime = time;
			})
			.then(()=>{
				sipStage.save(res,{safe:true});
			})
		}
	})
}

//check for presence of correct referral Code

exports.checkForReferral = function(ref, callback)
{
	referrals.findOne({selfReferralCode:ref},function(e,res){
		if(res != null) callback(true);
		else callback(false);
	})
}

//check if link available
exports.checkIfLinkAvailable = function(parentRef, link, callback)
{
	referrals.findOne({parentReferralCode:parentRef, link:link},function(e,res){
		if(res == null) callback(true);
		else callback(false);
	})
}

exports.insertSIPStageDocument = function()
{
	sipStage.findOne({},function(e,res){
		if(res == null) {
			sipStage.insert({
				about:"sipStage",
				tokenValue : tokenValues.stageOne,
				stage : 1,
				totalCoins : 0,
				stageOneStartTime : moment().format('MMMM Do YYYY, h:mm:ss a'),
				stageOneEndTime : "",
				stageTwoStartTime : "",
				stageTwoEndTime : "",
				stageThreeStartTime : "",
				stageThreeEndTime : "",
				stageFourStartTime : "",
				stageFourEndTime : ""
			});
			console.log("SIP Stage Document Created New");
			console.log("SIP Stage Document :: Token Value : 1.5 :: Stage : 1 :: Total Coins : 0");
		}
		else{
			console.log("SIP Stage Document Already Present");
			console.log(res);
		}
	})
}

exports.verifyAccount = function(secretID, callback)
{
	accounts.update({secret:secretID},{$set:{accountVerified:true}}, callback("Verified"));
}

exports.checkAccountVerification = function(username, callback)
{
	accounts.findOne({user:username},function(e,o){
		if(o.accountVerified) callback(true);
		else callback(false);
	})
}

exports.insertResponse = function(response, callback)
{
	Res.insert(response,callback);
}

exports.referralAdd = function(selfCode, toBePushedCode, callback)
{
	referrals.findOne({selfReferralCode:selfCode},function(e,o){
		if(o)
		{
			o.referred.push(toBePushedCode);
			o.referredCount = o.referredCount + 1;
			referrals.save(o, {safe:true}, callback);
		}
	})
}


//checking whether the plan amount is set or not based on the first investment
exports.checkForPlanAmtSet = function(username, callback)
{
	accounts.findOne({user:username},function(e,res){
		if(res.planAmountSet == true) callback(true);
		else{
			accounts.update({user:username},{$set:{planAmountSet:true}});
			callback(false);
		}
	})
}

exports.referralCreate = function(username, emailid, selfRef, sponsorRef, parentRef, link, callback)
{
	var referralDoc = {
		username : username,
		email : emailid,
		selfReferralCode : selfRef,
		sponsorReferralCode : sponsorRef,//sponsorer referral code, comes from registration page
		parentReferralCode : parentRef,//parent referral code, comes from registration page
		link : link,//left || right || root
		planAmt : -1,// plan amount assign after considering the first transaction
		currentAmt : 0,
		referred : [],
		level : 1,
		referredCount : 0,
		referralTokens : 0
	}

	referrals.insert(referralDoc, callback);

}

//get transac doc using invoice ID
exports.getTransactionDocUsingInvoice = function(invoice, callback)
{
	transactions.findOne({TransactionID:invoice},{demandedTokens:1, publicAddressWallet:1, BTCofTokens:1, valueOfOneToken:1, BTCtoUSD:1, _id:0},function(e,res){
		if(res != null) callback(res)
		else callback(null);
	})
}

exports.updateTransactionDoc = function(o, callback)
{
	transactions.save(o, {safe:true}, callback);
}

exports.getTransaction = function(TID, callback)
{
	transactions.findOne({TransactionID:TID},function(e,o){
		if(o)
		{
			callback(o);
		}
	})
}

exports.incrementTokens = function(username, tok, callback)
{
	console.log("inside increment tokens");
	accounts.update({user:username},{$inc:{tokens:tok}},callback("updated"));
	// accounts.findOne({user:username},function(e,o){
	// 	o.tokens = o.tokens + tok;
	// 	accounts.save(o,{safe:true}, callback("updated"));
	// })
}

//increment tokens in referral document
exports.incrementTokensAmtInReferral = function(username, amt, callback)
{
	console.log("inside referral tokens increment");
	var planAmt;

	if(amt > 10000)
	{
		planAmt = 10000;
	}
	else if(amt > 3000)
	{
		planAmt = 3000;
	}
	else if(amt > 2000)
	{
		planAmt = 2000;
	}
	else if(amt > 1000)
	{
		planAmt = 1000;
	}
	else if(amt > 500)
	{
		planAmt = 500;
	}
	else if(amt > 150)
	{
		planAmt = 150;
	}
	else {
		planAmt = amt;
	}

	referrals.update({user:username},{$inc:{currentAmt:amt},$set:{planAmt:planAmt}},callback("currentAmt updated"));
	//db.testing.update({case:3},{$inc:{a:5},$set:{b:5}})
}

// left right info for parent node
exports.getLeftRight = function(ref, callback)
{
	referrals.find({parentReferralCode:ref}).toArray(function(e,res){
		if(res != null) {
			callback(res);
		}
		else {
			callback(null);
		}
	})
}

exports.incrementRefTokens = function(username, tok, callback)
{
	console.log("inside increment tokens");
	accounts.update({user:username},{$inc:{referralTokens:tok}},callback("updated"));
	// accounts.findOne({user:username},function(e,o){
	// 	o.tokens = o.tokens + tok;
	// 	accounts.save(o,{safe:true}, callback("updated"));
	// })
}

exports.updateTokenValueOfUserInDB = function(username, emailid, tokenvalue, callback)
{
	accounts.findOne({user:username,email:emailid},function(e,o){
		if(o)
		{
			o.valueOfTokens = o.tokens * tokenvalue;
			o.valueOfReferralTokens = o.referralTokens * tokenvalue;
			accounts.save(o,{safe:true}, callback)
		}
	})
}

exports.getAccount = function(username, emailid, callback)
{
	accounts.findOne({user:username,email:emailid},function(e,o){
		if(o)
		{
			callback(o);
		}
		else {
			callback(null);
		}
	})
}

exports.currentTokenValue = function(callback)
{
	console.log("inside teh exports");
	sipStage.find({about:"sipStage"}).toArray(
		function(e, res) {
			callback(res);
		}
	)
}

/* login validation methods */

exports.autoLogin = function(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o){
			o.pass == pass ? callback(o) : callback(null);
		}	else{
			callback(null);
		}
	});
}

exports.manualLogin = function(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o == null){
			callback('user-not-found');
		}	else{
			validatePassword(pass, o.pass, function(err, res) {
				if (res){
					callback(null, o);
				}	else{
					callback('invalid-password');
				}
			});
		}
	});
}

/* record insertion, update & deletion methods */

exports.addNewAccount = function(newData, callback)
{
	accounts.findOne({user:newData.user}, function(e, o) {
		if (o){
			callback('username-taken');
		}	else{
			accounts.findOne({email:newData.email}, function(e, o) {
				if (o){
					callback('email-taken');
				}	else{
					saltAndHash(newData.pass, function(hash){
						newData.pass = hash;
					// append date stamp when record was created //
						newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
						accounts.insert(newData, {safe: true}, callback);
					});
				}
			});
		}
	});
}

exports.updateAccount = function(newData, callback)
{
	accounts.findOne({_id:getObjectId(newData.id)}, function(e, o){
		o.name 		= newData.name;
		o.email 	= newData.email;
		o.country 	= newData.country;
		if (newData.pass == ''){
			accounts.save(o, {safe: true}, function(e) {
				if (e) callback(e);
				else callback(null, o);
			});
		}	else{
			saltAndHash(newData.pass, function(hash){
				o.pass = hash;
				accounts.save(o, {safe: true}, function(e) {
					if (e) callback(e);
					else callback(null, o);
				});
			});
		}
	});
}

exports.updatePassword = function(email, newPass, callback)
{
	accounts.findOne({email:email}, function(e, o){
		if (e){
			callback(e, null);
		}	else{
			saltAndHash(newPass, function(hash){
		        o.pass = hash;
		        accounts.save(o, {safe: true}, callback);
			});
		}
	});
}

/* account lookup methods */

exports.deleteAccount = function(id, callback)
{
	accounts.remove({_id: getObjectId(id)}, callback);
}

exports.getAccountByEmail = function(email, callback)
{
	accounts.findOne({email:email}, function(e, o){ callback(o); });
}

exports.validateResetLink = function(email, passHash, callback)
{
	accounts.find({ $and: [{email:email, pass:passHash}] }, function(e, o){
		callback(o ? 'ok' : null);
	});
}

exports.getAllRecords = function(callback)
{
	accounts.find({},{_id:0}).toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
}

exports.getTransactions = function(username, emailid, callback)
{
	transactions.find({username:username,email:emailid},{_id:0}).toArray(
		function(e, res) {
			if(e) callback(e)
			else{
				//console.log(res);
				callback(null,res)
			}
		});
}

exports.insertTransaction = function(newData, callback)
{
	transactions.insert(newData);
}

//get self referral code
exports.getSelfReferralCode = function(username, callback)
{
	accounts.findOne({user:username},{_id:0,selfReferralCode:1},function(e,o){
		callback(o);
	})
}

exports.getReferrals = function(user, emailid, callback)
{
	// referrals.find({user:username,email:emailid}).toArray(
	// 	function(e,res) {
	// 		if(e) callback(e)
	// 		else callback(null,res);
	// 	}
	// )

	referrals.findOne({username:user, email:emailid},{_id:0},function(e,o){
		console.log(o);
		if(o) callback(null, o);
		else callback(null);
	});
}

exports.delAllRecords = function(callback)
{
	accounts.remove({}, callback); // reset accounts collection for testing //
}

/* private encryption & validation methods */

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

var getObjectId = function(id)
{
	return new require('mongodb').ObjectID(id);
}

var findById = function(id, callback)
{
	accounts.findOne({_id: getObjectId(id)},
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
}

var findByMultipleFields = function(a, callback)
{
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	accounts.find( { $or : a } ).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
}

var getREFCollection = function()
{
	return new Promise(function(resolve,reject){
		referrals.find().toArray(function(e, res){
			resolve(res);
		})
	})
}

var getUsername = function(ref)
{
	return new Promise(function(resolve,reject){
		referrals.findOne({selfReferralCode:ref},function(e,o){
			if(o) resolve(o.username);
		})
	})
}

var levelMembers = function(level) {
	if(level == 0) return 0;
	if(level == 1) return 2;
	var members = Math.pow(2,level);
	return members + levelMembers(level-1);
}

var getFirstTransactionTokens = function(user) {
	var value = 0;
	return new Promise(function(resolve,reject){
		transactions.findOne({username:user, amountPaid:true},function(e,o){
			if(o) {
				value = o.tokens;
				resolve(value);
			}
			else {
				value = 0;
				resolve(value);
			}
		})
	})
}

var mapConvert = {
	'0': 0,
	'1': 2,
  '2': 6,
  '3': 14,
  '4': 30,
  '5': 62,
  '6': 126,
  '7': 254,
  '8': 510,
  '9': 1022,
  '10': 2046,
  '11': 4094,
  '12': 8190,
  '13': 16382,
  '14': 32766,
  '15': 65534
}

var bonusPercent = {
	'1' : 10,
	'2' : 4,
	'3' : 3,
	'4' : 3,
	'5' : 3,
	'6' : 2,
	'7' : 2,
	'8' : 2,
	'9' : 1,
	'10' : 1,
	'11' : 1,
	'12' : 1,
	'13' : 0.5,
	'14' : 0.5,
	'15' : 0.5
}

var btcCheck = function(){
	return new Promise(function(resolve,reject){
		console.log("inside btcCheck");
		request('https://blockchain.info/ticker', { json: true }, (err, res, body) => {
			if (err) { return console.log(err); }
			resolve(body.USD.last);
		});
	});
}

var IncLevelAndTokensOfRefRecord = function(user, tokens, callback){
	referrals.update({username:user},{$inc:{level:1,referralTokens:tokens}},callback);
}

var RefSysUpdate = function() {
	console.log("RefSysUpdate function called");
	getREFCollection().then((referralsArray)=>{

		console.log("referrals array found of length : "+referralsArray.length);

		for(var i = 0; i<referralsArray.length; i++)
		{
			var traverseRefArray = function(i) {
				console.log("Referral Array : " + i);
				var record = referralsArray[i];
				var level = record.level;
				var refCount = record.referredCount;
				var selfRef = record.selfReferralCode;
				var referred = record.referred;
				var idealRefTillLevel = mapConvert[level];

				if(refCount == idealRefTillLevel)
				{
					console.log("Ideal Count Reached for index: " + i + " username : "+record.username);
					var startIndex = mapConvert[level-1];
					var endIndex = mapConvert[level] - 1;
					var TokensOfFirstInvestment = 0;
					var tokens;
					var sip;
					console.log("start index : "+startIndex);
					console.log("end index : "+endIndex);

					new Promise(function(resolve,reject){
						for(var index = startIndex; index <=endIndex; index++)
						{
							console.log("inside index : "+index);
							var calcBusinessValue = function(index, endIndex, resolve) {
								getUsername(referred[index]).then((username)=>{
									return getFirstTransactionTokens(username).then((value)=>{return value;})
								})
								.then((TotalValue)=>{
									TokensOfFirstInvestment = TokensOfFirstInvestment + TotalValue;
									console.log("Self Ref : "+selfRef + " || Referred : "+referred[index] + " || Value From the Ref : " + TotalValue + " || Final Tokens Till Now : " + TokensOfFirstInvestment);
									if(index == endIndex) resolve("Total Tokens Calculated");
								})
							}
							calcBusinessValue(index, endIndex, resolve);
						}
					})
					.then((message)=>{
						console.log(message);
						//currentTokenValue((SIP)=>{
							return (TokensOfFirstInvestment*bonusPercent[level]/100);
						//})
					})
					.then((tokens)=>{
						record.level = record.level + 1;
						exports.incrementRefTokens(record.username, parseFloat((tokens).toFixed(8)), function(message){
							IncLevelAndTokensOfRefRecord(record.username, parseFloat((tokens).toFixed(8)), function(){
								console.log("Tokens : " + message + " || Username : "+record.username);
								console.log("Completion of Referral Updation for : "+record.username);
							})
						})
					})
				}
			}
			traverseRefArray(i);
		}
	})
	.catch((err)=>{
		console.log("Error while executing RefSysUpdate Function. Error : " + err);
	})
}


// var testFunc = function()
// {
// 	for(var i=0;i<10;i++)
// 	{
// 		var test = function(i){
// 			console.log(i);
// 			if(i == 9) console.log("end");
// 		}
// 		test(i);
// 	}
// }
