const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
require('colors')

// Load env variables
dotenv.config({ path: './config/config.env' })

// Load models
const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
)
// const courses = JSON.parse(
//   fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
// )

// Import data into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps)
    // await Course.create(courses)
    console.log('Data imported...'.green.inverse)
    process.exit()
  } catch (error) {
    console.log(error)
  }
}

// Delete data
const deleteData = async () => {
  try {
    await Course.deleteMany()
    await Bootcamp.deleteMany()
    console.log('Data destroyed...'.red.inverse)
    process.exit()
  } catch (error) {
    console.log(error)
  }
}

// node seeder -i, "-i" is at index 2
if (process.argv[2] === '-i') {
  importData()
} else if (process.argv[2] === '-d') {
  deleteData()
}
