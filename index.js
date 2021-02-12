const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require("express-rate-limit");
const cors = require('cors');

require('dotenv').config();

// define rate limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many search requests from this IP. Please try again in 20 minutes"
  });

const app = express();

// apply rate limit to search route
app.use('/search', limiter);

// cors
app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.post('/search', (req, res) => {
    const { queryTerm, facets, filters } = req.body;
    var SiteSearchClient = require("@elastic/site-search-node");
    var client = new SiteSearchClient({
        apiKey: process.env.SWIFT_API_KEY
    });
    
    client.search(
        {
            engine: process.env.SWIFT_ENGINE_NAME,
            q: queryTerm || null,
            filters: {
                page: filters || null
            },
            facets: {
                page: facets || null
            }
        },
        function (err, data) {
            const searchResult = {
                records: data.records,
                facets: data.info.page.facets
            }
            res.send(searchResult);
        }
    );
})

app.get('/', (req, res) => {
    res.send('UNITED LEX UTILITY SERVER')
})


app.listen(process.env.PORT || 5000, () => console.log('server listening on port 5000...'));