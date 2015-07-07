# Invoice Generator

This is a template I use for generating invoices. Putting this out there in the hope that it may be useful. You can use the template as long as you replace the colours, fonts, and imagery.


## Setup

Put your personal and payment details in `invoices/_you.json` and `invoices/_payment.json` respectively.

```bash
npm install
```


## New invoice

```bash
npm run-script invoice
```

Open `invoices/$DATE.json` in your favourite editor and add invoice and expense items.


## Print invoice

```bash
node invoices.js
```

Open `localhost:4000` in your favourite browser. Print your invoice or save it as a PDF.
