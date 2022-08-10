require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require("md5"); //Hash Function
const bcrypt = require("bcrypt"); //Hash Function
const e = require("express");
const saltRounds = 10;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    username:
    {
        type: String,
        required: true
    },
    password:
    {
        type: String,
        required: true
    }
});

// const secret = "sbciushytd";
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

//ENC_KEY=wQeXQ7s1ZZ0vpdltohH05A1/f9VvEq0m25fWjEl5KcM=
//SIG_KEY=c22LWVcADFj89dPEeJyQ9ee6v+xahsZ9jKsKb6vvGrsUlN3bxsdfuIUbvBtMa5YtbCwqU5moqTqIdKsECnnJmg==
//openssl rand -base64 32
var encKey = process.env.ENC_KEY;
//openssl rand -base64 64
var sigKey = process.env.SIG_KEY;

// userSchema.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey, encryptedFields: ["password"] });


const users = new mongoose.model("user", userSchema);

app.get("/", (req, res) => {
    res.render("home");
});

app.route("/register")

    .get((req, res) => {
        res.render("register");
    })

    .post((req, res) => {
        users.findOne({ username: req.body.username }, (err, doc) => {
            if (!doc) {
                bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                    if (!err) {
                        const newUser = new users({
                            username: req.body.username,
                            password: hash
                            // password: md5(req.body.password)
                        });
                        newUser.save(
                            (err) => {
                                if (!err) {
                                    res.render("secrets");
                                }
                            });
                    }
                })
            } else {
                res.send("Already Registered");
            }
        })
    })

app.route("/login")

    .get((req, res) => {
        res.render("login");
    })

    .post((req, res) => {
        users.findOne({ username: req.body.username }, (err, doc) => {
            if (!err) {
                // if (doc.password === md5(req.body.password)) {
                //     res.render("secrets");
                // } else {
                //     res.send("Wrong Password!")
                // }
                bcrypt.compare(req.body.password, doc.password, (err, result) => {
                    if (result) {
                        res.render("secrets");
                    } else {
                        res.send("Wrong Password!");
                    }
                })
            } else {
                console.log(err);
            }
        })
    })

app.listen(3000, () => {
    console.log("Hosted on Port 3000");
})