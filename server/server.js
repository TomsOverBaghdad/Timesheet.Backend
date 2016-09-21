//https://codeforgeek.com/2015/03/restful-api-node-and-express-4/

var express = require("express");
var mysql   = require("mysql");
var bodyParser  = require("body-parser");
// var md5 = require('MD5');
var rest = require("./REST.js");
var app  = express();
var cors = require('express-cors');


var resources; 
try{
  resources = require("./resources.json");  
  console.log("loading local resources");
}catch(e){
  resources = process.env;
  console.log("loading environment variables");
}


function REST(){
    var self = this;
    self.connectMysql();
};

REST.prototype.connectMysql = function() {
    var self = this;
    var pool      =    mysql.createPool({
        connectionLimit : 50,
        waitForConnection: true,
        // connectTimeout  : 1000,
        // acquireTimeout  : 1000,
        // timeout         : 1000,
        host     : resources.host,
        user     : resources.user,
        password : resources.password,
        database : resources.database
    });
    self.configureExpress(pool);
}

REST.prototype.configureExpress = function(pool) {
  	var self = this;    
    app.use(cors({
      allowedOrigins: [
        'itsabouttime.herokuapp.com', 'localhost', 'localhost:8080', 'herokuapp.com'
      ]
    }));
  	app.use(bodyParser.urlencoded({ extended: true }));
 	  app.use(bodyParser.json());
     //
  	var router = express.Router();
  	app.use('/', router);
  	var rest_router = new rest(router,pool);
  	// var rest_router = new rest(router,connection,md5);
  	self.startServer();
}

REST.prototype.startServer = function() {
	var port = process.env.PORT || resources.port;
	app.listen(port,function(){
    	console.log("All right ! I am alive at Port: " + port);
    });
}

REST.prototype.stop = function(err) {
    console.log("ISSUE WITH MYSQL");
    console.log(err);
    process.exit(1);
}

new REST();