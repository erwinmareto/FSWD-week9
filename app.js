const express = require("express");
const routes = require("./routes/index.js");
const swaggerUI = require("swagger-ui-express");
const errorHandler = require('./middleware/errHandler.js');
const swaggerJson = require('./swagger.json')
const cors = require('cors');
const morgan = require('morgan')

const app = express();

// Logging
app.use(morgan('tiny'));
// API docs
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerJson));
// Sharing recourses
app.use(cors());

app.use(routes);
app.use(errorHandler);


app.listen(3000);
