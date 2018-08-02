const express = require('express')
const Crawler = require("crawler");
const fs = require('fs');
const axios = require('axios');

const app = express()

// app.get('/', (req, res) => res.send('Hello World!'))
app.get('/', function (req, res) {


  var c = new Crawler({
    maxConnections: 10,
    skipDuplicates: false,
    // This will be called for each crawled page
    callback: function (error, res, done) {
      if (error) {
        console.log(error);
      } else {
        var $ = res.$;

        // console.log(res.body);

        const body = res.body;
        let currentMP3Url = body,
          currentMP3Type = body,
          currentMP3Perm = body;
        const currentMP3UrlPattern = /(RJ(.){1}currentMP3Url(\s=\s'))(.*)(';)/gm,
          currentMP3TypePattern = /(RJ(.){1}currentMP3Type(\s=\s'))(.*)(';)/gm,
          currentMP3PermPattern = /(RJ(.){1}currentMP3Perm(\s=\s'))(.*)(';)/gm;


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

        console.log("\r\n");
        console.log("===============================================\r\n");
        console.log("currentMP3Perm : " + currentMP3Perm + "\r\n");
        console.log("file path : /media/" + currentMP3Url + "." + currentMP3Type + "\r\n");
        console.log("===============================================\r\n");

        /*
        RJ.currentMP3Url = 'mp3/mp3-256/Sasy-Che-Pesari';
        RJ.currentMP3 = '83611';
        RJ.currentMP3Type = 'mp3';
        RJ.playingIndex = '0';
        RJ.currentMP3Perm = 'Sasy-Che-Pesari';
        */

        // console.log($("title").text());
      }
      done();
    }
  });

  // Queue just one URL, with default callback
  c.queue([{
    uri: 'https://www.radiojavan.com/mp3s/mp3/Sasy-Che-Pesari'
  }]);

  // https://host2.rjmusicmedia.com/media/mp3/mp3-256/Sasy-Che-Pesari.mp3

  res.send("Hello World")

})

app.get('/domain', function (req, res) {
  // url: 'http://www.radiojavan.com/mp3s/mp3_host&id=Sasy-Che-Pesari',
  // url: 'http://jsonplaceholder.typicode.com/posts',

  axios.get("http://www.radiojavan.com/mp3s/mp3_host", {
      params: {
        id: "Sasy-Che-Pesari"
      },
      timeout: 35000
    })
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });

  res.send("domain")
})

app.listen(80, () => console.log('Example app listening on port 80!'))