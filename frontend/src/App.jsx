// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import ProductsList from "./components/ProductsList";

function App() {
    const [products, setProducts] = useState([
        {
        id: 1,
        name: 'Laptop',
        price: 12
        },
        {
        id: 2,
        name: 'MacBook',
        price: 120
        }
    ])

    const handleEdit = (product) => {
        console.log("Editing product: ", product);
    }

    const handleDelete = (productId) => {
        setProducts(products.filter(p => p.id !== productId));
    }

    return (
        <div className="app">
            <ProductsList products={products} onEdit={handleEdit} onDelete={handleDelete}></ProductsList>
        </div>
    )
}

export default App;