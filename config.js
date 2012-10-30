var config = {
    debug: true,
    mountPoint: "",
    debugUser: {
        "token": "1234567890abcdef",
        "secret": "1234567890abcdef",
        "id": "1234567890abcdef",
        "data": {
            "id": "1234567890abcdef",
            "name": "developer"
        },
        "service": "debug"
    },
    identityProviders: [{
        service: "github",
        id: "1234567890abcdef",
        secret: "1234567890abcdef"
    }, {
        service: "google",
        id: "1234567890abcdef",
        secret: "1234567890abcdef"
    }, {
        service: "twitter",
        id: "1234567890abcdef",
        secret: "1234567890abcdef"
    }]
};

module.exports = config;