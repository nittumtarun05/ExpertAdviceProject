var express=require("express");
var router=express.Router();
var passport=require("passport");
var User=require("../models/user");
router.get("/",function(req,res)
	   {
	res.render("landing");
});




//===========
//AUTH Routes
//===========

router.get("/register",function(req,res){
res.render("register");
})

router.post("/register",function(req,res){
	var newUser=new User({username: req.body.username});
	if(req.body.adminCode === 'A3T24444@')
	{
		newUser.isAdmin = true;
	}
User.register(newUser,req.body.password,function(err,user){
	if(err)
		{
			console.log(err);
			req.flash("error",err.message);
			return res.redirect("/register");
		}
	passport.authenticate("local")(req,res,function(){
res.redirect("/posts");
	})
});
})


//Show login form
router.get("/login",function(req,res){
	res.render("login");
})

//handling login logic
//app.post("/login",middleware,callback)
router.post("/login",passport.authenticate("local",
{successRedirect: "/posts",
failureRedirect: "/login",
failureFlash: true 

}) ,function(req,res){


});


//logout route
router.get("/logout",function(req,res){
req.logout();
	req.flash("success","logged you out!");
	res.redirect("/posts");
});


//middleware
function isLoggedIn(req,res,next)
{
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}
module.exports=router;