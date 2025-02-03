import { db } from "../utils/db.js";
import { Router } from "express";
import { ObjectId } from "mongodb";

const booksRouter = Router();

booksRouter.post("/", async (req, res) => {
  try {
    
    const requiredData = ["title" , "price" , "description" , "category"]; 
    for(let requiredField of requiredData ) {
      console.log(requiredField);
      
      if(!req.body[requiredField]){
        return res.json({message: `${requiredField}  is required`});
      };
    };
   
    const collection = db.collection("books_inventory");
    const bookData = { ...req.body, created_at: new Date() };
    const newBookData = await collection.insertOne(bookData);
    return res.json({
      message: `Book has been created successfully Id : ${newBookData.insertedId}`,
      data : ({bookData})
    });
  } catch (error) {
    return res.json({
      message: `${error}`,
    });
  }
});

booksRouter.get("/" , async(req,res) => {
    try {
        const title = req.query.title;
        const category = req.query.category;
        const limit = Number(req.query.limit) || 5;  
        const page = Number(req.query.page) || 1;

        const skip = (page - 1) * limit;
         
        const query = {} ; 
        if(title){
            query.title = new RegExp(title , "i");
        }
        if(category){
            query.category = new RegExp(category,"i");
        }

        const collection = db.collection("books_inventory"); 
        const booksData  = await collection.find(query).skip(skip).limit(limit).toArray();

        const totalBooks = await collection.countDocuments(query);

        const totalPages = Math.ceil(totalBooks / limit);

        return res.json({
            currentPage: page,
            totalPages: totalPages,
            totalBooks: totalBooks,
            books: booksData
        });

    } catch (error) {
        return res.json({message:`${error}`});
    }
});

booksRouter.put("/:id" , async(req,res)=>{

    try {
    const collection = db.collection("books_inventory");
    const bookId = new ObjectId(req.params.id);
    const updateData = {...req.body , update_at: new Date()};
    let result =  await collection.updateOne({_id:bookId} , {$set:updateData});
    if(result.modifiedCount === 0){
      return res.json({message: `Cannot update Book Id : ${bookId} : not found Id`});
    } 
 
    return res.json({message: `Book Id : ${bookId} has been update successfully`});

    } catch (error) {
       return ({message: `${error}`});
    }
});


booksRouter.delete("/:id" , async(req , res) =>{
    try {
        const bookId = new ObjectId(req.params.id);
        const collection = db.collection("books_inventory");
        let result = await collection.deleteOne({_id:bookId});
        if(result.deletedCount === 0){
          return res.json({message: `Cannot Delete Book Id : ${bookId} : not found Id`})
        }
        
        return res.json({message: `${bookId} has been delete successfully`});

    } catch (error) {
        return res.json({message: `${error}`});
    }
});

export default booksRouter ;


