const mongoose = require("mongoose");
const Car = require("../models/Car");
const carController = {};

carController.createCar = async (req, res, next) => {
  console.log("req body", req.body);

  try {
    const { make, model, release_date, transmission_type, size, style, price } =
      req.body;

    // Validate cơ bản (bạn có thể thêm nâng cao hơn nếu muốn)
    if (
      !make ||
      !model ||
      !release_date ||
      !transmission_type ||
      !size ||
      !style ||
      !price
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newCar = new Car({
      make,
      model,
      release_date,
      transmission_type,
      size,
      style,
      price,
      isDeleted: false, // mặc định
    });

    const savedCar = await newCar.save();

    res.status(201).json({
      message: "Create Car Successfully!",
      car: savedCar,
    });
  } catch (err) {
    next(err);
  }
};

carController.getCars = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const [cars, total] = await Promise.all([
      Car.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Car.countDocuments({ isDeleted: false }),
    ]);

    res.send({
      message: "Get Car List Successfully",
      cars,
      page,
      total,
    });
  } catch (err) {
    next(err);
  }
};

carController.editCar = async (req, res, next) => {
  try {
    const carId = req.params.id || req.body.id;
    const updateData = req.body;
    // Optional: lọc chỉ cho phép update các trường hợp lệ
    const allowedFields = [
      "make",
      "model",
      "release_date",
      "transmission_type",
      "size",
      "style",
      "price",
    ];
    const filteredUpdate = {};

    for (let key of allowedFields) {
      if (key in updateData) {
        filteredUpdate[key] = updateData[key];
        console.log(filteredUpdate[key]);
      }
    }

    const updatedCar = await Car.findByIdAndUpdate(
      carId,
      { $set: filteredUpdate },
      { new: true, runValidators: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json({
      message: "Car updated successfully",
      car: updatedCar,
    });
  } catch (err) {
    next(err);
  }
};

carController.deleteCar = async (req, res, next) => {
  try {
    const carId = req.params.id || req.body.id;
    const deteledCar = await Car.findByIdAndDelete(carId, {
      runValidators: true,
    });

    if (!deteledCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json({
      message: "Car deleted successfully",
      car: deteledCar,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = carController;
