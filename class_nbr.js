var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
MongoClient.connect('mongodb://sreeram:sreeram@ds055980.mongolab.com:55980/vitacademics', function(err, db){
    assert.equal(null, err);
    console.log('connected to db');
    db.collection('student', function(err, student_collection){    
        var cursor = student_collection.find({}).limit(1);
        cursor.each(function(err, doc){
            console.log(doc);

        });
    });
   // db.close();
});
