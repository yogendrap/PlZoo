
import * as flatten from 'array-flatten';
import Tier from './Tier';
import * as methods from 'methods';

var slice = Array.prototype.slice;
var toString = Object.prototype.toString;


export default class Route {
    public tiers: Array<Tier> = [];
    public methods: Object = {};
    constructor(public path: string) {

    }

    private handlersMethod(method: string) {
        if (this.methods._all) {
            return true;
        }

        var name = method.toLowerCase();


        if (name === 'head' && !this.methods['head']) {
            name = 'get';
        }

        return Boolean(this.methods[name]);
    }

    private options() {
        var methods = Object.keys(this.methods);

        // append automatic head
        if (this.methods.get && !this.methods.head) {
            methods.push('head');
        }

        for (var i = 0; i < methods.length; i++) {
            // make upper case
            methods[i] = methods[i].toUpperCase();
        }

        return methods;
    }

    dispatch(request, response, done) {
        var idx = 0;
        var tiers = this.tiers;
        if (tiers.length === 0) {
            return done();
        }

        var method = request.method.toLowerCase();
        if (method === 'head' && !this.methods['head']) {
            method = 'get';
        }

        request.route = this;

        next();
        return;
        /////////
        function next(err) {
            if (err && err === 'route') {
                return done();
            }

            var tier: Tier = tiers[idx++];
            if (!tier) {
                return done(err);
            }

            if (tier.method && tier.method !== method) {
                return next(err);
            }

            if (err) {
                tier.errorHandler(err, request, response, next);
            } else {
                tier.requestHandler(request, response, next);
            }
        }
    }

    all() {
        var handlers = flatten(slice.call(arguments));

        for (var i = 0; i < handlers.length; i++) {
            var handler = handlers[i];

            if (typeof handler !== 'function') {
                var type = toString.call(handler);
                var msg = 'Route.all() requires callback functions but got a ' + type;
                throw new TypeError(msg);
            }

            var tier = new Tier('/', {}, handler);
            tier.method = undefined;

            this.methods._all = true;
            this.tiers.push(tier);
        }

        return this;
    }
}




methods.forEach(function(method) {
    Route.prototype[method] = function() {
        var handlers = flatten(slice.call(arguments));

        for (var i = 0; i < handlers.length; i++) {
            var handler = handlers[i];

            if (typeof handler !== 'function') {
                var type = toString.call(handler);
                var msg = 'Route.' + method + '() requires callback functions but got a ' + type;
                throw new Error(msg);
            }

            var tier = new Tier('/', {}, handler);
            tier.method = method;

            this.methods[method] = true;
            this.tiers.push(tier);
        }

        return this;
    };
});
