const define = (name, value) => {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

define("MP3_DOMAIN_REQUEST_ADDRESS",        "http://www.radiojavan.com/mp3s/mp3_host");
define("VIDEO_DOMAIN_REQUEST_ADDRESS",      "http://www.radiojavan.com/videos/video_host");
define("PODCAST_DOMAIN_REQUEST_ADDRESS",    "http://www.radiojavan.com/podcasts/podcast_host");
