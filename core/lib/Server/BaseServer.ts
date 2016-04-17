import {createServer, Server, IncomingMessage, ServerResponse} from 'http';


interface ServerSettings {
    port: number,
    host?: string
}

export default class BaseServer {
    protected httpServer: Server;

    constructor(protected options: ServerSettings, callBack?: Function) {
        this.httpServer = createServer((request, response) => {
            if(callBack){
            callBack(request, response);}
        });
    }

    start() {
        this.httpServer.listen(this.options.port||8000, this.options.host || 'localhost', (...args) => {
            console.log('Server has been started',  args);
        });
    }
    handle(cb: Function) {
        this.httpServer.on('request', cb);
    }
    stop() {

    }

}