//import ProductItem from "./ProductItem";
import { api } from "../api/index";
import { useEffect, useState } from "react";

export default function ProductsList({onEdit, onDelete}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProducts = async ()=> {
        try {
            setLoading(true);
            setError(null);
            console.log(`Trying to load products list`);
            const data = await api.getProducts();
            setProducts(data);
        } catch (err) {
            console.log(err);
            setError("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=> {
        loadProducts();
    }, []);

    if (loading) {
        return <div className="loading">Loading products...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!products.length) {
        return <div className="empty">There are no products yet</div>;
    }

    return (
        <div className="list">
        {products.map((p) => (
            <div key={p.id}>
            <p>#{p.title}</p>
                </div>
        ))}
        </div>
    )
}
