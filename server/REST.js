var mysql   = require("mysql");

function REST_ROUTER(router,pool) {
// function REST_ROUTER(router,connection,md5) {
    var self = this;
    // self.handleRoutes(router,connection,md5);
    self.handleRoutes(router,pool);
}

function SignIn(timesheetId, userEmail, res, connection){
    var query = "INSERT INTO timesheet_log "
              + "( TimesheetId, DTStartLog, UserEmail )"
              + "VALUES (?, NOW(), ?)"
    var table = [timesheetId, userEmail];
    query = mysql.format(query, table);
    connection.query(query, function(err, rows){
        connection.release();
        if(err) throw err;
        res.json({"SignIn" : rows});
    });
}

function SignOut(logId, comments, res, connection){
    var query = "UPDATE timesheet_log"
              + " SET DTEndLog = NOW(), Comments = ?"
              + " WHERE LogId = ?";
    var table = [comments, logId];
    query = mysql.format(query, table);
    connection.query(query, function(err, rows){
        connection.release();
        if(err) throw err;
        res.json({"SignOut" : rows});
    });
}


// REST_ROUTER.prototype.handleRoutes = function(router,connection,md5) {
REST_ROUTER.prototype.handleRoutes = function(router,pool) {
    var self = this;

    router.get("/",function(req,res){
        res.json({"Message" : "Hello World !"});
    });

    router.get("/timesheet/:timesheetId/info",function(req,res){
        //todo is this too much sql? should this be in a SP or a view?
        var query = "SELECT programs.`Name` AS programName,"
                  + " organizations.`Name` AS organizationName,"
                  + " timesheet.`Name` AS timesheetName"
                  + " FROM timesheet"
                  + " JOIN programs "
                  + " ON programs.`ProgramId` = timesheet.`ProgramId`"
                  + " JOIN organizations"
                  + " ON organizations.`OrganizationId` = programs.`OrganizationId`"
                  + " WHERE timesheet.`TimesheetId` = ?";
        var table = [req.params.timesheetId];
        query = mysql.format(query,table);
        pool.getConnection(function(err, connection) {
            connection.query(query,function(err,rows){
                connection.release();
                if(err) throw err;
                res.send(rows[0]);                
            });
        });
    });

    router.get("/timesheet/:timesheetId",function(req,res){
        //todo is this too much sql? should this be in a SP or a view?
        var query = "SELECT *"
                  + " FROM timesheet_log"
                  + " WHERE timesheet_log.`TimesheetId` = ?";
                  // + " LIMIT 1000";
        var table = [req.params.timesheetId];
        query = mysql.format(query,table);
        pool.getConnection(function(err, connection) {
            connection.query(query,function(err,rows){
                connection.release();
                if(err) throw err;
                res.send(rows);                
            });
        });
    });

//this is a hack for now, ultimately need to implement users 
//maybe return user and have last logged info on user or log status or something
    router.get("/timesheet/GetLastLogged/:userEmail",function(req,res){
        var query = "SELECT * FROM timesheet_log"
                  + " WHERE timesheet_log.`UserEmail` = ?"
                  + " ORDER BY timesheet_log.`DTStartLog` DESC LIMIT 1";
        var table = [req.params.userEmail];
        query = mysql.format(query,table);
        pool.getConnection(function(err, connection) {
            connection.query(query,function(err,rows){
                connection.release();
                if(err) throw err;
                res.send(rows[0]); 
            });
        });
    });
//hack for now
    router.post("/timesheet/:timesheetId/Log/:userEmail",function(req,res){
        var query = "SELECT * FROM timesheet_log"
                  + " WHERE timesheet_log.`UserEmail` = ?"
                  + " ORDER BY timesheet_log.`DTStartLog` DESC LIMIT 1";
        var table = [req.params.userEmail];
        query = mysql.format(query,table);
        pool.getConnection(function(err, connection) {
            connection.query(query,function(err,rows){
                if (err) {
                    throw err;
                } else {
                    if (rows.length > 0) {
                        lastLogged = rows[0];

                        if(lastLogged.DTEndLog == null) {
                            if(lastLogged.TimesheetId == req.params.timesheetId){
                                SignOut(lastLogged.LogId, req.body.comments, res, connection);
                                return; 
                            }
                            else {                                
                                connection.release();
                                throw "Did not log out from another timesheet";
                            }                       
                        }
                    }
                    SignIn(req.params.timesheetId, req.params.userEmail, res, connection);
                }
            });
        });
    });

    // router.post("/users",function(req,res){
    //     var query = "INSERT INTO ??(??,??) VALUES (?,?)";
    //     var table = ["user_login","user_email","user_password",req.body.email,md5(req.body.password)];
    //     query = mysql.format(query,table);
    //     connection.query(query,function(err,rows){
    //         if(err) {
    //             res.json({"Error" : true, "Message" : "Error executing MySQL query"});
    //         } else {
    //             res.json({"Error" : false, "Message" : "User Added !"});
    //         }
    //     });
    // });

    // router.put("/users",function(req,res){
    //     var query = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
    //     var table = ["user_login","user_password",md5(req.body.password),"user_email",req.body.email];
    //     query = mysql.format(query,table);
    //     connection.query(query,function(err,rows){
    //         if(err) {
    //             res.json({"Error" : true, "Message" : "Error executing MySQL query"});
    //         } else {
    //             res.json({"Error" : false, "Message" : "Updated the password for email "+req.body.email});
    //         }
    //     });
    // });

    // router.delete("/users/:email",function(req,res){
    //     var query = "DELETE from ?? WHERE ??=?";
    //     var table = ["user_login","user_email",req.params.email];
    //     query = mysql.format(query,table);
    //     connection.query(query,function(err,rows){
    //         if(err) {
    //             res.json({"Error" : true, "Message" : "Error executing MySQL query"});
    //         } else {
    //             res.json({"Error" : false, "Message" : "Deleted the user with email "+req.params.email});
    //         }
    //     });
    // });
}

module.exports = REST_ROUTER;
