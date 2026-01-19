const express = require('express');
const verifyAdmin = require('./verifyAdmin');

const app = express();

app.get('/verify-admin', verifyAdmin);

app.listen(3005, () => {
    console.log('Auth service running on 3005');
});