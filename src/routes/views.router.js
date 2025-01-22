import { Router } from 'express';
import path from 'path';
import fs from 'fs/promises';

const router = Router();
const productsFilePath = path.resolve('src/data/productos.json');

// Ruta para la vista home
router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(productsFilePath, 'utf8');
        const products = JSON.parse(data);
        res.render('home', { products });
    } catch (err) {
        console.error('Error reading products file:', err.message);
        res.status(500).json({ error: 'Failed to read products file' });
    }
});

// Ruta para la vista de productos
router.get('/products', async (req, res) => {
    try {
        const data = await fs.readFile(productsFilePath, 'utf8');
        const products = JSON.parse(data);
        res.render('products', { 
            title: 'Lista de Productos',
            products 
        });
    } catch (err) {
        console.error('Error reading products file:', err.message);
        res.status(500).json({ error: 'Failed to load products' });
    }
});

// Ruta para la vista de productos en tiempo real
router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts');
});

export default router;
