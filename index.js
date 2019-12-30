var express = require("express") // Import that runs the server
var bodyParser = require("body-parser"); // Import that accepts data through the server
var StellarSdk = require('stellar-sdk'); // connects takes the information from the stellar network
var mongoose = require('mongoose'); // Import that controls the database
var user = require("./models/user"); // The model for the user
var transferImport = require("./helperFunctions/transfer") //This library is the function that makes the stellar transcation
var balance = require("./helperFunctions/balance") //This library returns the balnce of a user's stellar
require('dotenv').config() //Allows access to my .env file


const app = express() // This variable holds the class express
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

StellarSdk.Network.useTestNetwork();
const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
var url =  process.env.mongoDriver;
mongoose.connect(url, {useNewUrlParser: true});
const port = 3000

//var secretKeys = ['SCCLG7IR756UJGREXNPXXSNWSJ43FTLTPASNWBCVDWDE3VIRVDPWYQQB', 'SD4JPSCCITBPWNH33H7O4D6QAH6WDMSGF3RWSUTGFPYILW6PFVGZZMEN', 'SAB2WFEDWVRMBWEMON2ICVOAS7GWFPDW3FDKMZYRDTSLG5RPNWOH7GTU']

// This route is the main or index route
app.get('/', (req, res) => {
    res.json({
        title: "The stellar transfer Api"
    })
})

/*app.post('/createUser', (req, res) =>{
    var name = req.body.name
    var account = StellarSdk.Keypair.fromSecret(req.body.account).publicKey()
    var email = req.body.email
    var userdata = {
        name: name,
        email: email,
        publicKey: account,
        secretKey: req.body.account
    }
    var newUser = new user(userdata);
    newUser.save(function(err, ret){
        if(err){
            console.error(err)
            res.json(err)
        }
        else{
            var message = "You have just created a stellar account at " + account
            res.json({
                name: name,
                email: email,
                publicKey: account,
                message: message
            })
        }
    })

})*/

// This route takes the user's name and checks their balance
app.post('/balance', function(req, res){
    var name = req.body.name

    user.findOne({'name': name}, function(err, doc){
        if(err) res.json({"error": err})
        else if(!doc){
            res.json({"error": "The user doesn't exist"})
        }
        else{
            setTimeout(function(){
                balance(doc.publicKey)
                .then(function(resp){
                    res.json({
                        'amount': resp,
                        'error': null
                    })
                })
            }, 1500)
        }
    })
})

// This route allows the user to send an amount they set
app.post('/transfer', (req,res) =>{
    var sender = req.body.user
    var reciever = req.body.reciever
    //var amount = toString(req.body.amount)
    //console.log(sender)
    //console.log(req.body.amount)
    //console.log(reciever)

    user.findOne({'name': sender}, function(err, send){ //finds the sender and their private key
        user.findOne({'name': reciever}, function(err,rec){ //finds the reciever and their public key
            //console.log(send.secretKey)
            //console.log(rec.publicKey)
            setTimeout(function(){
                var message = "Sent " + req.body.amount + " to " + reciever
                var fee = (parseInt(req.body.amount) * 0.25).toFixed(2)
                var stellarFee = 0.00001
                var total = (parseInt(req.body.amount) + parseInt(fee) + stellarFee)

                balance(send.publicKey)
                .then(function(resp2){
                    if(parseInt(total) < resp2){
                        // This function is called when the user makes a transcation with the api
                transferImport(send.secretKey, rec.publicKey, req.body.amount, message)
                .then(function(resp){
                    //var fee = (parseInt(req.body.amount) * 0.25).toFixed(2)
                    
                    // This functions takes a fee from the user when they make a transcation with the stellar app using the api
                    transferImport(send.secretKey, "GDSUMED6OE7SGLT25KQLYJBYAHFO3XEGAA5AUVOLARIDP5B2FBC7ZMBS", fee.toString(), "Stellar cash app fee")
                    .then(function(resp1){
                        var message = req.body.user + " has sent " + req.body.amount + " to " + rec.publicKey
                        res.json({
                            "amount": req.body.amount,
                            "reciever": rec.publicKey,
                            "message": message,
                            "total": total,
                            "error": null
                        })

                    })
                    .catch(function(err1){
                        console.log(err1)
                        res.json({
                            "error": err1
                        })

                    })
                })
                .catch(function(err){
                    console.log(err)
                    res.json({
                        "error": err
                    })
                })
                    }
                    else{
                        res.json({
                            "error": "insuffienct amount of funds to make the transcation"
                        })
                    }
                })
                .catch(function(err){
                    res.json({
                        "error": "Your stellar account doesn't exist"
                    })
                })
                
                
            }, 2000)
        })
    })
})

app.listen(port, '192.168.1.129',() => console.log(`Example app listening on port ${port}!`))