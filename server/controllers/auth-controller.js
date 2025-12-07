const auth = require('../auth')
const dbManager = require('../db/loader')
const bcrypt = require('bcryptjs')

getLoggedIn = async (req, res) => {
    try {
        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            })
        }
        const db = req.app.locals.db;
        const loggedInUser = await db.findUserById(userId);
        console.log("loggedInUser: " + loggedInUser);

        if(!loggedInUser){
            return res.status(200).json({
                loggedIn: false,
                user:null
            })
        }

        return res.status(200).json({
            loggedIn: true,
            user: {
                username: loggedInUser.username,
                email: loggedInUser.email,
                avatar: loggedInUser.avatar
            }
        })
    } catch (err) {
        console.log("err: " + err);
        res.json(false);
    }
}

loginUser = async (req, res) => {
    console.log("loginUser");
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }

        const db = req.app.locals.db;
        const existingUser = await db.findUserByEmail(email);
        console.log("existingUser: " + existingUser);
        if (!existingUser) {
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                })
        }

        console.log("provided password: " + password);
        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordCorrect) {
            console.log("Incorrect password");
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                })
        }

        // LOGIN THE USER
        const token = auth.signToken(existingUser._id);
        console.log(token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: true
        }).status(200).json({
            success: true,
            user: {
                username: existingUser.username,
                email: existingUser.email,
                avatar: existingUser.avatar         
            }
        })

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

logoutUser = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none"
    }).send();
}

registerUser = async (req, res) => {
    console.log("REGISTERING USER IN BACKEND");
    try {
        const { username, email, password, passwordVerify, avatar } = req.body;
        console.log("create user: " + username+ " " + email + " " + password + " " + passwordVerify);
        if (!username || !email || !password || !passwordVerify) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }
        console.log("all fields provided");
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }
        console.log("password long enough");

        if (password !== passwordVerify) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                })
        }
        console.log("password and password verify match");

        const existingUser = await dbManager.findUserByEmail(email);
        console.log("existingUser: " + existingUser);
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this email address already exists."
                })
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);

        console.log("passwordHash: " + passwordHash);
        
        const db = req.app.locals.db;
        const savedUser = await db.createUser({
            username,
            email,
            passwordHash,
            // provided avatar or empty sting
            avatar: avatar || ''
        });

        console.log("new user saved: " + savedUser._id);

        // LOGIN THE USER
        const token = auth.signToken(savedUser._id);
        console.log("token:" + token);

        await res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }).status(200).json({
            success: true,
            user: {
                username: username, 
                email: email,
                avatar: avatar              
            }
        })

        console.log("token sent");

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

updateAccount = async (req, res) => {
    try{
        const userId = auth.verifyUser(req);
        if(!userId){
            return res.status(401).json({
                errorMessage: 'Unauthorized'
            });
        }
        const {username, avatar} = req.body;
        const db = req.app.locals.db;

        const updatedUser = await db.updateUser(userId, {username, avatar});

        return res.status(200).json({
            success: true,
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                avatar: updatedUser.avatar
            }
        });
    }catch(error){
        console.error('Update account error: ', error);
        return res.status(500).json({
            errorMessage: 'Error updating account'
        })
    }
}
 
module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser,
    updateAccount
}