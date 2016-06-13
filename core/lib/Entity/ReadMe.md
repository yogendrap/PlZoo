Entity is a group of field object with validation object attach to each field object.


Example:-


   User -> Entity {
            username : textField [required, to be string, min length, max length ] 
            
   }

   var Ajay = new User({username:'Ajay'});  


Points-
All entity must be stored in mongodb.
Entity configuration can be stored in mongodb -> redis.
CRUD operation on entity.
Permission on Entity (CRUD operation wise).
Permission on field bases.
 




