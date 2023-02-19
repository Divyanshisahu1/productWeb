const express = require("express")
const { UserModule, ProductModule } = require("./model/Connection")
const jwt = require("jsonwebtoken");
const app = express()
const bodyParser = require("body-parser")
app.use(express.json())
const cors = require("cors");
var fs = require('fs');
var path = require('path');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var cookieParser = require('cookie-parser');
app.use(cookieParser());





var multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

var upload = multer({ storage: storage });


const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "mySecretKey", {
        expiresIn: "350s",
    });
};


app.get('/cookie', async(req, res) => {
   let cookie = await req.cookies.jwtcookie;
   console.log("cookie", cookie)
   res.send(cookie)
})

app.post('/user', async (req, res) => {
    try {
        console.log("user", req.body);
        const user1 = new UserModule(req.body);
        await user1.save(function (err, user) {
            if (err) return console.error(err);
            console.log(user.name + " saved to users collection.");
        });

        res.send({
            "status":200,
            "msg": "added user",
            "data": user1
        })
    } catch (error) {
        console.log("error", error.message);
        res.send({
            status: 400,
            "msg": error.message
        })
    }
})

app.post("/login", async (req, res) => {
    try {
        const { userEmail, password } = req.body;
        console.log("userEmail", userEmail)
        let user = await UserModule.findOne({ email: userEmail })
        console.log("user", user)
        let userExist;
        if (user) {
            userExist = (user.email === userEmail && user.password === password)
        }
        else {
            console.log("user does not exist!Please Signup")
        }
        console.log("userExist", userExist)
        if (userExist) {
            const accessToken = generateAccessToken(user)
            // const refreshToken = generateRefreshToken(user)
            // refreshTokens.push(refreshToken)
            console.log("accesstoken", accessToken)
            res.cookie("jwtcookie", accessToken, { expires: new Date(new Date().getTime()+5*60*1000), httpOnly: true });
            res.json({
                 status:200,
                 data: accessToken,
                // refreshToken: refreshToken,
            });
        } else {
            res.status(400).json({
                status:403,
                msg: "Email & Password incorrect",
            });
        }

    } catch (error) {
        console.log("error", error.message);
        res.send({
            "status":400,
            "msg": error.message
        })
    }
})



const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        console.log("token", token)
        jwt.verify(token, "mySecretKey", (err, user) => {
            if (err) {
                return res.status(403).json("Token is not valid");
            }
            req.user = user;
            next();
        })
    } else {
        res.status(401).json("You are not authorized");

    }
}
app.get("/product", async (req, res) => {
    try {
        let sort = req.query.sort;
        console.log(sort)
        let productData = null;
        if (sort) {
            console.log("inside sort")
            productData = await ProductModule.find().select({ name: 1, price: 1, img: 1, desc: 1, qnt: 1 }).sort({ price: 1 });
        } else {
            productData = await ProductModule.find().select({ name: 1, price: 1, img: 1, desc: 1, qnt: 1 });
        }

        console.log("product", productData)
        res.json(productData)
    } catch (error) {
        console.log("error", error.message);
        res.send({
            status: 400,
            msg: error.message
        })

    }
})
app.post("/product", upload.single("productImage"), async (req, res) => {
    try {
      
        console.log("request", req.body);
        console.log("req",req.file)
        const quantity = Number(req.body.quantity)
        const price = Number(req.body.price)

        var obj = {
            name: req.body.name,
            desc: req.body.description,
            price:price,
            qnt: quantity,
            img: {
                data: fs.readFileSync('uploads/' + req.file.filename),
                contentType: 'image/png'
            }
        }
        console.log("obj", obj)
        const prod = new ProductModule(obj);
        await prod.save(function (err, prod) {
            if (err) return console.error("err", err);
            console.log(prod.name+ "saved to product collection.");
        });

        res.send({
            status:200,
            msg:"product added",
            data:prod
        })

    } catch (error) {
        console.log("error", error.message);
        res, send({
            status: 400,
            msg: error.message
        })
    }
})

app.listen(8000, () => {
    console.log("server is listening to port 8000")

})