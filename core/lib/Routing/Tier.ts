import * as pathRegexp from 'path-to-regexp';


export default class Tier {
    public name: string;
    public params: Object;
    public regexp: RegExp;
    public fast_slash: boolean = false;
    public keys: Array<string>;
    public method:string = undefined;
    constructor(public path: string, public options: Object = {}, public handler: Function) {
        this.name = this.handler.name || '<annonymous>';
        this.regexp = pathRegexp(this.path, this.keys = [], options);

        if (path === '/' && options.end === false) {
            this.fast_slash = true;
        }
    }
    errorHandler(error: Error, request, response, next) {
        // Error handler should be having length of 4
        if (this.handler.length !== 4) return next(error);

        try {
            this.handler(error, request, response, next);
        } catch (exception) {
            // Error Handler unable to handle error
            next(exception);
        }
    }

    requestHandler(request, response, next) {
        // Request handle should be having length 3 
        if (this.handler.length > 3) return next();

        try {
            this.handler(request, response, next)
        } catch (exception) {
            next(exception);
        }

    }

    matchPath(path: string) {
        if (path === null) {
            this.params = undefined;
            this.path = undefined;
            return false;
        }

        if (this.fast_slash) {
            this.params = {};
            this.path = '';
            return true;
        }

        var match = this.regexp.exec(path);
        if (!match) {
            this.params = undefined;
            this.path = undefined;
            return false;
        }

        this.params = {};
        this.path = match[0];

        var keys = this.keys;
        var params = this.params;
        for (var i = 1; i < match.length; i++) {
            var key = keys[i - 1];
            var prop = key.name;
            var val = decode_param(match[i]);

            if (val !== undefined || !(params.hasOwnProperty(prop))) {
                params[prop] = val;
            }
        }

        return true;
    }
}


function decode_param(val) {
    if (typeof val !== 'string' || val.length === 0) {
        return val;
    }

    try {
        return decodeURIComponent(val);
    } catch (err) {
        if (err instanceof URIError) {
            err.message = 'Failed to decode param \'' + val + '\'';
            err.status = err.statusCode = 400;
        }

        throw err;
    }
}
