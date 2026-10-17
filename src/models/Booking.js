const mongoose = require("mongoose");
const crypto = require("crypto");

const ticketSchema = new mongoose.Schema({
  ticketCode: { type: String, required: true },
  attendeeName: { type: String, required: true, trim: true },
  attendeeEmail: { type: String, required: true, lowercase: true, trim: true },
  checkedInAt: { type: Date, default: null }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  bookingReference: { type: String, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
  quantity: { type: Number, required: true, min: 1, max: 10 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true },
  status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed", index: true },
  paymentStatus: { type: String, enum: ["unpaid", "pending", "paid", "refunded"], default: "unpaid" },
  tickets: { type: [ticketSchema], default: [] },
  cancelledAt: { type: Date, default: null }
}, { timestamps: true });

bookingSchema.pre("validate", function () {
  if (!this.bookingReference) this.bookingReference = `EVT-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
});

module.exports = mongoose.model("Booking", bookingSchema);
