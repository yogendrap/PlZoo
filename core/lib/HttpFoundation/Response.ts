var contentDisposition = require('content-disposition');

var escapeHtml = require('escape-html');
var onFinished = require('on-finished');
var path = require('path');
var merge = require('utils-merge');
var cookie = require('cookie');
var send = require('send');
var sign = require('cookie-signature').sign;



var normalizeType = require('./utils').normalizeType;
var normalizeTypes = require('./utils').normalizeTypes;
var setCharset = require('./utils').setCharset;
var isAbsolute = require('./utils').isAbsolute;

var extname = path.extname;
var mime = send.mime;
var resolve = path.resolve


import {ServerResponse, IncomingMessage, STATUS_CODES} from 'http';


var charsetRegExp = /;\s*charset\s*=/;

export default class Response {
    public statusCode: number;
    constructor(public request: IncomingMessage, public response: ServerResponse) {

    }
    status(code: number) {
        this.statusCode = code;
        return this;
    }
    get(field: string) {
        return this.response.getHeader(field);
    }

    type(type) {
        var ct = type.indexOf('/') === -1
            ? mime.lookup(type)
            : type;

        return this.set('Content-Type', ct);
    }
    vary(filed) {

    }

    links(links) {
        var link = this.get('Link') || '';
        if (link) link += ', ';
        return this.set('Link', link + Object.keys(links).map(function(rel) {
            return '<' + links[rel] + '>; rel="' + rel + '"';
        }).join(', '));
    }

    sendStatus(statusCode) {
        var body = STATUS_CODES[statusCode] || String(statusCode);

        this.statusCode = statusCode;
        this.type('txt');

        return this.send(body);
    }
    set(field: any, val: any) {
        if (arguments.length === 2) {
            var value = Array.isArray(val)
                ? val.map(String)
                : String(val);

            // add charset to content-type
            if (field.toLowerCase() === 'content-type' && !charsetRegExp.test(value)) {
                var charset = mime.charsets.lookup(value.split(';')[0]);
                if (charset) value += '; charset=' + charset.toLowerCase();
            }

            this.set(field, value);
        } else {
            for (var key in field) {
                this.set(key, field[key]);
            }
        }
        return this;
    }

    attachment(filename) {
        if (filename) {
            this.type(extname(filename));
        }

        this.set('Content-Disposition', contentDisposition(filename));

        return this;
    }

    append(field, val) {
        var prev = this.get(field);
        var value = val;

        if (prev) {
            // concat the new and prev vals
            value = Array.isArray(prev) ? prev.concat(val)
                : Array.isArray(val) ? [prev].concat(val)
                    : [prev, val];
        }

        return this.set(field, value);
    }

    clearCookie(name, options) {
        var opts = merge({ expires: new Date(1), path: '/' }, options);

        return this.cookie(name, '', opts);
    }

    cookie(name, value, options) {
        var opts = merge({}, options);
        var secret = this.request.secret;
        var signed = opts.signed;

        if (signed && !secret) {
            throw new Error('cookieParser("secret") required for signed cookies');
        }

        var val = typeof value === 'object'
            ? 'j:' + JSON.stringify(value)
            : String(value);

        if (signed) {
            val = 's:' + sign(val, secret);
        }

        if ('maxAge' in opts) {
            opts.expires = new Date(Date.now() + opts.maxAge);
            opts.maxAge /= 1000;
        }

        if (opts.path == null) {
            opts.path = '/';
        }

        this.append('Set-Cookie', cookie.serialize(name, String(val), opts));

        return this;
    }

    location(url) {
        var loc = url;

        // "back" is an alias for the referrer
        if (url === 'back') {
            loc = this.request.get('Referrer') || '/';
        }

        // set location
        this.set('Location', loc);
        return this;
    }

    end(...args) {
        this.response.end(args);
    }
    /**
     * Send a response.
     *
     * Examples:
     *
     *     res.send(new Buffer('wahoo'));
     *     res.send({ some: 'json' });
     *     res.send('<p>some html</p>');
     *
     * @param {string|number|boolean|object|Buffer} body
     * @public
     */
    send(body: any) {
        var chunk = body;
        var encoding;
        var len;
        var req = this.request;
        var type;

        switch (typeof chunk) {
            // string defaulting to html
            case 'string':
                if (!this.get('Content-Type')) {
                    this.type('html');
                }
                break;
            case 'boolean':
            case 'number':
            case 'object':
                if (chunk === null) {
                    chunk = '';
                } else if (Buffer.isBuffer(chunk)) {
                    if (!this.get('Content-Type')) {
                        this.type('bin');
                    }
                } else {
                    return this.json(chunk);
                }
                break;
        }

        // write strings in utf-8
        if (typeof chunk === 'string') {
            encoding = 'utf8';
            type = this.get('Content-Type');

            // reflect this in content-type
            if (typeof type === 'string') {
                this.set('Content-Type', setCharset(type, 'utf-8'));
            }
        }

        // populate Content-Length
        if (chunk !== undefined) {
            if (!Buffer.isBuffer(chunk)) {
                // convert chunk to Buffer; saves later double conversions
                chunk = new Buffer(chunk, encoding);
                encoding = undefined;
            }

            len = chunk.length;
            this.set('Content-Length', len);
        }

        // populate ETag
        // var etag;
        // var generateETag = len !== undefined;
        // if (typeof generateETag === 'function' && !this.get('ETag')) {
        //     if ((etag = generateETag(chunk, encoding))) {
        //         this.set('ETag', etag);
        //     }
        // }

        // freshness
        if (req.fresh) this.statusCode = 304;

        // strip irrelevant headers
        if (204 == this.statusCode || 304 == this.statusCode) {
            this.response.removeHeader('Content-Type');
            this.response.removeHeader('Content-Length');
            this.response.removeHeader('Transfer-Encoding');
            chunk = '';
        }

        if (req.method === 'HEAD') {
            // skip body for HEAD
            this.end();
        } else {
            // respond
            this.end(chunk, encoding);
        }

        return this;
    }
    json(obj: Object, replacer?: any[], spaces?: string | number) {
        var body = JSON.stringify(obj, replacer, spaces);
        // content-type
        if (!this.get('Content-Type')) {
            this.set('Content-Type', 'application/json');
        }
        return this.send(body);
    }
    sendFile(path, options, callback) {
        var done = callback;
        var req = this.request;
        var res = this;
        var next = request.next;
        var opts = options || {};

        if (!path) {
            throw new TypeError('path argument is required to res.sendFile');
        }

        // support function as second arg
        if (typeof options === 'function') {
            done = options;
            opts = {};
        }

        if (!opts.root && !isAbsolute(path)) {
            throw new TypeError('path must be absolute or specify root to res.sendFile');
        }

        // create file stream
        var pathname = encodeURI(path);
        var file = send(req, pathname, opts);

        // transfer
        sendfile(res, file, opts, function(err) {
            if (done) return done(err);
            if (err && err.code === 'EISDIR') return next();

            // next() all but write errors
            if (err && err.code !== 'ECONNABORTED' && err.syscall !== 'write') {
                next(err);
            }
        });
    }

    redirect(url) {
        var address = url;
        var body;
        var status = 302;

        // Set location header
        this.location(address);
        address = this.get('Location');

        // Support text/{plain,html} by default
        this.format({
            text: function() {
                body = STATUS_CODES[status] + '. Redirecting to ' + encodeURI(address);
            },

            html: function() {
                var u = escapeHtml(address);
                body = '<p>' + STATUS_CODES[status] + '. Redirecting to <a href="' + u + '">' + u + '</a></p>';
            },

            default: function() {
                body = '';
            }
        });

        // Respond
        this.statusCode = status;
        this.set('Content-Length', Buffer.byteLength(body));

        if (this.request.method === 'HEAD') {
            this.end();
        } else {
            this.end(body);
        }
    }

    download(path, filename, callback) {
        var done = callback;
        var name = filename;

        // support function as second arg
        if (typeof filename === 'function') {
            done = filename;
            name = null;
        }

        // set Content-Disposition when file is sent
        var headers = {
            'Content-Disposition': contentDisposition(name || path)
        };

        // Resolve the full path for sendFile
        var fullPath = resolve(path);

        return this.sendFile(fullPath, { headers: headers }, done);
    }



    format(obj) {
        var req = this.request;
        var next = req.next;

        var fn = obj.default;
        if (fn) delete obj.default;
        var keys = Object.keys(obj);

        var key = keys.length > 0
            ? req.accepts(keys)
            : false;

        this.vary("Accept");

        if (key) {
            this.set('Content-Type', normalizeType(key).value);
            obj[key](req, this, next);
        } else if (fn) {
            fn();
        } else {
            var err = new Error('Not Acceptable');
            err.status = err.statusCode = 406;
            err.types = normalizeTypes(keys).map(function(o) { return o.value });
            next(err);
        }

        return this;
    }


}




// pipe the send file stream
function sendfile(res, file, options, callback) {
    var done = false;
    var streaming;

    // request aborted
    function onaborted() {
        if (done) return;
        done = true;

        var err = new Error('Request aborted');
        err.code = 'ECONNABORTED';
        callback(err);
    }

    // directory
    function ondirectory() {
        if (done) return;
        done = true;

        var err = new Error('EISDIR, read');
        err.code = 'EISDIR';
        callback(err);
    }

    // errors
    function onerror(err) {
        if (done) return;
        done = true;
        callback(err);
    }

    // ended
    function onend() {
        if (done) return;
        done = true;
        callback();
    }

    // file
    function onfile() {
        streaming = false;
    }

    // finished
    function onfinish(err) {
        if (err && err.code === 'ECONNRESET') return onaborted();
        if (err) return onerror(err);
        if (done) return;

        setImmediate(function() {
            if (streaming !== false && !done) {
                onaborted();
                return;
            }

            if (done) return;
            done = true;
            callback();
        });
    }

    // streaming
    function onstream() {
        streaming = true;
    }

    file.on('directory', ondirectory);
    file.on('end', onend);
    file.on('error', onerror);
    file.on('file', onfile);
    file.on('stream', onstream);
    onFinished(res, onfinish);

    if (options.headers) {
        // set headers on successful transfer
        file.on('headers', function headers(res) {
            var obj = options.headers;
            var keys = Object.keys(obj);

            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                res.setHeader(k, obj[k]);
            }
        });
    }

    // pipe
    file.pipe(res);
}