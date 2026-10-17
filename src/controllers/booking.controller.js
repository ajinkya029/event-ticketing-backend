const crypto = require("crypto");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

exports.createBooking = asyncHandler(async (req, res) => {
  const eventId = req.params.eventId;
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw httpError(400, "quantity must be an integer between 1 and 10");

  const attendeeName = req.body.attendeeName || req.user.name;
  const attendeeEmail = String(req.body.attendeeEmail || req.user.email).trim().toLowerCase();
  if (!attendeeName || !attendeeEmail) throw httpError(400, "Attendee name and email are required");

  // Atomic capacity update prevents concurrent requests from overselling seats.
  const event = await Event.findOneAndUpdate(
    { _id: eventId, status: "published", startsAt: { $gt: new Date() }, $expr: { $lte: [{ $add: ["$bookedSeats", quantity] }, "$capacity"] } },
    { $inc: { bookedSeats: quantity } },
    { new: true }
  );
  if (!event) {
    const exists = await Event.findById(eventId);
    if (!exists || exists.status !== "published") throw httpError(404, "Published event not found");
    throw httpError(409, "Not enough seats available, or event booking has closed");
  }

  try {
    const tickets = Array.from({ length: quantity }, () => ({
      ticketCode: `TKT-${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
      attendeeName,
      attendeeEmail
    }));
    const booking = await Booking.create({
      user: req.user._id, event: event._id, quantity, unitPrice: event.price,
      totalAmount: Number((event.price * quantity).toFixed(2)), currency: event.currency,
      paymentStatus: "unpaid", tickets
    });
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    await Event.updateOne({ _id: event._id }, { $inc: { bookedSeats: -quantity } });
    throw error;
  }
});

exports.myBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("event", "title startsAt endsAt venue imageUrl status")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: bookings });
});

exports.getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("event");
  if (!booking) throw httpError(404, "Booking not found");
  if (req.user.role !== "admin" && booking.user.toString() !== req.user._id.toString()) throw httpError(403, "You cannot view this booking");
  res.json({ success: true, data: booking });
});

exports.cancelBooking = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const booking = await Booking.findById(req.params.id).session(session);
      if (!booking) throw httpError(404, "Booking not found");
      if (req.user.role !== "admin" && booking.user.toString() !== req.user._id.toString()) throw httpError(403, "You cannot cancel this booking");
      if (booking.status === "cancelled") throw httpError(409, "Booking is already cancelled");
      const event = await Event.findById(booking.event).session(session);
      if (event && event.startsAt > new Date()) {
        await Event.updateOne({ _id: event._id }, { $inc: { bookedSeats: -booking.quantity } }, { session });
      } else if (event) {
        throw httpError(400, "Bookings cannot be cancelled after the event starts");
      }
      booking.status = "cancelled";
      booking.cancelledAt = new Date();
      booking.tickets = [];
      await booking.save({ session });
      result = booking;
    });
    res.json({ success: true, data: result });
  } finally {
    await session.endSession();
  }
});

exports.checkInTicket = asyncHandler(async (req, res) => {
  const { ticketCode } = req.body;
  if (!ticketCode) throw httpError(400, "ticketCode is required");
  const booking = await Booking.findOne({ "tickets.ticketCode": ticketCode, status: "confirmed" });
  if (!booking) throw httpError(404, "Valid ticket not found");
  const ticket = booking.tickets.find((item) => item.ticketCode === ticketCode);
  if (ticket.checkedInAt) throw httpError(409, "Ticket has already been checked in");
  ticket.checkedInAt = new Date();
  await booking.save();
  res.json({ success: true, message: "Ticket checked in successfully", data: { ticketCode, checkedInAt: ticket.checkedInAt, bookingReference: booking.bookingReference } });
});

exports.adminListBookings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.eventId) filter.event = req.query.eventId;
  if (req.query.status) filter.status = req.query.status;
  const bookings = await Booking.find(filter).populate("user", "name email").populate("event", "title startsAt venue").sort({ createdAt: -1 });
  res.json({ success: true, data: bookings });
});
