import express from 'express';
import productsRouter from './src/routes/products.router.js';
import cartsRouter from './src/routes/carts.router.js';
import viewsRouter from './src/routes/views.router.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import exphbs from 'express-handlebars';
import fs from 'fs/promises';

const app = express();
const PORT = 8080;

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = createServer(app);
const io = new Server(server);

app.use('/api', productsRouter);
app.use('/api', cartsRouter);
app.use('/', viewsRouter);

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Emitir la lista de productos al nuevo cliente
    socket.on('getProducts', async () => {
        try {
            const data = await fs.readFile('data/productos.json', 'utf8');
            const products = data ? JSON.parse(data) : [];
            socket.emit('updateProducts', products);
        } catch (err) {
            console.error(err);
        }
    });

    // Escuchar evento para agregar producto
    socket.on('addProduct', async (product) => {
        try {
            const data = await fs.readFile('data/productos.json', 'utf8');
            const products = data ? JSON.parse(data) : [];
            const newProduct = {
                id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
                ...product
            };
            products.push(newProduct);
            await fs.writeFile('data/productos.json', JSON.stringify(products, null, 2));
            io.emit('updateProducts', products); // Emitir a todos los clientes
        } catch (err) {
            console.error(err);
        }
    });
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
