var has = require("lodash/has");
var axios = require('axios');
var Crawler = require("crawler");
var constant = require("../constant");


const patterns = {
    type: {
        music: /(.)+(mp3)(.)+/g,
        video: /(.)+(video)(.)+/g,
        podcast: /(.)+(podcast)(.)+/g
    },
    file: {
        mp3: {
            currentMP3Url: /(RJ(.){1}currentMP3Url(\s=\s'))(.*)(';)/gm,
            currentMP3Type: /(RJ(.){1}currentMP3Type(\s=\s'))(.*)(';)/gm,
            currentMP3Perm: /(RJ(.){1}currentMP3Perm(\s=\s'))(.*)(';)/gm,
        },
        video: {
            video4k: /(RJ(.){1}video4k(\s=\s'))(.*)(';)/gm,
            video1080p: /(RJ(.){1}video1080p(\s=\s'))(.*)(';)/gm,
            video720p: /(RJ(.){1}video720p(\s=\s'))(.*)(';)/gm,
            video480p: /(RJ(.){1}video480p(\s=\s'))(.*)(';)/gm,
            videoPermlink: /(RJ(.){1}videoPermlink(\s=\s'))(.*)(';)/gm
        },
        podcast: {
            currentMP3Url: /(RJ(.){1}currentMP3Url(\s=\s'))(.*)(';)/gm,
            currentMP3Type: /(RJ(.){1}currentMP3Type(\s=\s'))(.*)(';)/gm,
            currentMP3Perm: /(RJ(.){1}currentMP3Perm(\s=\s'))(.*)(';)/g,
        }
    }
}


let self = null;

const detectType = () => {
    var type = self.type;

    switch (true) {
        case patterns.type.music.test(self.url):
            type = "music"
            break;
        case patterns.type.video.test(self.url):
            type = "video"
            break;
        case patterns.type.podcast.test(self.url):
            type = "podcast"
            break;
        default:
            type = "unknown"
            break;
    }

    self.type = type;

}


const resolveFindFilePath = () => {
    return new Promise(resolve => {
        axios.get(self.url)
            .then(function (response) {
                // handle success
                // console.log(response.data);

                var body = response.data;

                switch (self.type) {
                    case "music":

                        let currentMP3Url = body,
                            currentMP3Type = body,
                            currentMP3Perm = body;

                        if (currentMP3Url.match(patterns.file.mp3.currentMP3Url)) {
                            currentMP3Url.replace(patterns.file.mp3.currentMP3Url, function (match, g1, g2, g3, g4) {
                                currentMP3Url = g4;
                            });
                        }

                        if (currentMP3Type.match(patterns.file.mp3.currentMP3Type)) {
                            currentMP3Type.replace(patterns.file.mp3.currentMP3Type, function (match, g1, g2, g3, g4) {
                                currentMP3Type = g4;
                            });
                        }

                        if (currentMP3Perm.match(patterns.file.mp3.currentMP3Perm)) {
                            currentMP3Perm.replace(patterns.file.mp3.currentMP3Perm, function (match, g1, g2, g3, g4) {
                                currentMP3Perm = g4;
                            });
                        }

                        self.key = currentMP3Perm;
                        self.filePath = "/media/" + currentMP3Url + "." + currentMP3Type;

                        break;
                    case "video":
                        let video480p = body,
                            video720p = body,
                            video1080p = body,
                            video4k = body,
                            videoPermlink = body;

                        if (video480p.match(patterns.file.video.video480p)) {
                            video480p.replace(patterns.file.video.video480p, function (match, g1, g2, g3, g4) {
                                video480p = g4;
                            });
                        }

                        if (video720p.match(patterns.file.video.video720p)) {
                            video720p.replace(patterns.file.video.video480p, function (match, g1, g2, g3, g4) {
                                video720p = g4;
                            });
                        }

                        if (video1080p.match(patterns.file.video.video1080p)) {
                            video1080p.replace(patterns.file.video.video1080p, function (match, g1, g2, g3, g4) {
                                video1080p = g4;
                            });
                        }

                        if (video4k.match(patterns.file.video.video4k)) {
                            video4k.replace(patterns.file.video.video4k, function (match, g1, g2, g3, g4) {
                                video4k = g4;
                            });
                        }

                        if (videoPermlink.match(patterns.file.video.videoPermlink)) {
                            videoPermlink.replace(patterns.file.video.videoPermlink, function (match, g1, g2, g3, g4) {
                                videoPermlink = g4;
                            });
                        }

                        self.key = videoPermlink;
                        self.filePath = video1080p;

                        break;
                    case "podcast":
                        let currentPodcastUrl = body,
                            currentPodcastType = body,
                            currentPodcastPerm = body;

                        if (currentPodcastUrl.match(patterns.file.podcast.currentMP3Url)) {
                            currentPodcastUrl.replace(patterns.file.podcast.currentMP3Url, function (match, g1, g2, g3, g4) {
                                currentPodcastUrl = g4;
                            });
                        }

                        if (currentPodcastType.match(patterns.file.podcast.currentMP3Type)) {
                            currentPodcastType.replace(patterns.file.podcast.currentMP3Type, function (match, g1, g2, g3, g4) {
                                currentPodcastType = g4;
                            });
                        }

                        if (currentPodcastPerm.match(patterns.file.podcast.currentMP3Perm)) {
                            currentPodcastPerm.replace(patterns.file.podcast.currentMP3Perm, function (match, g1, g2, g3, g4) {
                                currentPodcastPerm = g4;
                            });
                        }

                        self.key = currentPodcastPerm;
                        console.log("Here", self.key)
                        self.filePath = "/media/" + currentPodcastUrl + ".mp3";
                        break;
                    default:
                        break;
                }

                resolve(self.filePath);

            })
            .catch(function (error) {
                resolve("error");
            })
    });
}



const resolveFindDomain = () => {
    return new Promise(resolve => {
        let url = "";

        switch (self.type) {
            case "mp3":
                url = constant.MP3_DOMAIN_REQUEST_ADDRESS;
                break;
            case "video":
                url = constant.VIDEO_DOMAIN_REQUEST_ADDRESS;
                break;
            case "podcast":
                url = constant.PODCAST_DOMAIN_REQUEST_ADDRESS;
                break;
            default:
                url = constant.MP3_DOMAIN_REQUEST_ADDRESS;
                break;
        }


        console.log(url)
        // console.log(self.key)

        axios.get(url, {
                params: {
                    id: self.key
                }
            }).then(function (response) {
                if (has(response, "data") && has(response.data, "host")) {
                    self.host = response.data.host;
                    resolve(self.host)
                } else {
                    self.host = "";
                    resolve("error")
                }
            })
            .catch(function (error) {
                resolve("error");
            })

    });
}

class RadioJavan {
    constructor(params) {
        this.url = params.url;
        this.type = "unknown";
        this.downloadLink = "";
        this.filePath = "/";
        this.key = "";
        this.downloadLink = "";

        self = this;
    }

    async getFilePath() {
        detectType();
        var x = await resolveFindFilePath();
        return x;
    }

    async getDomain() {
        var x = await resolveFindDomain();
        return x;
    }
}



module.exports = RadioJavan;