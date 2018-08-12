// const express = require('../../../../.cache/typescript/2.9/node_modules/@types/express')
// const bodyParser = require('../../../../.cache/typescript/2.9/node_modules/@types/body-parser');
const express = require('express')
const bodyParser = require('body-parser');
const jsmediatags = require("jsmediatags");
const path = require("path");
const RadioJavan = require('./js/modules/RadioJavan');

const app = express();

app.use('/node_modules', express.static('node_modules'))

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
})); // support encoded bodies

app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + "/views");

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/fetch', function (req, res) {
  res.redirect('/');
});

app.post('/fetch', async function (req, res) {
  let downloadLink = "";
  let base64String = "";

  var url = req.body.url;

  var radioJavan = new RadioJavan({
    url: url
  });

  var filePath = await radioJavan.getFilePath();
  console.warn("[filePath] ===>", filePath);

  var domain = await radioJavan.getDomain();
  console.warn("[domain] ===>", domain);

  if (domain !== "error" && filePath !== "error") {
    downloadLink = domain + filePath;

    new jsmediatags.Reader(downloadLink)
      .read({
        onSuccess: function (tag) {
          console.log(tag);

          var image = tag.picture;
          if (image) {
            for (var i = 0; i < image.data.length; i++) {
                base64String += String.fromCharCode(image.data[i]);
            }
            var base64 = "data:" + image.format + ";base64," +
                    window.btoa(base64String);
            // document.getElementById('picture').setAttribute('src',base64);
          } else {
            // document.getElementById('picture').style.display = "none";
          }


        },
        onError: function (error) {
          console.log(':(', error.type, error.info);
        }
      });
  }



  res.render("fetch", {
    downloadLink: downloadLink && downloadLink.length ? downloadLink : "not found!",
    src: base64String && base64String.length ? base64String : ""
  });

});


// Bind the app to a specified port
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Listening on port " + port);