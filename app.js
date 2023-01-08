const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const mongoose =require('mongoose')


const port = 8080;
const db = 'mongodb+srv://gdscsitrc:Gdscsitrc%4021@cluster0.epsbcnt.mongodb.net/?retryWrites=true&w=majority';


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

const Post = mongoose.model("Post", postSchema)

app.get('/', (req, res)=>{
    
    Post.find({},(err, posts)=>{
      res.render("index", {
        posts : posts
      })
    })
})

app.get("/create", (req, res)=>{
    res.render("create")
})

app.post('/create', (req, res)=>{
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
