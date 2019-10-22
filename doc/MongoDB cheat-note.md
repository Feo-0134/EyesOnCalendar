# MongoDB cheat-note

1. Flexible Schema

   1. he documents in a single collection do not need to have the same set of fields and the data type for a field can differ across documents within a collection.
   2. To change the structure of the documents in a collection, such as add new fields, remove existing fields, or change the field values to a new type, update the documents to the new structure.

2. Embedded Data / Normal Data(reference) 

   1. MongoDB documents make it possible to embed document structures in a field or array within a document. 

3. Reference

   1. References store the relationships between data by including links or *references* from one document to another. 

4. JSON Schema

   ```json
   db.createCollection("students", {
      validator: {
         $jsonSchema: {
            bsonType: "object",
            required: [ "name", "year", "major", "address" ],
            properties: {
               name: {
                  bsonType: "string",
                  description: "must be a string and is required"
               },
               year: {
                  bsonType: "int",
                  minimum: 2017,
                  maximum: 3017,
                  description: "must be an integer in [ 2017, 3017 ] and is required"
               },
               major: {
                  enum: [ "Math", "English", "Computer Science", "History", null ],
                  description: "can only be one of the enum values and is required"
               },
               gpa: {
                  bsonType: [ "double" ],
                  description: "must be a double if the field exists"
               },
               address: {
                  bsonType: "object",
                  required: [ "city" ],
                  properties: {
                     street: {
                        bsonType: "string",
                        description: "must be a string if the field exists"
                     },
                     city: {
                        bsonType: "string",
                        "description": "must be a string and is required"
                     }
                  }
               }
            }
         }
      }
   })
   ```

   