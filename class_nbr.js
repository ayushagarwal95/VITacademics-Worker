var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var local_db = null;

(function(){      
    MongoClient.connect(process.env.LMONGOLAB, function(err, response){
        local_db = response;
    });
})();
MongoClient.connect(process.env.LMONGOLAB, function(err, db){
    db.collection('student', function(err, student_collection){
        var cursor = student_collection.find({});
        cursor.each(function(err, doc){
            if(doc !== null && local_db !== null){
                savetoLocal(doc);
            }
        });
    });
});

function empty_callback(err){
}

function upsert_class(col, base_doc, course){
    var class_nbr = course.class_number;
    col.find({'class_nbr': class_nbr}).toArray(function(err, class_doc){ 
        assert.equal(null, err);
        if(class_doc.length === 0){ 
            var instance = {
                'class_nbr':class_nbr,
                'students':[base_doc.reg_no],
            };
            console.log("Found new class: " + class_nbr  + " and " + base_doc.reg_no);
            console.log("\n");
            col.insert(instance, function(err, result){});
        }
        else{
            var students = class_doc[0].students;
            for(var student in students){
                var student = students[student];
                if(student === base_doc.reg_no){
                    console.log("record found for student: " + 
                        student.toString() + " " +
                        class_nbr.toString());    
                    return;
                }
            }
            students.push(base_doc.reg_no);
            console.log("Got New student for class: "+ class_nbr + "new student list is: ");
            console.log(students);
            console.log("\n");
            col.update({'class_nbr': class_nbr}, {$set:{'students': students}}, empty_callback);
        }
    });
}

function savetoLocal(base_doc){
    var courses = base_doc.courses;
    for(var index in courses){
        var col = local_db.collection('classes');
        col.ensureIndex({'class_nbr': 1},
            {unique: true},
            empty_callback);
        upsert_class(col, base_doc, courses[index]);
    } 
}
