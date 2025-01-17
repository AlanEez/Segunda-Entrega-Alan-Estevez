import fs from 'fs/promises';

const productsFilePath = 'src/data/productos.json';

class ProductsManager {
    // Leer el archivo JSON y devolver un array de productos
    async getAllProducts() {
        try {
            const data = await fs.readFile(productsFilePath, 'utf8');
            return data ? JSON.parse(data) : [];
        } catch (err) {
            console.error(`Error leyendo productos desde ${productsFilePath}:`, err);
            throw new Error('No se pudo leer el archivo de productos');
        }
    }

    // Obtener un producto por su ID
    async getProductById(id) {
        try {
            const products = await this.getAllProducts();
            return products.find(product => product.id === id);
        } catch (err) {
            console.error(`Error buscando producto con ID ${id}:`, err);
            throw new Error('No se pudo obtener el producto');
        }
    }

    // Agregar un nuevo producto
    async addProduct(product) {
        const { code } = product;
        try {
            const products = await this.getAllProducts();

            // Validar que el campo "code" sea único
            const duplicateCode = products.find(prod => prod.code === code);
            if (duplicateCode) {
                throw new Error(`El código "${code}" ya está en uso por otro producto`);
            }

            const newProduct = {
                id: products.length > 0 ? products[products.length - 1].id + 1 : 1, 
                ...product
            };

            products.push(newProduct);
            await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
            return newProduct;
        } catch (err) {
            console.error('Error agregando producto:', err);
            throw new Error('No se pudo agregar el producto');
        }
    }

    // Actualizar un producto por su ID
    async updateProduct(id, updatedFields) {
        try {
            const products = await this.getAllProducts();
            const productIndex = products.findIndex(product => product.id === id);

            if (productIndex === -1) {
                return null; // Producto no encontrado
            }

            const updatedProduct = { ...products[productIndex], ...updatedFields };
            products[productIndex] = updatedProduct;

            await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
            return updatedProduct;
        } catch (err) {
            console.error(`Error actualizando producto con ID ${id}:`, err);
            throw new Error('No se pudo actualizar el producto');
        }
    }

    // Eliminar un producto por su ID
    async deleteProduct(id) {
        try {
            const products = await this.getAllProducts();
            const newProducts = products.filter(product => product.id !== id);

            if (newProducts.length === products.length) {
                return false; // Producto no encontrado
            }

            await fs.writeFile(productsFilePath, JSON.stringify(newProducts, null, 2));
            return true; // Producto eliminado
        } catch (err) {
            console.error(`Error eliminando producto con ID ${id}:`, err);
            throw new Error('No se pudo eliminar el producto');
        }
    }
}

export default new ProductsManager();
