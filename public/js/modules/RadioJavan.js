var has = require("lodash/has");
var axios = require('axios');
const jsmediatags = require("jsmediatags");
const btoa = require("btoa");
var constant = require("../constant");


const patterns = {
    type: {
        music: /(.)+(mp3)(.)+/g,
        album: /(.)+(album)(.)+/g,
        video: /(.)+(video)(.)+/g,
        podcast: /(.)+(podcast)(.)+/g
    },
    file: {
        album: {
            currentMP3Url: /(RJ(.){1}currentMP3Url(\s=\s'))(.*)(';)/gm,
            currentMP3Type: /(RJ(.){1}currentMP3Type(\s=\s'))(.*)(';)/gm,
            currentMP3Perm: /(RJ(.){1}currentMP3Perm(\s=\s'))(.*)(';)/gm,
            currentMP3Related: /(RJ(.){1}relatedMP3(\s=\s))(\[.*\])(;)/gm
        },
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
            videoPermlink: /(RJ(.){1}videoPermlink(\s=\s'))(.*)(';)/gm,
            title: /<(title|TITLE)[^>]*>\s*(.*?)\sVideo\s-\sRadioJavan.com\s*<\/(title|TITLE)>/gm
        },
        podcast: {
            currentMP3Url: /(RJ(.){1}currentMP3Url(\s=\s'))(.*)(';)/gm,
            currentMP3Type: /(RJ(.){1}currentMP3Type(\s=\s'))(.*)(';)/gm,
            currentMP3Perm: /(RJ(.){1}currentMP3Perm(\s=\s'))(.*)(';)/g,
        }
    }
}


let self = null;

const detectType = (text) => {

    // console.log(text);

    if ((text).match((patterns.type.album)) != null)
        self.type = "album"
    else if ((text).match((patterns.type.music)) != null)
        self.type = "music"
    else if ((text).match((patterns.type.video)) != null)
        self.type = "video"
    else if ((text).match((patterns.type.podcast)) != null)
        self.type = "podcast"
    else
        self.type = "unknown"

    return self.type;
}

const resolveFindFilePath = () => {
    return new Promise(resolve => {
        axios.get(self.url, {
                responseType: 'text',
            })
            .then(function (response) {
                // handle success
                // console.log(response.data);

                var body = response.data;
                let bodyClone = body.replace(/\n/g, ' ').replace(/\s/g, '');
                bodyClone = bodyClone.substr(bodyClone.indexOf('<metaproperty="og:url"content="') + 31)
                detectType(bodyClone.substr(0, bodyClone.indexOf('"/>')))

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
                        self.filePaths.push({
                            link: "/media/" + currentMP3Url + "." + currentMP3Type,
                            title: ""
                        });

                        break;
                    case "album":

                        // console.log(body)

                        let currentAlbumMP3Url = body,
                            currentAlbumMP3Type = body,
                            currentAlbumMP3Perm = body,
                            currentAlbumMP3Related = body;

                        if (currentAlbumMP3Url.match(patterns.file.album.currentMP3Url)) {
                            currentAlbumMP3Url.replace(patterns.file.album.currentMP3Url, function (match, g1, g2, g3, g4) {
                                currentAlbumMP3Url = g4;
                            });
                        }

                        if (currentAlbumMP3Type.match(patterns.file.album.currentMP3Type)) {
                            currentAlbumMP3Type.replace(patterns.file.album.currentMP3Type, function (match, g1, g2, g3, g4) {
                                currentAlbumMP3Type = g4;
                            });
                        }

                        if (currentAlbumMP3Perm.match(patterns.file.album.currentMP3Perm)) {
                            currentAlbumMP3Perm.replace(patterns.file.album.currentMP3Perm, function (match, g1, g2, g3, g4) {
                                currentAlbumMP3Perm = g4;
                            });
                        }

                        if (currentAlbumMP3Related.match(patterns.file.album.currentMP3Related)) {
                            currentAlbumMP3Related.replace(patterns.file.album.currentMP3Related, function (match, g1, g2, g3, g4) {
                                currentAlbumMP3Related = g4;
                            });
                        }



                        self.key = currentAlbumMP3Perm;
                        if (currentAlbumMP3Related.length) {
                            const files = JSON.parse(currentAlbumMP3Related);
                            const basePathLink = currentAlbumMP3Url.replace(currentAlbumMP3Perm, "");
                            files.forEach(function (element) {
                                self.filePaths.push({
                                    link: "/media/" + basePathLink + element.mp3 + ".mp3",
                                    title: ""
                                });
                            });

                        }

                        break;
                    case "video":
                        let videoTitle = body,
                            video480p = body,
                            video720p = body,
                            video1080p = body,
                            video4k = body,
                            videoPermlink = body;

                        if (videoTitle.match(patterns.file.video.title)) {
                            videoTitle.replace(patterns.file.video.title, function (match, g1, g2, g3) {
                                videoTitle = g2;
                            });
                        }

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

                        // console.log(videoTitle);

                        self.key = videoPermlink;
                        self.filePaths.push({
                            link: video1080p,
                            title: videoTitle,
                            quality: "1080p"
                        });
                        // self.filePaths.push({link: video4k, title: title, quality: "4K"});
                        self.filePaths.push({
                            link: video720p,
                            title: videoTitle,
                            quality: "720p"
                        });
                        self.filePaths.push({
                            link: video480p,
                            title: videoTitle,
                            quality: "480p"
                        });

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
                        // console.log("Here", self.key)
                        self.filePaths.push({
                            link: "/media/" + currentPodcastUrl + ".mp3",
                            title: ""
                        });
                        break;
                    default:
                        break;
                }

                resolve(self.filePaths);

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
            case "album":
                url = constant.ALBUM_DOMAIN_REQUEST_ADDRESS;
                break;
            default:
                url = constant.MP3_DOMAIN_REQUEST_ADDRESS;
                break;
        }


        // console.log(url)
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

const resolveFileDetail = (address) => {
    let base64 = "",
        base64String = "";

    return new Promise(resolve => {

        new jsmediatags.Reader(address)
            .setTagsToRead(["picture", "title", "artist", "album"])
            .read({
                onSuccess: function (response) {
                    // console.log(response.tags.artist + " - " + response.tags.title);

                    var image = response.tags.picture;
                    if (image) {
                        for (var i = 0; i < image.data.length; i++) {
                            base64String += String.fromCharCode(image.data[i]);
                        }
                        base64 = "data:" + image.format + ";base64," +
                            btoa(base64String);
                        resolve({
                            title: response.tags.artist + " - " + response.tags.title,
                            album: response.tags.album,
                            cover: base64,
                            type: self.type
                        })
                    } else {
                        resolve({
                            title: "",
                            album: "",
                            cover: "",
                            type: ""
                        })
                    }


                },
                onError: function (error) {
                    // console.log(':(', error.type, error.info);
                    resolve({
                        title: "",
                        album: "",
                        cover: "",
                        type: ""
                    })
                }
            });

    });
}

const resolveVideoDetail = (address) => {
    let base64 = "",
        base64String = "";

    return new Promise(resolve => {

        new jsmediatags.Reader(address)
            .read({
                onSuccess: (tag) => {
                    // console.log('Success!', tag);
                    resolve({});
                },
                onError: (error) => {
                    console.log('Error');
                    reject({});
                }
            });
    });
}




class RadioJavan {
    constructor(params) {
        this.url = params.url;
        this.type = "unknown";
        this.filePaths = [];
        this.host = "";
        this.key = "";

        self = this;
    }

    async getFilePath() {
        // detectType();
        var x = await resolveFindFilePath();
        return x;
    }

    async getDomain() {
        var x = await resolveFindDomain();
        return x;
    }

    async getFileDetail(address) {
        var x = await resolveFileDetail(address);
        return x;
    }

    async getVideoDetail(address) {
        var x = await resolveVideoDetail(address);
        return x;
    }
}



module.exports = RadioJavan;