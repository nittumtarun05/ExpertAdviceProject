
var express=require("express");
var router=express.Router();
var Post=require("../models/post");
var middleware=require("../middleware");//automatically requires index.js


var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
const { query } = require("express");
cloudinary.config({ 
  cloud_name: 'dcejv6x3d', 
  api_key: '841356472966823', 
  api_secret: 'nZOJntR88hQy6Nv1uueggme-2zI'
});

//INDEX route- show all posts
router.get("/",function(req,res){
  //code for searching feature

  //eval(require('locus'));// this will freeze the page

  if(req.query.search)//for searching feature
  {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');//g-global,i- ignore Case
    Post.find({name: regex},function(err, allPost){
      if(err)
        {
          console.log(err);
        }
      else
     {
      
        if(allPost.length > 0)
        {
          res.render("posts/posts2",{posts:allPost,currentUser: req.user});
        }
        else
        {
          req.flash("error","No problem statement matched your searched input!!");
          res.redirect("back");
        }
        
      }
      
    });


  }
  else{

//get posts from mongodb
	Post.find({},function(err, allPost){
		if(err)
			{
				console.log(err);
			}
		else{
			res.render("posts/posts2",{posts:allPost,currentUser: req.user});
		}
		
  })
}
//res.render("posts2",{posts:posts});
});
//CREATE- add new post to DB
//CREATE - add new post to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the post object under image property
      req.body.post.image = result.secure_url;
      // add image's public_id to post object
      req.body.post.imageId = result.public_id;
      // add author to post
      req.body.post.author = {
        id: req.user._id,
        username: req.user.username
      }
      Post.create(req.body.post, function(err, post) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/posts/' + post.id);
      });
    });
});
//NEW- displays from to mame a new entry to DB
router.get("/new",middleware.isLoggedIn,function(req,res){
	// show a form
	res.render("posts/new");
});
//SHOW- show information about a particular post
router.get("/:id",function(req,res){
	//find the post about a particular id
	Post.findById(req.params.id).populate("comments").exec(function(err, foundPost){
		if(err)
			{
				console.log(err);
			}
		//render show template with that post
		else
			{
				res.render("posts/show",{post: foundPost});
			}
		
	});
		
})
//*******************
//EDIT POST
//*******************
router.get("/:id/edit",middleware.checkPostOwnership,function(req,res)
    {
	Post.findById(req.params.id,function(err,foundPost)
	{
		res.render("posts/edit",{post:foundPost});
		
	});		
	});
	
//UPDATE POST

router.put("/:id", upload.single('image'), function(req, res){
    Post.findById(req.params.id, async function(err, post){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(post.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  post.imageId = result.public_id;
                  post.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            post.name = req.body.post.name;
            post.description = req.body.post.description;
            post.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/posts/" + post._id);
        }
    });
});

//DESTROY posts
router.delete('/:id', function(req, res) {
  Post.findById(req.params.id, async function(err, post) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(post.imageId);
        post.remove();
        req.flash('success', 'Post deleted successfully!');
        res.redirect('/posts');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});


function escapeRegex(text) {
  return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};



module.exports=router;