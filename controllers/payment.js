const Payment = require("../models/Payment");
const Order = require("../models/Order");
const User = require("../models/User");
const { errorHandler } = require("../auth");

const VALID_STATUSES = ["pending", "paid", "failed", "refunded"];

// USER LEVEL ACCESS

module.exports.createPayment = (req, res) => {
  const { orderId, paymentMethod, amount } = req.body;

  if (!orderId) {
    return res.status(400).send({ message: "Order ID is required" });
  }
  if (!paymentMethod) {
    return res.status(400).send({ message: "Please choose your preferred payment method" });
  }
  if (!amount) {
    return res.status(400).send({ message: "Amount input is required" });
  }

  return User.findById(req.user.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      if (!user.isActive) {
        return res.status(403).send({ message: "Account is deactivated. Please contact support." });
      }

      return Order.findById(orderId)
        .then((order) => {
          if (!order) {
            return res.status(404).send({ message: "Order not found" });
          }
          if (order.userId.toString() !== req.user.id) {
            return res.status(403).send({ message: "Unauthorized. This order does not belong to you." });
          }
          if (order.status !== "Confirmed") {
            return res.status(400).send({ message: "Order must be confirmed before payment" });
          }
          if (amount !== order.totalPrice) {
            return res.status(400).send({ message: "Amount must match the order total" });
          }

          return Payment.findOne({ orderId })
            .then((existingPayment) => {
              if (existingPayment) {
                return res.status(409).send({ message: "Payment already exists for this order" });
              }

              const newPayment = new Payment({
                userId: req.user.id,
                orderId,
                paymentMethod,
                amount,
                status: "pending",
                transactionId: "EC606-" + Date.now(),
                paidAt: null
              });

              return newPayment.save()
                .then((result) => res.status(201).send({
                  message: "Payment created successfully",
                  transactionId: result.transactionId,
                  status: result.status
                }));
            });
        });
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.getMyPayments = (req, res) => {
  return User.findById(req.user.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      if (!user.isActive) {
        return res.status(403).send({ message: "Account is deactivated. Please contact support." });
      }

      return Payment.find({ userId: req.user.id })
        .then((result) => {
          if (result.length === 0) {
            return res.status(404).send({ message: "No payments found" });
          }
          return res.status(200).send({
            message: "Payments found",
            payments: result
          });
        });
    })
    .catch((err) => errorHandler(err, req, res));
};

// ADMIN LEVEL ACCESS

module.exports.getAllPayments = (req, res) => {
  return Payment.find()
    .then((result) => {
      if (result.length === 0) {
        return res.status(404).send({ message: "No payments found" });
      }
      return res.status(200).send({
        message: "Payments found",
        payments: result
      });
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.getPaymentById = (req, res) => {
  return Payment.findById(req.params.id)
    .then((result) => {
      if (!result) {
        return res.status(404).send({ message: "No payment found" });
      }
      return res.status(200).send({
        message: "Payment found",
        result
      });
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.updatePaymentStatus = (req, res) => {
  const { status } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).send({ message: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
  }

  return Payment.findById(req.params.id)
    .then((payment) => {
      if (!payment) {
        return res.status(404).send({ message: "Payment not found" });
      }
      if (payment.status === status) {
        return res.status(400).send({ message: `Payment is already marked as ${status}` });
      }

      payment.status = status;

      if (status === "paid") {
        payment.paidAt = Date.now();
      }

      return payment.save()
        .then((result) => res.status(200).send({
          message: "Status updated successfully",
          result
        }));
    })
    .catch((err) => errorHandler(err, req, res));
};