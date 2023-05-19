if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
const { restart } = require('nodemon')
initializePassport(
    passport, 
    email => USERS.find(user => user.email === email),
    id => USERS.find(user => user.id === id)
)

const USERS = [];

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))



const QUESTIONS = [{
    title: "Two states",
    description: "Given an array , return the maximum of the array?",
    testCases: [{
        input: "[1,2,3,4,5]",
        output: "5"
    }]
}];


const SUBMISSION = [

]

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name})
})

app.get('/login',checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login',checkNotAuthenticated, passport.authenticate('local', {
   successRedirect: '/',
   failureRedirect: '/login',
   failureFlash: true

}))

app.get('/registration',checkNotAuthenticated, (req, res) => {
    res.render('registration.ejs')
})

app.post('/registration',checkNotAuthenticated, async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        USERS.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/registration')
    }
    console.log(USERS)
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(3000)