const define = (name, value) => {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

define("DOMAIN_REQUEST_ADDRESS", "http://www.radiojavan.com/mp3s/mp3_host");
