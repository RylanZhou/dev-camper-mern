const mongoose = require('mongoose')
const slugify = require('slugify')
const geocoder = require('../utils/geocoder')

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name is too long. (No more than 50 characters)']
    },
    slug: String, // For url use. If the name is Dev Central, then the slug would be dev-central.
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description is too long. (No more than 500 characters)']
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS'
      ]
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number is too long. (No more than 20 characters)']
    },
    email: {
      type: String,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please use a valid email'
      ]
    },
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    location: {
      // GeoJSON Point, https://mongoosejs.com/docs/geojson.html
      type: {
        type: String,
        enum: ['Point'] // "Point" is the only value available,
        // required: true
      },
      coordinates: {
        type: [Number],
        // required: true,
        index: '2dsphere'
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
    },
    careers: {
      type: [String],
      required: true,
      enum: [
        // Career is limited in these values
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other'
      ]
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must not be greater than 10']
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg'
    },
    housing: {
      type: Boolean,
      default: false
    },
    jobAssistance: {
      type: Boolean,
      default: false
    },
    jobGuarantee: {
      type: Boolean,
      default: false
    },
    acceptGi: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
  },
  // Additional Config for virtual properties
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Hooks that run before actions
BootcampSchema.pre('save', function(next) {
  // Create bootcamp slug from the name
  this.slug = slugify(this.name, { lower: true })
  next() // Move to the next middleware
})

BootcampSchema.pre('save', async function(next) {
  const location = await geocoder.geocode(this.address)
  this.location = {
    type: 'Point',
    coordinates: [location[0].longitude, location[0].latitude],
    formattedAddress: location[0].formattedAddress,
    street: location[0].streetName,
    city: location[0].city,
    state: location[0].stateCode,
    zipcode: location[0].zipcode,
    country: location[0].countryCode
  }

  // Do not save address in DB
  this.address = undefined

  next()
})

// Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove', async function(next) {
  await this.model('Course').deleteMany({ bootcamp: this._id })
  next()
})

// Reverse populate with virtuals
BootcampSchema.virtual('courses', {
  ref: 'Course', // Reference model
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false // Get an array of courses in that bootcamp
})
module.exports = mongoose.model('Bootcamp', BootcampSchema)
