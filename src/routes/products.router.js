import { Router } from 'express';
import ProductsManager from '../managers/ProductsManager.js';

const router = Router();

// Ruta para leer todos los productos
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit);
        const products = await ProductsManager.getAllProducts();

        if (limit) {
            res.json(products.slice(0, limit));
        } else {
            res.json(products);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ruta para leer un producto por su ID
router.get('/:pid', async (req, res) => {
    const id = parseInt(req.params.pid);

    try {
        const product = await ProductsManager.getProductById(id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ruta para agregar un nuevo producto
router.post('/', async (req, res) => {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'All fields are required except thumbnails' });
    }

    try {
        const newProduct = await ProductsManager.addProduct({
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        });

        // Emitir evento de WebSocket
        req.app.get('io').emit('updateProducts', await ProductsManager.getAllProducts());

        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ruta para actualizar un producto
router.put('/:pid', async (req, res) => {
    const id = parseInt(req.params.pid);
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    try {
        const updatedProduct = await ProductsManager.updateProduct(id, {
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        });

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Emitir evento de WebSocket
        req.app.get('io').emit('updateProducts', await ProductsManager.getAllProducts());

        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ruta para eliminar un producto
router.delete('/:pid', async (req, res) => {
    const id = parseInt(req.params.pid);

    try {
        const deleted = await ProductsManager.deleteProduct(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Emitir evento de WebSocket
        req.app.get('io').emit('updateProducts', await ProductsManager.getAllProducts());

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
