const express = require('express');
const Blog = require('../model/blog.model');
const Comment = require('../model/comment.model');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();
// create blog
router.post("/create-post", verifyToken ,isAdmin,async(req, res) => {
     try {
        const newPost = new Blog({...req.body});//
        await newPost.save();
        res.status(201).send({
            message: "Blog created successfully",
            post: newPost
        })
     } catch (error) {
        console.log("error in creating blog", error)
        res.status(500).json({ message: "error in creating blog" });
     }
})

// Get all blogs
router.get('/', async(req, res) => {
    try {
      const {search,category,location} = req.query;
      console.log(search);
      let query = {};
      if(search){
         query = {
            ...query,
            $or: [
               { title : { $regex: search, $options: 'i' }},
               { content : { $regex: search, $options: 'i' }}
               ]
            }
      }
      if(category){  
         query = {
            ...query,
             category
         }
      }
      if(location){
         query = {
            ...query,
             location
         }
      }


      const posts = await Blog.find(query).populate("author", "email").sort({createdAt: -1});
      res.status(200).send(posts);
   
    } catch (error) {
      console.log("error in creating blog", error)
      res.status(500).send({ message: "error in creating blog" });
    }
    });


    // Get single blog by id
    router.get('/:id',async(req, res) => {
        try {
          const postId = req.params.id;
          const post = await Blog.findById(postId);
          if(!post){
             return res.status(404).send({ message: "Blog not found" });
          }
          const comment = await Comment.find({postId: postId}).populate('user', "username email")
          res.status(200).send({
              message: "Blog found",
              post : post,
              comments : comment
          });
        } catch (error) {
          console.log("error in getting blog", error)
          res.status(500).send({ message: "error in getting blog" });
        }
    });
    // Update blog by id    
    router.put('/:id', verifyToken ,async(req, res) => { 
        try {
          const postId = req.params.id;
          const updatedPost = await Blog.findByIdAndUpdate(postId, req.body, { new: true });
          if(!updatedPost){
             return res.status(404).send({ message: "Blog not found" });
          }
          res.status(200).send({
              message: "Blog updated",
              post : updatedPost
          });
        } catch (error) {
          console.log("error in updating blog", error)
          res.status(500).send({ message: "error in updating blog" });
        }
    });
    // Delete blog by id
    router.delete('/:id',verifyToken , async(req, res) => {
        try {
          const postId = req.params.id;
          const deletePost = await Blog.findByIdAndDelete(postId);
          if(!deletePost){
             return res.status(404).send({ message: "Blog not found" });
          }
          await Comment.deleteMany({postId: postId});
          res.status(200).send({
              message: "Blog deleted",
              post : deletePost
          });
        } catch (error) {
          console.log("error in deleting blog", error)
          res.status(500).send({ message: "error in deleting blog" });
        }
        });

        // related blogs
    router.get('/related/:id', async(req, res) => {
        try {
          const {id} = req.params;
          
          if(!id){
             return res.status(404).send({ message: "Blog not found" });
          }
          const blog = await Blog.findById(id);
          if(!blog){
             return res.status(400).send({ message: "Blog not found" });
          }
          const titleRegex = new RegExp(blog.title.split(' ').join('|'), 'i');
          const relatedQuery = {
             _id: { $ne: id},
             title: { $regex: titleRegex },
          }
          const relatedBlogs = await Blog.find(relatedQuery)
          res.status(200).send( relatedBlogs);
        } catch (error) {
          console.log("error in getting related blogs", error)
          res.status(500).send({ message: "error in getting related blogs" });
        }
    });

module.exports = router;