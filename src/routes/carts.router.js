import { Router } from 'express';
import fs from 'fs/promises';

const router = Router();
const cartsFilePath = 'data/carrito.json';

// Ruta para crear un nuevo carrito
router.post('/carts', async (req, res) => {
    try {
        const data = await fs.readFile(cartsFilePath, 'utf8');
        const carts = data ? JSON.parse(data) : [];
        const newCart = { id: carts.length > 0 ? carts[carts.length - 1].id + 1 : 1, products: [] };
        carts.push(newCart);

        await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
        res.status(201).json(newCart);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create cart' });
    }
});

// Ruta para obtener un carrito por su ID
router.get('/carts/:cid', async (req, res) => {
    const id = parseInt(req.params.cid);

    try {
        const data = await fs.readFile(cartsFilePath, 'utf8');
        const carts = data ? JSON.parse(data) : [];
        const cart = carts.find(cart => cart.id === id);

        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ error: 'Cart not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to read carts file' });
    }
});

// Ruta para agregar un producto al carrito
router.post('/carts/:cid/product/:pid', async (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);

    try {
        const data = await fs.readFile(cartsFilePath, 'utf8');
        const carts = data ? JSON.parse(data) : [];
        const cart = carts.find(cart => cart.id === cartId);

        if (cart) {
            const productIndex = cart.products.findIndex(p => p.product === productId);

            if (productIndex !== -1) {
                // Incrementar la cantidad si el producto ya existe
                cart.products[productIndex].quantity += 1;
            } else {
                // Agregar el producto nuevo
                cart.products.push({ product: productId, quantity: 1 });
            }

            await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
            res.json(cart);
        } else {
            res.status(404).json({ error: 'Cart not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

export default router;
