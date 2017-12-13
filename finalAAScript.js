var fs=require('fs');
var cheerio=require('cheerio');
var content=fs.readFileSync('data/m9.txt');
var $ = cheerio.load(content);
var apiKey = process.env.GoogleMapsAPIKey;
var request= require('request');
var async = require('async');
var asyncEachObject = require('async-each-object');

var meetingData=[];
    $('tbody tr').each(function(i,elem){

    var elements={};
        $(elem).find('td').each(function(i,elem){
            if ($(elem).attr('style') == 'border-bottom:1px solid #e3e3e3;width:350px;'){
        var data = $(elem).eq(0).html().replace('\n                   \t \t\n\t\t\t\t  \t   ','')
                                       .replace('\n                    \t\n\t\t\t\t  \t   ','')
                                       .split('<br>');
            elements.meetingTimes = [];
                   for (var j = 0; j < data.length; j++){
                      if (data[j].match(/From/gi) !== null){
                        var temp={};
                            var a = data[j].replace(/[\r\n\t\/]/g, '').replace(/(<b>)/g, '');
                            var b = data[j+1];
                            var c = data[j+2];
                            temp.Day=a.split('From')[0].trim();
                            temp.Start=a.split('From')[1].split('to')[0].trim(); //8:00 PM
                            temp.End=a.split('to')[1].trim();
                            temp.Type = b.slice(20,b.length).trim();
                            temp.Interest = c.slice(23,c.length).trim();

            elements.meetingTimes.push(temp);
          }
        }
     }
            if($(elem).attr('style')=='border-bottom:1px solid #e3e3e3; width:260px'){
                elements.meetingAddress= $(elem).contents().get(6).nodeValue.split(',')[0].trim()+',New York, NY';
                elements.meetingWheelchair=$(elem).eq(0).find('span').text().trim();
                elements.meetingName = $(elem).eq(0).find('h4').text().trim();
        }
    });
        meetingData.push(elements);
 });

var meetingAddress = meetingData.filter(value => Object.keys(value).length !== 0);
meetingData.splice(0,2);
console.log(meetingData);

    async.eachObject(meetingAddress, function(value, key, callback) {
        var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + value.meetingAddress.split(' ').join('+') + '&key=' + apiKey;
        request(apiRequest, function(err, resp, body) {
            if (err) { throw err; }
            value.latLong = JSON.parse(body).results[0].geometry.location;
            setTimeout(callback, 250);
        });
}, function() {
        console.log(meetingData);
        fs.writeFileSync('/Users/zeynoustun/Desktop/datastructures/output/output9.json', JSON.stringify(meetingData));
});
