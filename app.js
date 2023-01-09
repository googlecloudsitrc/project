const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const mongoose =require('mongoose')
const dotenv = require('dotenv').config();
const jwt = require ('jsonwebtoken')
const bcrypt = require('bcrypt');
const Cookies = require('universal-cookie')


const port = process.env.PORT;
const db = process.env.DB_URL;
const SECRET = process.env.JWT_SECRET;


const app = express()
app.use(bodyParser.urlencoded({extended: true}));

mongoose.set('strictQuery', false);
app.set('view engine', 'ejs')
app.use('/build',express.static('build'))

mongoose.connect(db,{useNewUrlParser:true,useUnifiedTopology:true})
mongoose.connection.on("connected",() => {console.log("Connected to MongoDB!!");})
mongoose.connection.on("error",(err) => {console.log("Failed to connect to MongoDB"+err);})

const postSchema = {
    title: String,
    content: String,
    path: String,
    date_added: {
        type: Date,
    }
}

const userSchema = {
    email: {
        type:String
    },
    password:{
        type: String
    }
}

const Post = mongoose.model("Post", postSchema)

const User = mongoose.model("User", userSchema)

app.get('/', (req, res)=>{
    
    Post.find({},(err, posts)=>{
      res.render("index", {
        posts : posts
      })
    })
})

app.get("/create",async (req,res,next) => {
        try{
           const cookies = new Cookies(req.headers.cookie);
           getToken = cookies.get('token')
           console.log(cookies.get('token'))

           const decoded = await jwt.verify(
               getToken,
               SECRET
           )
           const user = await decoded;
           req.user = user;
           res.render('create')
        }
        catch (err){
           res.status(401).redirect("login")
           console.log(err)
        }
   }
)

app.post('/create',(req, res)=>{
    const post =new Post({
        title: req.body.postTitle,
        content: req.body.postBody,
        path: req.body.path,
        date_added: req.body.date,
    })

    post.save((err)=>{
        if (!err){
            res.redirect("/create")
        }
    })
})

app.get("/login", (req,res)=>{
    res.render("login")
})
app.post("/login", (req,res)=>{
    User.findOne({email: req.body.email}).then((user)=>{
        bcrypt.compare(req.body.password, user.password).then((match)=>{
            if(!match){
                return res.status(500).send({error: "Invalid Email and Paasword"})
            }

            const token = jwt.sign({userID: user._id, userEmail: user.email}, SECRET)
            res.cookie("token", token);
            res.status(500).redirect("create",token, user)
        })
    }).catch((err) => {
        res.status(500).send("Email not Found")
    })
}
 )
// In case of signup functionality // 
// app.get("/signup", (req,res)=>{
//     res.render("login")
// })
// app.post("/signup", (req, res) => {

//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(422).send({ error: "Please enter all the fields" })
//     }

//     if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
//         return res.status(422).send({ error: "Please enter valid Email!" })
//     }

//     bcrypt.hash(password, 10).then((hashedPassword) => {
//         const user = new User({
//             email,
//             password: hashedPassword
//         })

//         user.save()
//             .then((user) => {
//                 res.status(200).json({ message: "User Signed Up Successfully", user })
//             })
//             .catch((err) => { res.send(err) })
//     })

// }
//  )

app.get("/posts/:postName", (req,res)=>{
    const requestedPostId = req.params.postName

    Post.findOne({_id: requestedPostId}, (err, post)=>{
        res.render("posts",{
            title: post.title,
            content: post.content,
            path: post.path,
            date: post.data_added

        })
    })
})

app.listen(port, ()=>{
    console.log(`Connected Successfully at port ${port} , Follow link to get started http://localhost:${port}`)
})
