var Post=require("../models/post");
var Comment=require("../models/comment");
//all the middleware
var middlewareObj= {};
middlewareObj.checkPostOwnership = function(req,res,next)
 
{
	//is user logged in?

	if(req.isAuthenticated())
	
		{
				Post.findById(req.params.id,function(err,foundPost){
		if(err)
			{
				res.redirect("back");
            }              
        else{
				//does user own the Post??
			if(foundPost.author.id.equals(req.user._id )|| req.user.isAdmin)
				{
	             next();			
				}
			else{
				req.flash("error","You dont have permission!!!");
				res.redirect("back");
				
			}
 	
		}
     }); 
			
		}
	else
		
	{
		req.flash("error","You need to be logged in first!!");
		res.redirect("back");
	}

}
//edit

middlewareObj.checkCommentOwnership=function(req,res,next){
 

	//is user logged in?

	if(req.isAuthenticated())
	
		{
				Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err)
			{
				req.flash("error","Post not found");
				res.redirect("back");
            }              
        else{
				//does user own the comment??
			if(foundComment.author.id.equals(req.user._id)|| req.user.isAdmin)
				{
	             next();			
				}
			else{
				req.flash("error","You don't have permission to do that!!")
				res.redirect("back");
				
			}
 	
		}
     }); 
			
		}
	else
	{
		req.flash("error","You need to be logged in first!!")
		res.redirect("back");
	}
	
	
}

middlewareObj.isLoggedIn= function(req,res,next)

{
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","You need to be logged in first!!");
	res.redirect("/login");
}

module.exports = middlewareObj;