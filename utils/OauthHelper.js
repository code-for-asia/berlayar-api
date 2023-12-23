const crypto = require('crypto');
const oauth1a = require('oauth-1.0a');

const CONSUMERKEY = 'TkQmENluGw5MXH1txuJM6Lm2J';
const CONSUMERSECRET = 'Fcv0M5odXFwQLS63aDiINp32OTIkIsUXv88MWiTA5AzYqTCjsJ';
const TOKENKEY = '1506602378296197133-YFUh141JT2Oep7WaS49j6xs9SwDVnP';
const TOKENSECRET = 'xPUQkV9uRz3e5tEaJPbhjL2LN2bcdiYhb6nvrU5pSIfXb';

class Oauth1Helper {
    static getAuthHeaderForRequest(request) {
        const oauth = oauth1a({
            consumer: { key: CONSUMERKEY, secret: CONSUMERSECRET },
            signature_method: 'HMAC-SHA1',
            hash_function(base_string, key) {
                return crypto
                    .createHmac('sha1', key)
                    .update(base_string)
                    .digest('base64')
            },
        })

        const authorization = oauth.authorize(request, {
            key: TOKENKEY,
            secret: TOKENSECRET,
        });

        return oauth.toHeader(authorization);
    }
}

module.exports = Oauth1Helper;