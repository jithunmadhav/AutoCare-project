import mongoose from "mongoose";

const mechanicSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
  },
  applicationStatus: {
    type: String,
    default: "applied",
  },
  ban: {
    type: Boolean,
    default: false,
  },
  review: {
    type: Array,
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
  },
  totalRating:{
    type: Number,
    default: 0,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  proof: {
    type: Object,
    required: true,
  },
  service: {
    type: Array,
    required: true,
  },
  about: {
    type: String,
  },
  minAmount: {
    type: Number,
    required: true,
  },
  scheduledDate: [],
  booked: {
    type: Array,
    default: [],
  },
  wallet:{
    type:Number,
    default:0
  }
});

const mechanicModel = mongoose.model("mechanic", mechanicSchema);

export default mechanicModel;
