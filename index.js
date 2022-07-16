const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv')
dotenv.config({path:__dirname+'/.env'});
const jwt  = require('jsonwebtoken');

const app = express();

const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const bookdata = require("./src/model/BookModel");
const userdata = require("./src/model/UserModel");

// const username = "admin@admin.com";
// const password = "12345678";


function verifyToken(req, res, next) {
    if(!req.headers.authorization) {
        return res.status(401).send('Unauthorised request')
    }
    let token = req.headers.authorization.split(' ')[1]
    if (token == 'null') {
        return res.status(401).send('Unauthorised Request')
    }
    let payload = jwt.verify(token, 'secretkey1')
    // console.log(payload)
    if (!payload) {
        return res.status(401).send('Unauthorised Request')
    }
    req.userId = payload.subject;
    next();
}

app.get('/',verifyToken, (req, res) => {
    bookdata.find()
    .then(function(books) {
        res.send(books);
    })
})

// app.post('/addbook', verifyToken, function(req,res) {
//     var item = {
//         id: req.body.id,
//         title: req.body.title,
//         author: req.body.author,
//         about: req.body.about
//     }
//     console.log(item);
//     const book = new bookdata(item);
//     book.save();
//     // res.redirect('');
//     res.send(item);
// });

// app.post('/login', (req,res) => {
//     let userData = req.body;
//     userdata.find({"username": userData.email})
//     .then(function(user) {
//     if(!username) {
//         res.status(401).send('Invalid Username')
//     } else {
//         if (password !== userData.password) {
//         res.status(401).send('Invalid Password')
//         } else {
//             let payload = {subject: username+password};
//             let token = jwt.sign(payload, 'secretkey1');
//             res.status(200).send({token});
//         }
//     }
// })
// });

app.post('/login', function(req,res) {
    var checkuser = {
        email:req.body.email,
        pwd:req.body.password
    };
    console.log('log in process start');
    console.log(checkuser);
    try {
        userdata.findOne({"username": checkuser.email}, (error, user) => {
            console.log(user)
            if(error) {
                console.log(error);
            }
            else {
                if(!user) {
                    res.status(401).send("Invalid Email");
                    // res.json({status:false});
                }
                else if (checkuser.pwd != user.password) {
                    res.status(401).send("Invalid Password");
                    // res.json({status:false});
                }
                else {
                    let payload = {subject: user._id};
                    let token = jwt.sign(payload, "secretkey1");
                    console.log(token)
                    res.status(200).send({status:true,name:user.username,token})
                }
            }
        })
    }
    catch(e) {
        console.log(error);
        res.send(e);
    }
})

app.post('/signup', function(req, res){
    var newUser = {
        username: req.body.email,
        password: req.body.password
    };

    // console.log(newUser)
    // const user = new userdata(newUser);
    // user.save();
    // res.json({status: true}).status(200)
    userdata.findOne({"username": newUser.username}, (error, user) => {
        console.log("error="+error)
        console.log("user="+user)
        if (error) {
            console.log(error)
        }
        else if (user) {
            console.log("User already exists")
            res.json({status: false})
        }
        else {
            var signup = new userdata(newUser);
            signup.save((error, newuser) => {
                console.log('Saved new user='+newuser)
                console.log("error="+error)
                if(error) {
                    console.log(error)
                    res.json({status:true})
                }
                else {
                    res.json({status:true}).status(200)
                }
            })
        }

    })
});


app.post('/deletebook', verifyToken, function(req,res){
    console.log("deletebook called")
    var bookName = req.body.title;
    console.log(bookName)
    bookdata.findOneAndDelete({"title": bookName})
    .then( function() {
        res.json({status: true}).status(200)
    })
})

app.post('/addbook', verifyToken, function(req, res) {
    var newBook = {
        title: req.body.title,
        author: req.body.author,
        about: req.body.about
    }
    console.log(newBook);
    bookdata.findOne({"title": newBook.title}, (error, book1) => {
        console.log("error="+error);
        console.log("new book="+book1);
        if(error) {
            console.log(error);
        }
        else if (book1) {
            console.log("Book already exists");
            res.json({status:false});
        }
        else {
            var newbook = new bookdata(newBook);
            newbook.save((error, newbook1) => {
                console.log('Saved new book='+newbook1)
                console.log("error="+error)
                if(error) {
                    console.log(error)
                    res.json({status:true})
                }
                else {
                    res.json({status: true}).status(200);
                }
                
            })
        }
    })
})

app.listen(PORT, () => {
    console.log(`server ready on ${PORT}`);
})
