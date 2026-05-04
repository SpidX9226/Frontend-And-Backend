import ProductItem from "./ProductItem";

/**
 * @param products this is a list of products
 * @param onEdit this is a method that edits a product
 * @param onDelete this is a handler for delete event
 * @returns JSX markup
 */
export default function ProductsList({products, onEdit, onDelete}) {
    if (!products.length) {
        return <div className="empty"> There is no products yet </div>
    }

    return (
        <div className="list">
            {
                products.map((p) => (
                    <ProductItem key={p.id} product={p} onEdit={onEdit} onDelete={onDelete} />
                ))
            }
        </div>
    );
}