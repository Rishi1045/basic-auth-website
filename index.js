const express = require("express");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "asd"

const app = express();
app.use(express.json()); //middleware to parse body


/*

our global in memory variable looks like this
[{
    username: "XYZ", password: "123123", taken: "asdasdasd"
}]

*/


/*

in sign-in endpoint ->
[{
    username: "XYZ", password: "123123", taken: "asdasdasd"
}]

*/


const users = [];

/*

should return random long string as a token

function generateToken(){
    let options = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let token = "";
    for(let i = 0 ; i < 32 ; i++){
        token = token + options[Math.floor(Math.random() * options.length)]; //0 -> 42
    }
    return token;
}

*/

function logger(req, res, next){
    console.log(req.method + " request came ");
    next();
}

//localhost 3000
// so that my FE and BE are hosted on the same domain
//to avoid CORS
app.get("/", function(req, res){
    res.sendFile(__dirname + "/public/index.html");
})

app.post("/signup", logger, function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    const userExists = users.some(user => user.username === username);
  
    // Check if username already exists
    if (userExists){
        return res.status(409).json({ message: "Username already exists" });
    }

    // If user doesnt exist => create new account
    users.push({
        username: username,
        password: password
    })

    res.json({
        message: "You are signed up"
    })

    console.log(users);
})

app.post("/signin", logger, function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    let foundUser = null;

    for(let i = 0 ; i<users.length ; i++){
        if(users[i].username == username && users[i].password == password){
            foundUser = users[i];
        }
    }

    if(foundUser){
        /*
        this fn(jwt.sign()) takes 2 arguments 
        converts their username to a token using my JWT secret
        */
        const token = jwt.sign({
            username: foundUser.username
        },JWT_SECRET); //converts their username over to a jwt
        res.header("jwt", token);

        //foundUser.token = token;

        res.json({
            token : token
        });
    }
    else{
        res.status(403).send({
            message : "invalid username or password"
        })
    }
    
    console.log(users);
/*

using filters(alternate way)
    const user = user.find(function(u){
        if(u.username == username){
            return true;
        }
        else{
            return false;
        }
    })

*/
})

function auth(req, res, next){
    const token = req.headers.token;
    const decodedData = jwt.verify(token, JWT_SECRET);
    if(decodedData.username){
        req.username = decodedData.username
        next();
    }
    else{
        res.json({
            message : "You are not logged in"
        })
    }
}

app.get("/me", logger, auth, function(req,res){

    // const token = req.headers.token; //jwt

    // //this line of token => converting the jwt over to the username
    // const decodedInformation = jwt.verify(token, JWT_SECRET); // {username : "XYZ.gmail.com"}
    // const username = decodedInformation.username;

    let foundUser = null;

    for(let i = 0 ; i < users.length ; i++){
        if(users[i].username == req.username){
            foundUser = users[i];
        }
    }

    if(foundUser){
        res.json({
            username: foundUser.username,
            password: foundUser.password
        })
    }
    else{
        res.json({
            message: "token invalid"
        })
    }
})

app.listen(3000);
