require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { URL } = require('url');
const app = express();
const urlDatabase = require('./collection/urlDatabase');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


// solution for project
function generateShortUrl() {
  return Math.random().toString(36).substr(2, 7); // Example: Generate a random 7-character string
}

app.post('/api/shorturl',(req,res)=>{
  var given_url= req.body.url;
  var short_code= generateShortUrl();
  const urlRegex = /^(http|https):\/\/[^ "]+$/;

  if (!urlRegex.test(given_url)) {
    return res.json({ error: 'Invalid URL' });
  }

  try {
    const urlObject = new URL(given_url);
    if (!urlObject.hostname) {
      return res.json({ error: 'Invalid Hostname' });
    }

    const entry = { url: given_url, code: short_code };
    urlDatabase.push(entry);

    res.json({ original_url: given_url, short_url: short_code });
  } catch (error) {
    return res.json({ error: 'Invalid URL' });
  }
})

// shortened url
app.get('/api/shorturl/:shortUrl',(req,res)=>{
  const shortUrl = req.params.shortUrl; 
  const entry = urlDatabase.find(entry => entry.code === shortUrl);
  if (entry && entry.url) {
    res.redirect(entry.url); 
  } else {
    res.status(404).json({ error: 'Shortened URL not found' }); 
  }
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
