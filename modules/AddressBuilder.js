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

        }
    }
}


getHost = async (id) => {
    return await axios.get(constant.DOMAIN_REQUEST_ADDRESS, {
        params: {
            id: id || "Sasy-Che-Pesari"
        },
        timeout: 35000
    })
}

class AddressBuilder {

    constructor(build) {
        this.url = build.url;
    }

    static get Builder() {
        class Builder {
            constructor(url) {
                this.url = url;
                this.type = "unknown";
                this.downloadLink = "";
            }

            detectType() {
                var type = this.type;

                switch (true) {
                    case patterns.type.music.test(this.url):
                        type = "music"
                        break;
                    case patterns.type.video.test(this.url):
                        type = "video"
                        break;
                    case patterns.type.podcast.test(this.url):
                        type = "podcast"
                        break;
                    default:
                        type = "unknown"
                        break;
                }

                this.type = type;
                return this;
            }

            async crawler() {

                let filePath = "/";
                let key = "";


                var c = new Crawler({
                    maxConnections: 10,
                    skipDuplicates: false,
                    // This will be called for each crawled page
                    callback: async function (error, res, done) {
                        if (error) {
                            console.log(error);
                            return "not found."
                        } else {
                            var $ = res.$;
                            const body = res.body;

                            // console.log(body);


                            switch (this.type) {
                                case "music":

                                    let currentMP3Url = body,
                                        currentMP3Type = body,
                                        currentMP3Perm = body;

                                    if (currentMP3Url.match(currentMP3UrlPattern)) {
                                        currentMP3Url.replace(currentMP3UrlPattern, function (match, g1, g2, g3, g4) {
                                            currentMP3Url = g4;
                                        });
                                    }

                                    if (currentMP3Type.match(currentMP3TypePattern)) {
                                        currentMP3Type.replace(currentMP3TypePattern, function (match, g1, g2, g3, g4) {
                                            currentMP3Type = g4;
                                        });
                                    }

                                    if (currentMP3Perm.match(currentMP3PermPattern)) {
                                        currentMP3Perm.replace(currentMP3PermPattern, function (match, g1, g2, g3, g4) {
                                            currentMP3Perm = g4;
                                        });
                                    }

                                    key = currentMP3Perm;
                                    filePath = +"/media/" + currentMP3Url + "." + currentMP3Type;

                                    break;
                                case "video":
                                    let video480p = body,
                                        video720p = body,
                                        video1080p = body,
                                        video4k = body,
                                        videoPermlink = body;

                                    if (video480p.match(video480pPattern)) {
                                        video480p.replace(video480pPattern, function (match, g1, g2, g3, g4) {
                                            video480p = g4;
                                        });
                                    }

                                    if (video720p.match(video720pPattern)) {
                                        video720p.replace(video480pPattern, function (match, g1, g2, g3, g4) {
                                            video720p = g4;
                                        });
                                    }

                                    if (video1080p.match(video1080pPattern)) {
                                        video1080p.replace(video1080pPattern, function (match, g1, g2, g3, g4) {
                                            video1080p = g4;
                                        });
                                    }

                                    if (video4k.match(video4kPattern)) {
                                        video4k.replace(video4kPattern, function (match, g1, g2, g3, g4) {
                                            video4k = g4;
                                        });
                                    }

                                    if (videoPermlink.match(videoPermlinkPattern)) {
                                        videoPermlink.replace(videoPermlinkPattern, function (match, g1, g2, g3, g4) {
                                            videoPermlink = g4;
                                        });
                                    }

                                    key = videoPermlink;
                                    filePath = +"/media/" + video1080p;

                                    break;
                                case "podcast":


                                    break;
                                default:


                                    break;
                            }
                            this.downloadLink = await getHost(key).then(function (response) {

                                    if (has(response, "data") && has(response.data, "host")) {
                                        return response.data.host + filePath;
                                    } else {

                                        return ("");
                                    }
                                })
                                .catch(function (error) {
                                    console.error(error);
                                    return ("");
                                });

                            // console.log($("title").text());
                        }
                        done();
                    }
                });

                // Queue just one URL, with default callback
                await c.queue([{
                    uri: this.url
                }]);

                return this;
            }

            getDownloadLink() {
                console.log(this.downloadLink)
                return this.downloadLink;

            }

            build() {
                return new AddressBuilder(this);
            }
        }
        return Builder;
    }

}



module.exports = AddressBuilder;