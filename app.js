"use strict";

const express = require("express");
const app = express();
// const multer = require("multer");
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const fsp = require("fs/promises");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.json());
// app.use(multer().none());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: '123456789',
    resave: false,
    saveUninitialized: true,
}));



// Signup endpoint
app.post('/signup', async (req, res) => {
    try {
        let users = await fsp.readFile("data/users.json", "utf8");
        users = JSON.parse(users);

        const {name, email, password } = req.body;
        if (users.find(user => user.email === email)) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({name, email, password: hashedPassword });
        await fsp.writeFile("data/users.json", JSON.stringify(users, null, 2), "utf8");
    
        req.session.user = { email };
        res.status(201).json({ message: 'User created', user: { email } });
    }
    catch (error) {
        res.status(500).send("Error in creating user account");
    }
   
});

// Login endpoint
app.post('/login', async (req, res) => {
    try{
        let users = await fsp.readFile("data/users.json", "utf8");
        users = JSON.parse(users);

        const { email, password } = req.body;
        const user = users.find(user => user.email === email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        req.session.user = { email };
        res.json({ message: 'Logged in', user: { email } });
    }
    catch (error) {
        res.status(500).send("Error in logging in");
    }
   
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out' });
});

// Data endpoint
app.get("/data", async (req, res) => {
    try {
        let resp = await fsp.readFile("data/data.json", "utf8");
        resp = await JSON.parse(resp);
        res.type("json");
        res.send(resp);
    }
    catch (error) {
        res.status(500).send("Error in fetching data.");
    }
});


app.get("/cart", async (req, res) => {
    try {
        let resp = await fsp.readFile("data/cart.json", "utf8");
        resp = await JSON.parse(resp);
        res.type("json");
        res.send(resp);
    }
    catch (error) {
        res.status(500).send("Error in fetching data.");
    }
});

app.post("/addToCart", async (req, res) => {
    try {
        let resp = await fsp.readFile("data/cart.json", "utf8");
        resp = JSON.parse(resp);
        let data = req.body;
        resp.push(data);
        await fsp.writeFile("data/cart.json", JSON.stringify(resp, null, 2), "utf8");
        res.type("text");
        res.send("Item has been added to cart!");
    } catch (error) {
        res.type("text");
        res.status(500).send("Error in adding data to cart.");
    }
});

app.post("/contact", async (req, res) => {
    const { name, email, message } = req.body;
    if (!(name && email && message)) {
        res.status(400).json({ message: "Please provide name, email, and message." });
        return;
    }
    try {
        let resp = await fsp.readFile("data/contact.json", "utf8");
        resp = JSON.parse(resp);
        resp.push({ name, email, message });
        await fsp.writeFile("data/contact.json", JSON.stringify(resp, null, 2), "utf8");
        res.status(201).json({ message: "Your information has been sent!" });
    } catch (error) {
        res.status(500).json({ message: "Error in submitting contact information." });
    }
});


app.post("/removeCart", async (req, res) => {
    const { name, price, amount } = req.body;
    if (!(name && price && amount)) {
        res.status(400).json({ message: "Did not pass in product information." });
        return;
    }
    try {
        let resp = await fsp.readFile("data/cart.json", "utf8");
        resp = JSON.parse(resp);
        const newCart = resp.filter(item => !(item.itemName === name));
        await fsp.writeFile("data/cart.json", JSON.stringify(newCart, null, 2), "utf8");
        res.status(200).json({ message: "Item has been removed from cart!" });
    } catch (error) {
        res.status(500).json({ message: "Error in fetching data." });
    }
});
     

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
