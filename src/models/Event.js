const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  category: { type: String, required: true, trim: true, index: true },
  venue: {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true }
  },
  startsAt: { type: Date, required: true, index: true },
  endsAt: { type: Date, required: true },
  imageUrl: { type: String, trim: true, default: "" },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "INR", uppercase: true, minlength: 3, maxlength: 3 },
  capacity: { type: Number, required: true, min: 1 },
  bookedSeats: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ["draft", "published", "cancelled", "completed"], default: "draft", index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

eventSchema.virtual("availableSeats").get(function () {
  return Math.max(0, this.capacity - this.bookedSeats);
});
eventSchema.set("toJSON", { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Event", eventSchema);
