var Promise = require("bluebird");


var testFunc = function()
{
	for(var i=0;i<10;i++)
	{
		var test = function(i){
      setTimeout(()=>{
        console.log(i);
        if(i == 9) console.log("end");

      },1000);
		}
		test(i);
	}
}

//testFunc();


new Promise(function(resolve,reject){
  for(var i=0;i<9999999;i++)
	{
		var test = function(i){
      setTimeout(()=>{
        console.log(i);
        if(i == 9999998) {
          console.log("end");
          resolve("resolve");
        }
      },0);
		}
		test(i);
	}
})
.then((msg)=>{
  console.log("then")
})

process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log("uncaughtException"+err);
})
