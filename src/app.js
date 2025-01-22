import express from 'express';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import path from 'path';
import ProductsManager from './managers/ProductsManager.js';

const app = express();
const PORT = 8080;

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.resolve('src/views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve('src/public')));

// Configuración de rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// Configuración de servidor con WebSocket
const server = createServer(app);
const io = new Server(server);

// Hacer que la instancia de io esté disponible en app
app.set('io', io);

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Evento para obtener productos
    socket.on('getProducts', async () => {
        try {
            const products = await ProductsManager.getAllProducts();
            socket.emit('updateProducts', products);
        } catch (err) {
            console.error('Error fetching products:', err.message);
        }
    });

    // Evento para eliminar un producto
    socket.on('deleteProduct', async (productId) => {
        await ProductsManager.deleteProduct(productId);
        const products = await ProductsManager.getAllProducts();
        io.emit('updateProducts', products);
    });

    // Evento para agregar un producto
    socket.on('addProduct', async (product) => {
        console.log('Intentando agregar producto:', product); // Log para depuración
        await ProductsManager.addProduct(product);
        const products = await ProductsManager.getAllProducts();
        io.emit('updateProducts', products);
    });
});

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
