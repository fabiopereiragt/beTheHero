const express = require('express');
const cors = require('cors');
const { errors } = require('celebrate');
const routes = require('./routes'); //tenho que colocar ./ para informar que é um arquivo e não um pacote, como o Express é.

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);
app.use(errors());

app.listen(3333);
