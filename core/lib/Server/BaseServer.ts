import {createServer, Server, IncomingMessage, ServerResponse} from 'http';
import Request from '../HttpFoundation/Request';
import Response  from '../HttpFoundation/Response'
// var Request = require('../HttpFoundation/Request');
// var Response = require('../HttpFoundation/Response');
// var Context = require('./Context');
interface ServerSettings {
    port: number,
    host?: string
}

export default class BaseServer {
    protected httpServer: Server;
    // public context;
    // public request;
    // public response;

    constructor(protected options: ServerSettings, callBack?: Function) {
        // this.context = Object.create(Context);
        // this.request = Object.create(Request);
        // this.response = Object.create(Response);
        this.httpServer = createServer((request, response) => {
            if (callBack) {
                this.createContext(request, response, callBack);
            }
        });
    }

    start() {
        this.httpServer.listen(this.options.port || 8000, this.options.host || 'localhost', (...args) => {
            console.log('Server has been started');
        });
    }
    handle(cb: Function) {
        this.httpServer.on('request', (request, response) => {
            this.createContext(request, response, cb);
        });
    }
    stop() {

    }

    createContext(req, res, cb?: Function) {
        var context = Object.create(null);
        context.request = new Request(req, res);
        context.response = new Response(req, res);
        // var context = Object.create(this.context);
        // var request = context.request = Object.create(this.request);
        // var response = context.response = Object.create(this.response);
        // context.server = request.server = response.server = this;
        // context.req = request.req = response.req = req;
        // context.res = request.res = response.res = res;
        // request.ctx = response.ctx = context;
        // request.response = response;
        // response.request = request;
        // context.onerror = context.onerror.bind(context);
        // context.originalUrl = request.originalUrl = req.url;
        // context.cookies = new Cookies(req, res, {
        //     keys: this.keys,
        //     secure: request.secure
        // });
        // context.accept = request.accept = accepts(req);
        // context.state = {};
        if (cb) return cb(context);
        return context;
    }

}