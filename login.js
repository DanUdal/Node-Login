const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const http = require('http');
const bcrypt = require('bcrypt');
const path = require('path');
const users = require('./data').userDB;

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'nodelogin'
});

const app = express();
const server = http.createServer(app)

app.use(session({
	secret: 'secretidhere',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/static')));

app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/static/home.html'));
});

app.post('/register', async (req, res) => {
	try{
        let foundUser = users.find((data) => req.body.email === data.email);
        if (!foundUser) {
            let hashPassword = await bcrypt.hash(req.body.password, 10);
            let newUser = {
                id: Date.now(),
                username: req.body.username,
                email: req.body.email,
                password: hashPassword,
            };
            users.push(newUser);
            console.log('User list', users);
            res.send("<div align ='center'><h2>Registration successful</h2></div><br><br><div align='center'><a href='./login.html'>login</a></div><br><br><div align='center'><a href='./register.html'>Register another user</a></div>");
        } else {
            res.send("<div align ='center'><h2>Email already used</h2></div><br><br><div align='center'><a href='./register.html'>Register again</a></div>");
        }
    } catch{
        res.send("Internal server error");
    }
});

app.post('/login', async (req, res) => {
    try{
        let foundUser = users.find((data) => req.body.email == data.email);
        console.log(foundUser);
        if (foundUser) {
            let submittedPass = req.body.password; 
            let storedPass = foundUser.password; 
            const passwordMatch = await bcrypt.compare(submittedPass, storedPass);
            if (passwordMatch) {
                let usrname = foundUser.username;
                res.send(`<div align ='center'><h2>login successful</h2></div><br><br><br><div align ='center'><h3>Hello ${usrname}</h3></div><br><br><div align='center'><a href='./login.html'>logout</a></div>`);
            } else {
                res.send("<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align ='center'><a href='./login.html'>login again</a></div>");
            }
        }
        else {
    
            let fakePass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfga`;
            await bcrypt.compare(req.body.password, fakePass);
            console.log("email not found");
            res.send("<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align='center'><a href='./login.html'>login again<a><div>");
        }
    } catch{
        res.send("Internal server error");
    }
});

// http://localhost:3000/home
//app.get('/home', function(request, response) {
	// If the user is loggedin
//	if (request.session.loggedin) {
//		// Output username
//		response.send('Welcome back, ' + request.session.username + '!');
//	} else {
//		// Not logged in
//		response.send('Please login to view this page!');
//	}
//	response.end();
//});

server.listen(3000);