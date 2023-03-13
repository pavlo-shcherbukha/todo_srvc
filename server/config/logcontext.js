const winston = require('./winston');
var logger = winston ;
const MaskData = require('maskdata');

const maskJSONOptions = {
    maskWith : "*",
    fields : ['password'] 
  };

class LogContext {
    constructor() {
      this.hostname=process.env.HOSTNAME || 'localhost';
      this.service='todo-srvc-be';
      this.username = null;
      this.state=null;

    }

    get Hostname(){
        return this.hostname;
    }
    set Hostname( hostname ){
        this.hostname=hostname;
    }

    get Service(){
        return this.service;
    }
    set Service( service ){
        this.service=service;
    }

    get Username(){
        return this.username;
    }
    set Username( username ){
        this.username=username;
    }
    get State(){
        return this.state;
    }
    set State( state ){
        this.state=state;
    }

}


class AppLogger {
        constructor() {
            this.logctx = new LogContext();

        }

        get LogContext(){
            return this.logctx;
        }
        set LogContext(logctx){
            this.logctx = logctx;
        }

        get Username(){
            return this.logctx.username;
        }
        set Username( username ){
            this.logctx.username = username ;
        }

        get State(){
            return this.logctx.state ;
        }
        set State(state){
            this.logctx.state = state ;
        }

        log(  amsg,  alabel, alevel) {

            if (typeof alabel === "undefined" || alabel === null || alabel === '') {
                alabel = 'server';
            }
            if (typeof alevel === "undefined" || alevel === null || alevel === '') {
                alevel = 'info';
            }
            if (typeof amsg === "undefined" || amsg === null || amsg === '') {
            amsg = '-';
            }
        
            logger.log({    level: alevel, 
                            label: alabel, 
                            message: amsg, 
                            username:this.logctx.username,
                            state: this.logctx.state, 
                            hostname: this.logctx.hostname,
                            servicename: this.servicename
                            });

        }

        error(amsg,  alabel){

            this.log(amsg,  alabel, 'error');
        }

        warn(amsg,  alabel){

            this.log(amsg,  alabel, 'warn');
        }

        info(amsg,  alabel){

            this.log(amsg,  alabel, 'info');
        }

        verbose(amsg,  alabel){

            this.log(amsg,  alabel, 'verbose');
        }

        debug(amsg,  alabel){

            this.log(amsg,  alabel, 'debug');
        }

        silly(amsg,  alabel){

            this.log(amsg,  alabel, 'silly');
        }





}


module.exports = { LogContext, AppLogger }