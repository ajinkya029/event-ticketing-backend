const Event = require("../models/Event");
const Booking = require("../models/Booking");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

exports.listEvents = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const filter = { status: "published", startsAt: { $gte: new Date() } };
  if (req.query.category) filter.category = new RegExp(escapeRegex(req.query.category), "i");
  if (req.query.city) filter["venue.city"] = new RegExp(escapeRegex(req.query.city), "i");
  if (req.query.search) {
    const term = new RegExp(escapeRegex(req.query.search), "i");
    filter.$or = [{ title: term }, { description: term }, { category: term }];
  }
  if (req.query.from || req.query.to) {
    filter.startsAt = {};
    if (req.query.from) filter.startsAt.$gte = new Date(req.query.from);
    else filter.startsAt.$gte = new Date();
    if (req.query.to) filter.startsAt.$lte = new Date(req.query.to);
  }
  if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
    filter.price = {};
    if (req.query.minPrice !== undefined) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice !== undefined) filter.price.$lte = Number(req.query.maxPrice);
  }
  const [events, total] = await Promise.all([
    Event.find(filter).sort({ startsAt: 1 }).skip((page - 1) * limit).limit(limit),
    Event.countDocuments(filter)
  ]);
  res.json({ success: true, data: events, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id, status: "published" });
  if (!event) throw httpError(404, "Event not found");
  res.json({ success: true, data: event });
});

exports.createEvent = asyncHandler(async (req, res) => {
  const { title, description, category, venue, startsAt, endsAt, price, capacity, currency, imageUrl, status } = req.body;
  if (!title || !description || !category || !venue?.name || !venue?.address || !venue?.city || !startsAt || !endsAt || price === undefined || capacity === undefined) {
    throw httpError(400, "title, description, category, venue fields, startsAt, endsAt, price, and capacity are required");
  }
  if (new Date(endsAt) <= new Date(startsAt)) throw httpError(400, "endsAt must be after startsAt");
  if (new Date(startsAt) <= new Date()) throw httpError(400, "Event start time must be in the future");
  const event = await Event.create({
    title, description, category, venue, startsAt, endsAt, price, capacity, currency, imageUrl,
    status: status === "published" ? "published" : "draft", createdBy: req.user._id
  });
  res.status(201).json({ success: true, data: event });
});

exports.updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw httpError(404, "Event not found");
  const allowed = ["title", "description", "category", "venue", "startsAt", "endsAt", "imageUrl", "price", "currency", "capacity", "status"];
  for (const key of allowed) if (req.body[key] !== undefined) event[key] = req.body[key];
  if (event.endsAt <= event.startsAt) throw httpError(400, "endsAt must be after startsAt");
  if (event.capacity < event.bookedSeats) throw httpError(400, "Capacity cannot be lower than already booked seats");
  await event.save();
  res.json({ success: true, data: event });
});

exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw httpError(404, "Event not found");
  const bookings = await Booking.exists({ event: event._id, status: "confirmed" });
  if (bookings) {
    event.status = "cancelled";
    await event.save();
    return res.json({ success: true, message: "Event has bookings, so it was marked as cancelled instead of deleted" });
  }
  await event.deleteOne();
  res.json({ success: true, message: "Event deleted" });
});

exports.adminListEvents = asyncHandler(async (_req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  res.json({ success: true, data: events });
});

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
