if(process.env.NODE_ENV!=="production"){
    require("dotenv").config();
};

const express=require("express")
const app=express();
const path=require("path")
const mongoose=require("mongoose");
const ejsMate=require("ejs-mate")
const session=require("express-session")
const flash=require("connect-flash")
const ExpressError=require("./utilities/ExpressError")
const methodOverride=require("method-override")
const passport=require("passport")
const User=require("./models/user")
const LocalStrategy=require("passport-local")
const userRoutes=require("./routes/users")
const campgroundRoutes=require("./routes/campgrounds")
const reviewRoutes=require("./routes/review");
const MongoStore = require('connect-mongo');
const dbUrl= process.env.DB_URL ||'mongodb://localhost/yelp-camp'
const mongoSanitize = require('express-mongo-sanitize');
const helmet=require("helmet");
const { contentSecurityPolicy } = require("helmet");

// 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl);

const db=mongoose.connection;
db.on("error",console.error.bind(console,"Connection Error!"));
db.once("open",()=>{
    console.log("Database Connected")
});

app.engine("ejs",ejsMate)
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname,"public")))
app.use(mongoSanitize({
    replaceWith: '_'
}))

// const store=new MongoStore({
//     url:dbUrl,
//     secret:"thisshouldbeabettersecret",
//     touchAfter:24*60*60
// });
// app.use(session(
//     {
//       secret: 'thisshouldbeabettersecret',
//       store: MongoStore.create({ 
//         mongoUrl:"mongodb://localhost:27017/yelp-camp"}),
      
//     }));

// store.on("error",function(e){
//     console,log("Session Store Error",e)
// })

const secret=process.env.SECRET || "thisshouldbeabettersecret";

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
    secret
    }
});

const sessionConfig={
    store,
    name:"session",
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true,
        expires:
        Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://code.jquery.com/jquery-3.5.1.slim.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
    "https://code.jquery.com/jquery-3.5.1.slim.min.j",
    "https://code.jquery.com/",
    "https://outdoorcommand.com/wp-content/uploads/2020/10/shutterstock_1031053282-scaled.jpg",

  
    
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/"
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dvmt4198j/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
     res.locals.error=req.flash("error");
       next();
    })

app.use("/",userRoutes)
app.use("/campgrounds",campgroundRoutes)
app.use("/campgrounds/:id/reviews",reviewRoutes)

app.get("/",(req,res)=>{
    res.render("home")
})

app.all("*",(req,res,next)=>{
    next(new ExpressError("Page not found",404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message) err.message="oh no something went wrong";
    res.status(statusCode).render("error",{err})
})

const port=process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`Listening to port ${port}`)
})