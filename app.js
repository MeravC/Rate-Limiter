/*
Author: Merav Corem.
My solution checks when a request is received, if the interval from the first request with same URL had passed.
If so, then a new interval is being set to allow requests with the URL.
For each request received, a counter for each url is updated with the number of requests. 
For the first request the timestamp is also saved.
*/
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 4040;
const requestRate = process.env.requestRate || 10;
const interval = process.env.INTERVAL || 60000;//minute 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let urls = {};

app.post('/report', (req, res) => {//req is a JSON that contains a URL. res is the answer if that URL is allowed or not.
    const { url } = req.body;
    let allowed = isAllowed(url);
    res.json({ allow: allowed, urls });
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

function isAllowed(url) {
    const currentDate = new Date();
    if (urls[url] !== "undefined") {
        let timeStampWithInterval = new Date(urls[url].timeStamp);//Add the "interval" to the "timeStamp".
        timeStampWithInterval.setMilliseconds(urls[url].timeStamp.getMilliseconds() + interval);
        if (Date.parse(currentDate) >= Date.parse(timeStampWithInterval)) {//check if the current time of this request is after the "interval". 
            urls[url].counter = 1;
            urls[url].timeStamp = currentDate;
            return true;
        } else if (urls[url].counter < requestRate) {//check how many requests were sent within the interval.
            urls[url].counter++;
            return true;
        } else {
            return false;
        }
    }
    else{
        urls[url] = {'counter': 1, 'timeStamp': currentDate};//First time url is received.
        return true;
    }
}