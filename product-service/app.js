const express = require('express');
const app = express();

//dummy data produk
const products = [
    { id: 1, name: 'Iphone 17 Pro Max', price: 100, Description: 'This is Iphone 17 Pro Max' },
    { id: 2, name: 'LOQ', price: 150, Description: 'This is LOQ' },
    { id: 3, name: 'Mouse Razer', price: 200, Description: 'This is Mouse Razer' },
];

//endpoint untuk mendapatkan semua produk
app.get('/products', (req, res) => {
    res.json(products);
});

//endpoint untuk mendapatkan detail produk berdasarkan id
app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

//menjalankan server pada port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Product service is running on port ${PORT}`);
});

//cara kedua
//app.listen(3000, () => console.log('Product service is running on port 3000'));

//latihan 30 menit
//1 .implementasi ke flutter agar bisa akses data produk dari service ini dan detail
//2. template di pflutter nya agar bisa menampung produk dan cart 2 button