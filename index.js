const { faker, tr } = require('@faker-js/faker');
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'Safin@123'
});

let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};

//Home Route
app.get("/", (req, res) => {
    let q = `SELECT count(*) FROM userdata`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let count = result[0]["count(*)"];
            res.render("home.ejs", { count });
        });
    } catch (err) {
        console.log(err);
        res.send("Some error in DB");
    }
});

//Show Route
app.get("/user", (req, res) => {
    let q = "SELECT * FROM userdata"
    try {
        connection.query(q, (err, users) => {
            if (err) throw err;
            //res.send(result);
            res.render("showusers.ejs", { users });
        });
    } catch (err) {
        console.log(err);
        res.send("Some error in DB");
    }
});

//EDIT ROUTE
app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM userdata  WHERE id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            res.render("edit.ejs", { user });
        });
    } catch (err) {
        console.log(err);
        res.send("Some error in DB");
    }
});

//UPDATE (in DB) ROUTE
app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let {password:formPass,username:newUsername}=req.body;
    let q = `SELECT * FROM userdata  WHERE id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            if(formPass!=user.password){
                res.send("Wrong Password");
            }else{
                let q2=`UPDATE userdata SET username='${newUsername}' WHERE id='${id}'`;
                connection.query(q2,(err,result)=>{
                    if(err) throw err;
                    res.redirect("/user");
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.send("Some error in DB");
    }
});

// Form to create a new user
app.get("/user/new", (req, res) => {
    res.render("new.ejs");
});

// Insert new user into DB
app.post("/user", (req, res) => {
    let { username, email, password } = req.body;
    let id = faker.string.uuid();
    let q = `INSERT INTO userdata (id, username, email, password) VALUES (?, ?, ?, ?)`;
    try {
        connection.query(q, [id, username, email, password], (err, result) => {
            if (err) throw err;
            res.redirect("/user");
        });
    } catch (err) {
        console.log(err);
        res.send("Error inserting user into DB");
    }
});

app.get("/user/delete", (req, res) => {
    res.render("delete.ejs");
});

app.delete("/user", (req, res) => {
    let { email, password } = req.body;
    let q = `SELECT * FROM userdata WHERE email = ?`;
    connection.query(q, [email], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.send("No user found with this email.");
        }
        let user = results[0];
        if (user.password !== password) {
            return res.send("Incorrect password.");
        }

        let deleteQuery = `DELETE FROM userdata WHERE email = ?`;
        connection.query(deleteQuery, [email], (err2, result2) => {
            if (err2) throw err2;
            res.redirect("/user");
        });
    });
});


app.listen("8080", () => {
    console.log("server is listening to port 8080");
});
