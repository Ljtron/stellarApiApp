var express = require("express") // Import that runs the server
var bodyParser = require("body-parser"); // Import that accepts data through the server
var StellarSdk = require('stellar-sdk'); // connects takes the information from the stellar network
var mongoose = require('mongoose'); // Import that controls the database
var user = require("./models/user"); // The model for the user
var transferImport = require("./helperFunctions/transfer")


const app = express() // This variable holds the class express
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

StellarSdk.Network.useTestNetwork();
const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
var url = "mongodb://localhost:27017/stellarApp";
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
    var account = StellarSdk.Keypair.fromSecret(secretKeys[parseInt(req.body.account)]).publicKey()
    var email = req.body.email
    var userdata = {
        name: name,
        email: email,
        publicKey: account,
        secretKey: secretKeys[parseInt(req.body.account)]
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

// This route allows the user to send an amount they set
app.post('/transfer', (req,res) =>{
    var sender = req.body.user
    var reciever = req.body.reciever
    //var amount = toString(req.body.amount)
    console.log(sender)
    console.log(req.body.amount)
    console.log(reciever)

    user.findOne({'name': sender}, function(err, send){
        user.findOne({'name': reciever}, function(err,rec){
            console.log(send.secretKey)
            console.log(rec.publicKey)
            setTimeout(function(){
                transferImport(send.secretKey, rec.publicKey, req.body.amount)
                .then(function(resp){
                    var message = req.body.user + " has sent " + req.body.amount + " to " + rec.publicKey
                    res.json({
                        "amount": req.body.amount,
                        "reciever": rec.publicKey,
                        "message": message
                    })
                })
                .catch(function(err){
                    console.log(err)
                    res.send("Opps")
                })
            }, 2000)
        })
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))