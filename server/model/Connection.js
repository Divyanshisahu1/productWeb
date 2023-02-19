const db_link = "mongodb+srv://divyanshisahu126:Doyourwork%401234@cluster0.gqirdvu.mongodb.net/?retryWrites=true&w=majority"

const mongoose = require("mongoose")
mongoose.set('strictQuery', false)

mongoose
    .connect(db_link)
    .then(function (db) {
        console.log("user db connected");
        // console.log(db);
    })
    .catch(function (err) {
        console.log(err);
    });
    const userSchema = new mongoose.Schema({
        name: {
            type: String,
            required:true,
        },
        email: {
            type: String,
            required:true,
            unique: true
        },
        password: {
            type:String,
            required:true
        }
    
    })

    const productSchema = new mongoose.Schema({
    
        name:{
            type: String,
            
        },
        price:{
            type:Number,
           
        },
        desc:{
            type:String,
            
        },
        qnt:{
            type:Number,
             
        },
        img:{
            data:Buffer,
            contentType: String
        }

    })
    const ProductModule = new mongoose.model("ProductModule",productSchema)
    const  UserModule = new mongoose.model(" UserModule", userSchema)
    
     module.exports = {UserModule, ProductModule}
