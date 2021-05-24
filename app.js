var express= require("express");
var app= express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Post= require("./models/post");
var flash= require("connect-flash");
var seedDB = require("./seeds");
var Comment= require("./models/comment");
var passport= require("passport");
var LocalStrategy= require("passport-local");
var User= require("./models/user");
var methodOverride=require("method-override");
//requiring diffrent routes

var postRoutes=require("./routes/posts"),
    commentRoutes=require("./routes/comments"),
	indexRoutes=require("./routes/index");


//mongoose.connect("mongodb://localhost:27017/expert_advice",{useNewUrlParser:true});
mongoose.connect('mongodb://localhost:27017/expertadvice_v2', {useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify: false});

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));

app.use(methodOverride("_method"));

app.use(flash());



//=======================|
//Passporrt configuration|
//=======================|

app.use(require("express-session")({
	secret:"anything that we want!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//for navbar corectness on every page
app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	res.locals.error= req.flash("error");
	res.locals.success= req.flash("success");
	next();
});

app.use("/",indexRoutes);
app.use("/posts",postRoutes);
app.use("/posts/:id/comments",commentRoutes);





app.listen(3000,function()
		  {
	console.log("Server expertadvice running!!!");
});