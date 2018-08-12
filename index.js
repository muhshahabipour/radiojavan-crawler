// const express = require('../../../../.cache/typescript/2.9/node_modules/@types/express')
// const bodyParser = require('../../../../.cache/typescript/2.9/node_modules/@types/body-parser');
const express = require('express')
const bodyParser = require('body-parser');
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

  var url = req.body.url;

  var radioJavan = new RadioJavan({
    url: url
  });

  var filePath = await radioJavan.getFilePath();
  console.warn("[filePath] ===>", filePath);

  var domain = await radioJavan.getDomain();
  console.warn("[domain] ===>", domain);


  var poster = "";
  if (radioJavan.type !== "video") {
    poster = await radioJavan.getFilePoster();
    // console.warn("[poster] ===>", poster);
  }


  if (domain !== "error" && filePath !== "error") {
    downloadLink = domain + filePath;

  }



  res.render("fetch", {
    downloadLink: downloadLink && downloadLink.length ? downloadLink : "not found!",
    src: poster && poster.length ? poster : ""
  });

});


// Bind the app to a specified port
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Listening on port " + port);