import { Router } from 'express';
import fs from 'fs/promises';

const router = Router();
const productsFilePath = 'data/productos.json';

// Ruta para leer todos los productos
router.get('/products', async (req, res) => {
    try {
        const data = await fs.readFile(productsFilePath, 'utf8');
        const products = data ? JSON.parse(data) : [];
        const limit = parseInt(req.query.limit);

        if (limit) {
            res.json(products.slice(0, limit));
        } else {
            res.json(products);
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to read products file' });
    }
});

// Ruta para leer un producto por su ID
router.get('/products/:pid', async (req, res) => {
    const id = parseInt(req.params.pid);

    try {
        const data = await fs.readFile(productsFilePath, 'utf8');
        const products = data ? JSON.parse(data) : [];
        const product = products.find(p => p.id === id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to read products file' });
    }
});

// Ruta para agregar un nuevo producto
router.post('/products', async (req, res) => {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'All fields are required except thumbnails' });
    }

    try {
        const data = await fs.readFile(productsFilePath, 'utf8');
        const products = data ? JSON.parse(data) : [];
        const newProduct = {
            id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
            title,
            description,
            code,
            price,
            status, 
            stock,
            category,
            thumbnails
        };

        products.push(newProduct);
        await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save product' });
    }
});

// Ruta para actualizar un producto
router.put('/products/:pid', async (req, res) => {
    const id = parseInt(req.params.pid);
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    try {
        const data = await fs.readFile(productsFilePath, 'utf8');
        const products = data ? JSON.parse(data) : [];
        const productIndex = products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const updatedProduct = { ...products[productIndex], title, description, code, price, status, stock, category, thumbnails };
        products[productIndex] = updatedProduct;

        await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Ruta para eliminar un producto
router.delete('/products/:pid', async (req, res) => {
    const id = parseInt(req.params.pid);

    try {
        const data = await fs.readFile(productsFilePath, 'utf8');
        const products = data ? JSON.parse(data) : [];
        const newProducts = products.filter(p => p.id !== id);

        if (newProducts.length === products.length) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await fs.writeFile(productsFilePath, JSON.stringify(newProducts, null, 2));
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;
