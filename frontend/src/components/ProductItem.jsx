export default function ProductItem( { product, onEdit, onDelete } ) {
    return (
        <div className="productRow">
            <div className="productMain">
                <div className="productId">#{product.id}</div>
                <div className="productName">{product.name}</div>
                <div className="productPrice">{product.price}</div>
            </div>
            <div className="productActions">
                <button type="button" className="btn" onClick={() => onEdit(product)}>
                    Edit
                </button>
                <button type="button" className="btn btn--danger" onClick={() => onDelete(product.id)}>
                    Delete
                </button>
            </div>
        </div>
    );
}