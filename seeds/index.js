const mongoose=require("mongoose");
const Campground=require("../models/campgrounds")
const cities=require("./cities")
const{descriptors,places}=require("./seedHelpers")

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db=mongoose.connection;

db.on("error",console.error.bind(console,"Connection Error!"));
db.once("open",()=>{
    console.log("Database Connected")
});

const sample=array=>array[Math.floor(Math.random()*array.length)]

const seedDB=async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<300;i++){
       const random1000=Math.floor(Math.random()*20)+10;
       const price=Math.floor(Math.random()*1000)
       const camp=new Campground({
           author:"6172f2bd30f2401e93f2d617",
           location:`${cities[random1000].city},${cities[random1000].state}`,
           price,
           geometry:{
               type:"Point",
               coordinates:[
               cities[random1000].longitude,
               cities[random1000].latitude
              ]
           },
           title:`${sample(descriptors)} ${sample(places)}`,
            images:[
              {
                url: 'https://res.cloudinary.com/dvmt4198j/image/upload/v1635966097/YelpCamp/Camping-at-the-camground-900x525_bkdxpo.jpg',
                filename: 'YelpCamp/Camping-at-the-camground-900x525_bkdxpo.jpg'
              },
              {
                url: 'https://res.cloudinary.com/dvmt4198j/image/upload/v1635966086/YelpCamp/oy9xsbijv8wehnrzv0zt_pl7y2s.jpg',
                filename: 'YelpCamp/oy9xsbijv8wehnrzv0zt_pl7y2s.jpg'
              },
              {
                url: 'https://res.cloudinary.com/dvmt4198j/image/upload/v1635966079/YelpCamp/437173820_750x422_xwelzw.png',
                filename: 'YelpCamp/437173820_750x422_xwelzw.png'
              }
            ],
           description:"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sequi neque aliquam at nisi ipsa consectetur officiis obcaecati fugit dolore et accusamus porro ea fuga modi quae molestias aspernatur, praesentium suscipit..",
           price
       })
       await camp.save();
    }
}
seedDB().then(()=>{
    mongoose.connection.close();
});