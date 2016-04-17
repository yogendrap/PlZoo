/**
 * @Module PlZooKernel 
 * @Info
 * 
 * Register all the default module to DI
 * 
 * 
 */


import {IncomingMessage, ServerResponse} from 'http';
import {IplZooKernel} from './IplZooKernel';
import Settings from './lib/Site/settings';

import Request from './lib/HttpFoundation/Request'
import Response from './lib/HttpFoundation/Response'

export default class PlZooKernel implements IplZooKernel {
    static isEnvironmentInitialized: boolean = false;
    static isInstallationProcess: boolean = true;

    constructor() {

    }

    static bootEnvironment() {
        if (PlZooKernel.isEnvironmentInitialized) {
            return;
        }
        PlZooKernel.isEnvironmentInitialized = true;
    }

    protected initializeSettings() {
        // setting initialize
        try {
            Settings.initialize();
        } catch (exception) {
            //unable to read configuration file
            PlZooKernel.isInstallationProcess = true;
            return;
        }
        PlZooKernel.isInstallationProcess = false;
        
        
        //  XXX::: connect with data base
        // Initialize our list of trusted HTTP Host headers to protect against
        // header attacks.
        //$host_patterns = Settings::get('trusted_host_patterns', array());
    
        //   if (static::setupTrustedHosts($request, $host_patterns) === FALSE) {
        //     throw new BadRequestHttpException('The provided host name is not valid for this server.');
        //   }
        
      
    }

    public getSettingsFor(name: string) {
        return Settings.get(name);
    }

    static create() {
        const kernel = new PlZooKernel();
        PlZooKernel.bootEnvironment();
        kernel.initializeSettings();
        return kernel;
    }

    public handle(request: IncomingMessage, response: ServerResponse) {
        let _request = new Request(request, response);
        let _response = new Response(request, response);


        if (PlZooKernel.isInstallationProcess) {
            this.initializeSettings()
            // XXX::: web interface for installation process to start with
            return PlZooKernel.isInstallationProcess ?
                response.end('Installation needed for the application.')
                : response.end('Installation completed! Refesh your browser');
        }
        
        // application setup done above 
        // XXX::: check for trusted_host    
        
        try {
            // XXX::: Handle request based on url 
            
            response.write(request.url);
            response.end();
        } catch (exception) {

        }
    }


}