const http = require('http')
const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose');
// const { connected } = require('process');
const app = express();
require('dotenv').config();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

const blogRouter = require('./src/routes/blog.route');
const commentRouter = require('./src/routes/comment.route');
const userRouter = require('./src/routes/user.route');




app.use('/api/blog', blogRouter);
app.use('/api/comment', commentRouter);
app.use('/api/user', userRouter); 



async function main() {
  await mongoose.connect(process.env.MONGODB_URI);


  app.get('/', (req, res) => {
    res.send('<h1>Welcome to BTCNews99.com</h1>')
  })
}


main().then(() => console.log("db connected successfully")).catch(err => console.log(err));



app.listen(process.env.PORT || 3000, () => {
  console.log(`Example app listening on port ${process.env.PORT || 3000}`)
})