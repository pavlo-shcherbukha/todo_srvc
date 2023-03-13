const http = require('http');
const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');

const IBMCloudEnv = require('ibm-cloud-env');

cookieParser    = require('cookie-parser'),
session         = require('express-session'),
bodyParser      = require('body-parser');

query           = require('querystring');

const { LogContext,  AppLogger } = require('./config/logcontext');
var logctx= new LogContext();
var applog= new AppLogger();
applog.LogContext=logctx;
var label='server'
applog.info( 'Server is starting',label);
applog.info( 'Server test message',label);

const localConfig = require('./config/local.json');


const app = express();
app.set('x-powered-by', false);
const server = http.createServer(app);


IBMCloudEnv.init('/server/config/mappings.json');
// Add your code here
const port =  process.env.SHAPP_SERVICE_PORT  || localConfig.port;

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, ad-name, x-powered-by, date, authorization, callid, SystemID, DtRequest,app_username,x-Content-Type");
  res.header('Access-Control-Allow-Methods', 'DELETE,GET,PATCH,POST,PUT'); 
  next();
});


/*=====================================================================*/


const apperror = require('./error/appError');
const applib = require('./applib/apputils');


let i_todos=[
   {"id": "1", "name": "todo-1",  "description": "description todo 1", "owner": "usr1"},
   {"id": "2", "name": "todo-2",  "description": "description todo 2", "owner": "usr2"},
   {"id": "3", "name": "todo-3",  "description": "description todo 3", "owner": "usr4"},
   {"id": "4", "name": "todo-4",  "description": "description todo 4", "owner": "usr4"},
   {"id": "5", "name": "todo-5",  "description": "description todo 5", "owner": "usr3"}
];

app.options('/api/todos',  function(req, res) {
  label='options /api/todos' 
  applog.info( ` Виклик методу `  ,label);
  return res.status(200).end();
});

app.options('/api/todo',  function(req, res) {
  label='options /api/todo' 
  applog.info( ` Виклик методу `  ,label);
  return res.status(200).end();
});

app.options('/api/todo/:todoid',  function(req, res) {
  label='options /api/todo/:id' 
  applog.info( ` Виклик методу `  ,label);
  return res.status(200).end();
});




// Включаємо  session memory store
const memoryStore = new session.MemoryStore()

app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}))


//Поки включаємо keycloack
//const keycloak = require('./config/keycloak-config.js').initKeycloak(memoryStore);
//app.use(keycloak.middleware());




app.get('/api/health',  function(req, res) {
  let label='health';
  applog.info( 'call api/health method', label);
  let result={ "status": "UP"}
  return res.status(200).json( result );

});  

app.get('/api/todos',  /*keycloak.protect(  [ 'app_editor'  ]  ),*/ function(req, res) {
  let label='todos';
  applog.info( 'call api/todos method', label);
  try{
      let result=i_todos;
      return res.status(200).json( result );
  } 
  catch (err){
      applog.error( `Error ${err.message} `, label);
      errresp=applib.HttpErrorResponse(err)
      applog.error( `Error result ${errresp.Error.statusCode} ` + JSON.stringify( errresp )   ,label);
      return res.status(errresp.Error.statusCode ).json(errresp);    

  }

});  

/**
 *  request:
 *      {"name": "todo name", "description": "todo description", "owner": "todo username"}
 *  response-ok
 *      {}
 */
app.post('/api/todo',  function(req, res) {
  let label='todo';
  applog.info( 'call api/todo method', label);
  let body=req.body;
  try { 
      applog.info( 'Check propery [name]', label);
      if (!body.hasOwnProperty("name")){
        throw new apperror.ValidationError( 'key [name] is absend' );
      }
      applog.info( 'Check propery [description]', label);
      if (!body.hasOwnProperty("description")){
        throw new apperror.ValidationError( 'key [description] is absend' );

      }
      applog.info( 'Check propery [owner]', label);
      if (!body.hasOwnProperty("owner")){
        throw new apperror.ValidationError( 'key [owner] is absend' );
      }
      applog.info( 'Return result', label);
      
      body["id"] = uuid.v4()
      i_todos.push(  body )
      let result={"id": body.id};
      return res.status(200).json( result );

  } 
  catch (err){
    applog.error( `Error ${err.message} `, label);
    errresp=applib.HttpErrorResponse(err)
    applog.error( `Error result ${errresp.Error.statusCode} ` + JSON.stringify( errresp )   ,label);
    return res.status(errresp.Error.statusCode ).json(errresp);

  }

});

app.get('/api/todo/:todoid', /* keycloak.protect(  [ 'app_editor', 'app_viewer'  ]  ),*/ function(req, res) {

    let label='todobyid';
    let todo_id = req.params.todoid;
    try { 
  
        applog.info( 'Return todo by id', label);
        let result=i_todos[0];
        findtodobyid(i_todos, todo_id)
        .then (todoidx=>{
            applog.warn( '***************************************************************', label);
            applog.warn( `todo index= ${todoidx}`, label);
            applog.warn( '***************************************************************', label);
            if ( todoidx <0 ) {
              throw new apperror.ValidationError( `Record with id= ${todo_id} not found`  );

            } else {
                let result = i_todos[todoidx] ;
                return res.status(200).json( result );
            }
          
        })
        .catch (err =>{
            applog.error( `Error ${err.message} `, label);
            errresp=applib.HttpErrorResponse(err)
            applog.error( `Error result ${errresp.Error.statusCode} ` + JSON.stringify( errresp )   ,label);
            return res.status(errresp.Error.statusCode ).json(errresp);
        });
    } 
    catch (err){
      applog.error( `Error ${err.message} `, label);
      errresp=applib.HttpErrorResponse(err)
      applog.error( `Error result ${errresp.Error.statusCode} ` + JSON.stringify( errresp )   ,label);
      return res.status(errresp.Error.statusCode ).json(errresp);
  
    };
  

});  

app.delete('/api/todo/:todoid', /* keycloak.protect(  [ 'app_editor', 'app_viewer'  ]  ),*/ function(req, res) {

  let label='todobyid';
  let todo_id = req.params.todoid;
  try { 

      applog.info( 'Return todo by id', label);
      let result=i_todos[0];
      findtodobyid(i_todos, todo_id)
      .then (todoidx=>{
          applog.warn( '***************************************************************', label);
          applog.warn( `todo index= ${todoidx}`, label);
          applog.warn( '***************************************************************', label);
          if ( todoidx <0 ) {
            throw new apperror.ValidationError( `Record with id= ${todo_id} not found`  );

          } else {
              let result = { "id": i_todos[todoidx].id };
              i_todos.splice(todoidx, 1);
              return res.status(200).json( result );
          }
        
      })
      .catch (err =>{
          applog.error( `Error ${err.message} `, label);
          errresp=applib.HttpErrorResponse(err)
          applog.error( `Error result ${errresp.Error.statusCode} ` + JSON.stringify( errresp )   ,label);
          return res.status(errresp.Error.statusCode ).json(errresp);
      });
  } 
  catch (err){
    applog.error( `Error ${err.message} `, label);
    errresp=applib.HttpErrorResponse(err)
    applog.error( `Error result ${errresp.Error.statusCode} ` + JSON.stringify( errresp )   ,label);
    return res.status(errresp.Error.statusCode ).json(errresp);

  };


}); 




/**
 * Find todo in array by id
 * @returns  
 *    if found - array index  
 *    if not found - (-1)
 */
function findtodobyid( todolist, todo_id ) {
  return new Promise(function (resolve) {
      return resolve( todolist.findIndex( (item ) => { 
                                if (item.id.localeCompare(todo_id ) === 0){
                                    return true;
                                }
                      }) );
  });
};   //findtodobyid



if(!module.parent){ 

  server.listen(port, function(){

    applog.info( 'SERVER HAS STARTED',label);
    applog.info( `LISTENING  PORT= ${port} on HOST ${ ( typeof process.env.HOSTNAME === "undefined") ? 'localhost' :  process.env.HOSTNAME}`,label);
  
  });
}


module.exports = server;