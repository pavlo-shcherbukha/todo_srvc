var session = require('express-session');
var Keycloak = require('keycloak-connect');
const IBMCloudEnv = require('ibm-cloud-env');
IBMCloudEnv.init('/server/config/mappings.json');
const { LogContext,  AppLogger } = require('./logcontext');
var logctx= new LogContext();
var applog= new AppLogger();
applog.LogContext=logctx;
let label='KeycloakConfig'

let _keycloak;

applog.info( 'Read keycloak config from env',label);
const keyk_clientid =  IBMCloudEnv.getString("KEYCLOAK_CLIENTID");
const keyk_realm =  IBMCloudEnv.getString("KEYCLOAK_REALM");
const keyk_url =  IBMCloudEnv.getString("KEYCLOAK_URL");

applog.info( 'keycloak  env var: clientid=${keyk_clientid}  realm=${keyk_realm }  url=${keyk_url}',label);


var keycloakConfig = {
    clientId: keyk_clientid,
    bearerOnly: true,
    serverUrl: keyk_url,
    realm: keyk_realm

};

applog.info( 'keycloak config is ' + JSON.stringify( keycloakConfig )  ,label);

/**
      credentials: {
        secret: '7mrcg3tRazN43sKt7FSouvvBkGojXxVN'
    }
 */
function initKeycloak(memoryStore) {
    if (_keycloak) {
        applog.warn("Trying to init Keycloak again!", label);
        return _keycloak;
    } 
    else {

        applog.info("Init Keycloak", label);
        _keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
        return _keycloak;
    }
}

function getKeycloak() {
    if (!_keycloak){
        applog.error('Keycloak has not been initialized. Please called init first.', label);
    } 
    return _keycloak;
}

module.exports = {
    initKeycloak,
    getKeycloak
};