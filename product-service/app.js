// const express = require('express');
// const app = express();

// //dummy data produk
// const products = [
//     { id: 1, name: 'Iphone 17 Pro Max', price: 100, Description: 'This is Iphone 17 Pro Max' },
//     { id: 2, name: 'LOQ', price: 150, Description: 'This is LOQ' },
//     { id: 3, name: 'Mouse Razer', price: 200, Description: 'This is Mouse Razer' },
// ];

// //endpoint untuk mendapatkan semua produk
// app.get('/products', (req, res) => {
//     res.json(products);
// });

// //endpoint untuk mendapatkan detail produk berdasarkan id
// app.get('/products/:id', (req, res) => {
//     const productId = parseInt(req.params.id);
//     const product = products.find(p => p.id === productId);
//     if (product) {
//         res.json(product);
//     } else {
//         res.status(404).json({ message: 'Product not found' });
//     }
// });

// //menjalankan server pada port 3000
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Product service is running on port ${PORT}`);
// });

// //cara kedua
// //app.listen(3000, () => console.log('Product service is running on port 3000'));

// //latihan 30 menit
// //1 .implementasi ke flutter agar bisa akses data produk dari service ini dan detail
// //2. template di pflutter nya agar bisa menampung produk dan cart 2 button

const express = require("express");
const cors = require("cors");
const { DataTypes } = require("sequelize");
const { sequelize, connectWithRetry } = require("./database");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Definisikan model Produk
const Product = sequelize.define("Product", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
});

// Sinkronisasi model dengan database
(async () => {
  await connectWithRetry();
  await sequelize.sync({ alter: true });
  console.log("Database & tables created!");
})();

// Helper Response
const success = (res, message, data = null) =>
  res.status(200).json({ message, data });

const error = (res, status, message) =>
  res.status(status).json({ success: false, message });

//Routes

app.get("/products", async (req, res) => {
  try {
    const data = await Product.findAll();
    success(res, "Products retrieved successfully", data);
  } catch (err) {
    error(res, 500, "Failed to retrieve products");
  }
});

app.get("/products/:id", async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return error(res, 404, "Product not found");
  success(res, "Product retrieved successfully", product);
});

//tambah produk baru
app.post("/products", async (req, res) => {
  const { name, price, description } = req.body;

  if (!name || !price) return error(res, 400, "Name and Price are required");

  const product = await Product.create({ name, price, description });
  success(res, "Product created successfully", product);
});

//update produk
app.put("/products/:id", async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return error(res, 404, "Product not found");

  await product.update(req.body);
  success(res, "Product updated successfully", product);
});

//delete produk
app.delete("/products/:id", async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return error(res, 404, "Product not found");

  await product.destroy();
  success(res, "Product deleted successfully");
});

// Menjalankan server pada port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Product service is running on port ${PORT}`);
});