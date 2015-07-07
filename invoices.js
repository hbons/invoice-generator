// invoice-generator
// Copyright (C) 2015  Hylke Bons
//
// You may consider this code Public Domain.


// Requirements
var http       = require('http');
var express    = require('express');
var sass       = require('node-sass');
var fs         = require('fs');
var bodyParser = require('body-parser')


// Express
var app = express();
app.set('view engine', 'jade');
app.use(bodyParser.json());

var static = express.static('./public');
app.use(static);


// Sass
sass.render({ file: './public/stylesheets/default.sass' }, function(err, result) {
    fs.writeFile('./public/stylesheets/default.css', result.css, function(err) {            
        if(err) return console.log(err);
    });
});


// List of invoices
app.get('/', function(req, res) {
    var files    = fs.readdirSync('./invoices/');
    var invoices = [];
  
    files.forEach(function(invoice) {
        if (invoice.indexOf('_') != 0)
            invoices.push(invoice);
    });
  
    res.render('index', {
        page_title: 'Invoices',
        invoices: invoices
    });
});


// Invoice
app.get('/*', function(req, res) {
    var invoice = fs.readFileSync('./invoices/' + req.url, 'utf-8');
    var you     = fs.readFileSync('./invoices/_you.json', 'utf-8');
    var payment = fs.readFileSync('./invoices/_payment.json', 'utf-8');

    var date = req.url.replace("/", "");
    var date = date.replace(".json", "");
    
    var year  = date.split('-')[0];
    var month = date.split('-')[1] - 1;
    var day   = date.split('-')[2];

    date        = new Date(year, month, day);
    var dateDue = new Date(year, month, date.getDate() + 14);
        
    var data             = JSON.parse(invoice);
    data.invoice.you     = JSON.parse(you);
    data.invoice.payment = JSON.parse(payment);
    data.invoice.date    = prettyDate(date)
    data.invoice.due     = prettyDate(dateDue);

    // Calculate total
    data.invoice.total = 0;
    data.invoice.services.forEach(function(service) {
        data.invoice.total += service.amount;        
        service.amount = data.invoice.currency + ' ' + numberWithThousands(service.amount);
    });
  
    // Calculate expenses
    if (data.invoice.expenses) {
        data.invoice.total_expenses = 0;
        data.invoice.expenses.forEach(function(expense) {
            data.invoice.total_expenses += expense.amount;
            expense.amount = data.invoice.currency + ' ' + numberWithThousands(expense.amount);
        });

        data.invoice.total += data.invoice.total_expenses;
        data.invoice.total_expenses = data.invoice.currency + ' ' +
            numberWithThousands(data.invoice.total_expenses);
    }

    data.invoice.reference = '' + year + month + day + Math.floor(data.invoice.total);
  
    data.invoice.total = data.invoice.currency + ' ' +
      numberWithThousands(data.invoice.total);
    
    res.render('invoice', {
        invoice: data.invoice
    })
});


// Helpers
function numberWithThousands(i) {
    return i.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function prettyDate(date) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return '' + date.getDate() + ' ' + monthNames[date.getMonth()] + ' ' + date.getFullYear();
}


var server = http.createServer(app);
server.listen(4000, 'localhost');
