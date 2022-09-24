#!/usr/bin/env node

const axios = require("axios");

const fs = require("fs"),
  rl = require("readline");

const reader = rl.createInterface({
  input: fs.createReadStream("data.csv"),
});

var token_quantity = [];
var header = [];

reader.on("line", (row) => {
  if(!header.length){
    header = row.split(",");
  }
  else {
    let result  = row.split(",");
    let index = token_quantity.findIndex(d => d.token == result[header.indexOf('token')])
    if(index > -1) {
        if(result[header.indexOf('transaction_type')].toLowerCase() == "withdrawal") {
            token_quantity[index].quantity = parseFloat(token_quantity[index].quantity) - parseFloat(result[header.indexOf('amount')]);
        }
        else if(result[header.indexOf('transaction_type')].toLowerCase() == "deposit") {
            token_quantity[index].quantity = parseFloat(token_quantity[index].quantity) + parseFloat(result[header.indexOf('amount')]);
        }
    } else {
        token_quantity.push({"token": result[header.indexOf('token')], "quantity": result[header.indexOf('amount')] });
    }
  }

});

reader.on("close", () => {
    // console.log(header, token_quantity);
    let tokens = token_quantity.map(d => d.token); 
axios.get("https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XRP&tsyms=USD", {params: {fsyms: tokens, tsyms: "USD", }})
 .then(res => {
//    console.log(res.data);
   console.log("Token : Value");
   token_quantity.map(d=> {
    console.log(`${d.token} : ${d.quantity * res.data[d.token].USD}`)
})
 });

  });
