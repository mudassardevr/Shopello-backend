const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema({
    
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    items:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product"
            },
            quantity:{
                type:Number,
                required: true
            }
        }
    ],

    totalAmount:{
        type:Number,
        required:true
    },

    status:{
        type:String,
        default:"Pending"
    }

},{
     timestamps:true
});

module.exports = mongoose.model("Order" , OrderSchema);