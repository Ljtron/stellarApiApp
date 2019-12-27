var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();
const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");


var balance = (account) => {

    var x = server.loadAccount(account)
        .catch(function (error) {
            throw new Error('The destination account does not exist!');
        })
        .then(function(res){
            for(i=0; i < res.balances.length; i++){
                if(res.balances[i].asset_type == 'native'){
                    return(res.balances[i].balance)
                    //break;
                }
            }
        })
    
    return x
}

// This portion of the code is used to test the balance function
/*balance("GDSUMED6OE7SGLT25KQLYJBYAHFO3XEGAA5AUVOLARIDP5B2FBC7ZMBS")
.then(function(res){
    console.log(res.balances)
    for(i=0; i < res.balances.length; i++){
        if(res.balances[i].asset_type == 'native'){
            console.log(res.balances[i].balance)
            break;
        }
    }
})*/

module.exports = balance