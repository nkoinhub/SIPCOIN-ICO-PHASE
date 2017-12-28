const request = require('request');
var Promise = require("bluebird");

var btcCheck = function(){
  //var usd;
  return new Promise(function(resolve,reject){
    request('https://blockchain.info/ticker', { json: true }, (err, res, body) => {
      if (err) { return console.log(err); }
      resolve(body.USD.last);
    });
  })

}



btcCheck().then((value)=>{
  console.log("into the then "+value);
  return btcCheck().then((value)=>{return "into the then "+value})
})
.then((value)=>{
  console.log("into the 2nd then "+value);
})
