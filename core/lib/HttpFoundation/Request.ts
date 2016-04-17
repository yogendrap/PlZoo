var accepts = require('accepts');
var deprecate = require('depd')('express');
var isIP = require('net').isIP;
var typeis = require('type-is');
var http = require('http');
var fresh = require('fresh');
var parseRange = require('range-parser');
var parse = require('parseurl');
var proxyaddr = require('proxy-addr');


import {IncomingMessage, ServerResponse} from 'http';


export default class Request {
    constructor(public request: IncomingMessage, public response: ServerResponse) {

    }

    get protocol() {
        var proto = this.request.connection.encrypted
            ? 'https'
            : 'http';

        // Note: X-Forwarded-Proto is normally only ever a
        //       single value, but this is to be safe.
        proto = this.get('X-Forwarded-Proto') || proto;
        return proto.split(/\s*,\s*/)[0];
    }

    get secure() {
        return this.protocol === 'https';
    }

    get ip() {
        return proxyaddr(this.request);
    }

    get ips() {
        var addrs = proxyaddr.all(this.request);
        return addrs.slice(1).reverse();
    }

    get subdomains() {
        var hostname = this.hostname;

        if (!hostname) return [];

        var subdomains = !isIP(hostname)
            ? hostname.split('.').reverse()
            : [hostname];

        return subdomains;
    }
    get path() {
        return parse(this.request).pathname;
    }

    get hostname() {
        var host = this.get('X-Forwarded-Host');

        if (!host) {
            host = this.get('Host');
        }

        if (!host) return;

        // IPv6 literal support
        var offset = host[0] === '['
            ? host.indexOf(']') + 1
            : 0;
        var index = host.indexOf(':', offset);

        return index !== -1
            ? host.substring(0, index)
            : host;
    }

    get fresh() {
        var method = this.request.method;
        var s = this.response.statusCode;

        // GET or HEAD for weak freshness validation only
        if ('GET' != method && 'HEAD' != method) return false;

        // 2xx or 304 as per rfc2616 14.26
        if ((s >= 200 && s < 300) || 304 == s) {
            return fresh(this.request.headers, (this.response._headers || {}));
        }

        return false;
    }

    get slate() {
        return !this.fresh;
    }
    get xhr() {
        var val = this.get('X-Requested-With') || '';
        return val.toLowerCase() === 'xmlhttprequest';
    }
    get(name) {
        var lc = name.toLowerCase();

        switch (lc) {
            case 'referer':
            case 'referrer':
                return this.request.headers.referrer
                    || this.request.headers.referer;
            default:
                return this.request.headers[lc];
        }
    }

    param(name, defaultValue) {
        var params = this.request.params || {};
        var body = this.request.body || {};
        var query = this.request.query || {};

        if (null != params[name] && params.hasOwnProperty(name)) return params[name];
        if (null != body[name]) return body[name];
        if (null != query[name]) return query[name];

        return defaultValue;
    }

    is(types) {
        var arr = types;

        // support flattened arguments
        if (!Array.isArray(types)) {
            arr = new Array(arguments.length);
            for (var i = 0; i < arr.length; i++) {
                arr[i] = arguments[i];
            }
        }

        return typeis(this.request, arr);
    }


}