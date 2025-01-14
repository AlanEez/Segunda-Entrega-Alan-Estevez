import { Router } from 'express';
import fs from 'fs/promises';

const router = Router();
const productsFilePath = 'data/productos.json';

// Ruta para la vista home
router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(productsFilePath, 'utf8');
        const products = data ? JSON.parse(data) : [];
        res.render('home', { products });
    } catch (err) {
        res.status(500).json({ error: 'Failed to read products file' });
    }
});

// Ruta para la vista de productos en tiempo real
router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts');
});

export default router;
