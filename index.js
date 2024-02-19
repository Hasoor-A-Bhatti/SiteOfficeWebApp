const express = require('express');
const ejs = require('ejs');
const util = require('util');
const bodyParser = require('body-parser');



const PORT = 8000

const khuddam = {};

var bookings = {};
var allBookingsMade = {}
var tools = {};

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended:false }));


async function getKhuddams() {
    let sheetId = "1zIGf8lBUk1L_uohT0Q14phI_nUls4QLicy2pVUFqZb4";
    let sheetTitle = "khuddamAIMS";
    let sheetRange = "A1:G9";
    let fullUrl = "https://docs.google.com/spreadsheets/d/" + sheetId + "/gviz/tq?sheet="+sheetTitle+"&range="+sheetRange;

    try {
        const fetch = await import('node-fetch');
        const res = await fetch.default(fullUrl);
        const rep = await res.text();
        //console.log("Response:", rep); // Log the response text
        const data = JSON.parse(rep.substr(47).slice(0, -2));
        
        //console.log(data.table.rows[0].c[1].v);

        for (let i = 0; i < data.table.rows.length; i++) {
            khuddam[data.table.rows[i].c[0].v] = {
                name: data.table.rows[i].c[1].v,
                mobile: data.table.rows[i].c[2].v,
                age: data.table.rows[i].c[3].v,
                jamaat: data.table.rows[i].c[5].v,
                region: data.table.rows[i].c[6].v,

            }
        }

        //console.log(khuddam);


    } catch (error) {
        console.error('Error occurred while fetching khuddams:', error);
    }
}


async function getTools() {
    let sheetId = "1zIGf8lBUk1L_uohT0Q14phI_nUls4QLicy2pVUFqZb4";
    let sheetTitle = "toolSheet";
    let sheetRange = "A1:G5";
    let fullUrl = "https://docs.google.com/spreadsheets/d/" + sheetId + "/gviz/tq?sheet="+sheetTitle+"&range="+sheetRange;

    try {
        const fetch = await import('node-fetch');
        const res = await fetch.default(fullUrl);
        const rep = await res.text();
        //console.log("Response:", rep); // Log the response text
        const data = JSON.parse(rep.substr(47).slice(0, -2));
        
        //console.log(data.table.rows[0].c[1].v);

        for (let i = 0; i < data.table.rows.length; i++) {
            tools[data.table.rows[i].c[0].v] = {
                description: data.table.rows[i].c[1].v,
                manufacturer: data.table.rows[i].c[2].v,
                purchaseYear: data.table.rows[i].c[3].v,
                condition: data.table.rows[i].c[4].v,
                minimumAge: String(data.table.rows[i].c[5].v),
                comments: data.table.rows[i].c[6].v,
            }
        }

        //console.log(tools);

    } catch (error) {
        console.error('Error occurred while fetching tools:', error);
    }
}






app.get('/', async (req, res) => {
    console.log("STARTING");
    getKhuddams();
    getTools();
    res.render('index');
});

app.get('/booking', async (req, res) => {
    //console.log("booking");
    res.render('booking');
});

app.post('/booking', (req, res) => {
    // Access form data
    const aims = req.body.aims;
    const name = req.body.name;
    const age = req.body.age;
    const jamaat = req.body.jamaat;
    const operator = req.body.operator;
    const basketItems = JSON.parse(req.body.basketItems);

    let message = "";

    if (operator != "99999"){
        message = "Failed to Book due to INVALID Operator details!";
    } else if (verifyKhuddam(aims, name, age, jamaat)){
        message = makeBooking(aims, name, age, jamaat, operator, basketItems);
    } else {
        message = "Failed to Book due to INVALID Khuddam details!";
    }

    console.log(bookings);
    //console.log(basketItems);

    // Send response
    res.render('booking', { successMessage: message});
});


function makeBooking(aims, name, age, jamaat, operator, basketItems) {
    for (let i = 0; i < basketItems.length; i++) {
        if (!bookings.hasOwnProperty(basketItems[i])){
            let currentDate = new Date();
            bookings[basketItems[i]] = {
                "description": tools[basketItems[i]].description,
                "aims": aims,
                "name": name,
                "age": age,
                "jamaat": jamaat,
                "authorisedBy": operator,
                "bookingTime": currentDate,
                "Transfers": "none",
                "transferredFrom": "none",
                "transferTimes": "none",
                "transferAuthorisedBy": "none",
                "returnedAt": "none",
                "status": "ACTIVE"
            };

            allBookingsMade[basketItems[i]] = {
                "description": tools[basketItems[i]].description,
                "aims": aims,
                "name": name,
                "age": age,
                "jamaat": jamaat,
                "authorisedBy": operator,
                "bookingTime": currentDate,
                "Transfers": "none",
                "transferredFrom": "none",
                "transferTimes": "none",
                "transferAuthorisedBy": "none",
                "returnedAt": "none",
                "status": "ACTIVE"

            };

        } else {
            return "Booking Failed! One or More Items are not available!";
        }
    }
    return "Booking Successful!";
}





app.get('/returns', async (req, res) => {
    console.log("returns");
    res.render('returns', {allBookings: bookings, toolList: tools});
});


app.post('/returns', (req, res) => {
    const aims = req.body.aims;
    const name = req.body.name;
    const age = req.body.age;
    const jamaat = req.body.jamaat;
    const operator = req.body.operator;
    const basketItems = JSON.parse(req.body.basketItems);
    let message = "";

    if (operator != "99999"){
        message = "Failed to process return due to INVALID Operator details!";
    } else if (verifyKhuddam(aims, name, age, jamaat)){
        message = processReturn(aims, name, age, jamaat, operator, basketItems);
    } else {
        message = "Failed to Book due to INVALID Khuddam details!";
    }

    //console.log(bookings);
    //console.log(basketItems);
    // Send response
    res.render('returns', { successMessage: message, allBookings: bookings});;

});

function processReturn(aims, name, age, jamaat, operator, basketItems) {
    let message = "";
    for (let i = 0; i < basketItems.length; i++) {
        if (bookings.hasOwnProperty(basketItems[i])){
            delete bookings[basketItems[i]];
            allBookingsMade[basketItems[i]].status = "RETURNED";
            allBookingsMade[basketItems[i]].returnedAt = new Date();
            message += basketItems[i] + " Returned from " + aims + "\n";
        } else {
            message += "Return Failed! " + basketItems[i] + " Booking does not exist " + "\n";
        }
    }
    return message;
}


function processTransfer(oldAims, newAims, name, age, jamaat, operator, basketItems){
    let message = "";
    for (let i = 0; i < basketItems.length; i++) {
        if (bookings.hasOwnProperty(basketItems[i])){
            bookings[basketItems[i]].aims = newAims;
            bookings[basketItems[i]].name = name;
            bookings[basketItems[i]].age = age;
            bookings[basketItems[i]].jamaat = jamaat;
            bookings[basketItems[i]].status = "ACTIVE - TRANSFERRED";

            let item = basketItems[i];
            if (allBookingsMade.hasOwnProperty(item) && allBookingsMade[item].status === "ACTIVE") {
                allBookingsMade[item].aims = newAims;
                allBookingsMade[item].name = name;
                allBookingsMade[item].age = age;
                allBookingsMade[item].jamaat = jamaat;
                allBookingsMade[item].status = "ACTIVE - TRANSFERRED";
                allBookingsMade[item].transferTimes = new Date();
                allBookingsMade[item].transferredFrom = oldAims;
                allBookingsMade[item].transferAuthorisedBy = operator;
                allBookingsMade[item].Transfers = "COMPLETED";
            }

            message += basketItems[i] + " Transferred to " + newAims + "\n";
        } else {

            message += "Transfer Failed! " + basketItems[i] + " Booking does not exist " + "\n";
        }
    }
    return message


}


app.get('/transfer', async (req, res) => {
    console.log("transfer");
    res.render('transfer');
});


app.post('/transfer', (req, res) => {
    const newAims = req.body.newAims;
    const oldAims = req.body.oldAims;
    const name = req.body.name;
    const age = req.body.age;
    const jamaat = req.body.jamaat;
    const operator = req.body.operator;
    const basketItems = JSON.parse(req.body.basketItems);
    let message = "";

    if (operator != "99999"){
        message = "Failed to process transfer due to INVALID Operator details!";
    } else if (verifyKhuddam(newAims, name, age, jamaat)){
        message = processTransfer(oldAims,newAims,name, age, jamaat, operator, basketItems);
    } else {
        message = "Failed to Book due to INVALID Khuddam details!";
    }

    //console.log(bookings);
    //console.log(basketItems);
    // Send response
    res.render('returns', { successMessage: message, allBookings: bookings});;

});





app.get('/operator', async (req, res) => {
    console.log("operator");
    res.render('operator', {allBookings: bookings, totalBookingsMade: allBookingsMade});
});


app.listen(PORT, () => {
    console.log(`listening on port http://localhost:${PORT}`);
});


function verifyKhuddam(aims, name, age, jamaat){
    if (khuddam[aims].name.toLowerCase() == name.toLowerCase() && khuddam[aims].age == age && khuddam[aims].jamaat.toLowerCase() == jamaat.toLowerCase()){
        return true;
    }
    return false;
}