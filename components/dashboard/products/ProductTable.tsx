// components/dashboard/products/ProductTable.tsx
import { motion } from 'framer-motion';
import { Eye, AlertCircle } from 'lucide-react';
import { EditButton, DeleteButton } from '@/components/toolbar-buttons';
import SkeletonTable from '@/components/dashboard/SkeletonTable/SkeletonTable';

interface Product {
    id: number;
    name: string;
    upc: string;
    plu: string | null;
    category: { name: string };
    brand: { name: string };
    selling_price: string;
    quantity: number;
    in_stock: boolean;
}

interface TableViewColumns {
    checkbox: boolean;
    name: boolean;
    upc: boolean;
    plu: boolean;
    category: boolean;
    brand: boolean;
    selling_price: boolean;
    quantity: boolean;
    in_stock: boolean;
}

interface ProductTableProps {
    products: Product[];
    loading: boolean;
    visibleColumns: TableViewColumns;
    selectedIds: number[];
    onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectOne: (id: number) => void;
    onViewDetails: (product: Product) => void;
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
    itemsPerPage: number;
}

export function ProductTable({
    products,
    loading,
    visibleColumns,
    selectedIds,
    onSelectAll,
    onSelectOne,
    onViewDetails,
    onEdit,
    onDelete,
    itemsPerPage,
}: ProductTableProps) {
    if (loading) {
        return (
            <div className="overflow-x-auto rounded-2xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-blue-600">
                        <tr>
                            {visibleColumns.checkbox && <th className="p-6 w-12"></th>}
                            {visibleColumns.name && <th className="p-6">Product Name</th>}
                            {visibleColumns.upc && <th className="p-6">UPC</th>}
                            {visibleColumns.plu && <th className="p-6">PLU</th>}
                            {visibleColumns.category && <th className="p-6">Category</th>}
                            {visibleColumns.brand && <th className="p-6">Brand</th>}
                            {visibleColumns.selling_price && <th className="p-6">Selling Price</th>}
                            {visibleColumns.quantity && <th className="p-6 text-center">Quantity</th>}
                            {visibleColumns.in_stock && <th className="p-6">Status</th>}
                            <th className="p-6 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <SkeletonTable
                            rows={products.length || itemsPerPage}
                            columns={Object.values(visibleColumns).filter(Boolean).length + 1}
                            showCheckbox={visibleColumns.checkbox}
                        />
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-blue-600 border-b border-slate-100">
                        {visibleColumns.checkbox && (
                            <th className="p-6 w-12">
                                <div className="flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-lg bg-blue-600 border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        checked={products.length > 0 && selectedIds.length === products.length}
                                        onChange={onSelectAll}
                                    />
                                </div>
                            </th>
                        )}
                        {visibleColumns.name && <th className="p-6 font-bold text-xs uppercase tracking-widest text-white">Product Name</th>}
                        {visibleColumns.upc && <th className="p-6 font-bold text-xs uppercase tracking-widest text-white">UPC</th>}
                        {visibleColumns.plu && <th className="p-6 font-bold text-xs uppercase tracking-widest text-white">PLU</th>}
                        {visibleColumns.category && <th className="p-6 font-bold text-xs uppercase tracking-widest text-white">Category</th>}
                        {visibleColumns.brand && <th className="p-6 font-bold text-xs uppercase tracking-widest text-white">Brand</th>}
                        {visibleColumns.selling_price && <th className="p-6 font-bold text-xs uppercase tracking-widest text-white">Selling Price</th>}
                        {visibleColumns.quantity && <th className="p-6 font-bold text-xs uppercase tracking-widest text-white text-center">Quantity</th>}
                        {visibleColumns.in_stock && <th className="p-6 font-bold text-xs uppercase tracking-widest text-white">Status</th>}
                        <th className="p-6 font-bold text-xs uppercase tracking-widest text-white text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {products.length > 0 ? (
                        products.map((product, index) => (
                            <motion.tr
                                key={product.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-blue-50/30 transition-colors group"
                            >
                                {visibleColumns.checkbox && (
                                    <td className="p-6">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={selectedIds.includes(product.id)}
                                                onChange={() => onSelectOne(product.id)}
                                            />
                                        </div>
                                    </td>
                                )}
                                {visibleColumns.name && (
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{product.name}</span>
                                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">ID: #{product.id.toString().padStart(4, '0')}</span>
                                        </div>
                                    </td>
                                )}
                                {visibleColumns.upc && <td className="p-6 text-slate-600 font-mono text-md">{product.upc}</td>}
                                {visibleColumns.plu && <td className="p-6 text-slate-600 font-mono text-md">{product.plu || '-'}</td>}
                                {visibleColumns.category && (
                                    <td className="p-6">
                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                                            {product.category.name}
                                        </span>
                                    </td>
                                )}
                                {visibleColumns.brand && <td className="p-6 text-slate-600 font-medium">{product.brand.name}</td>}
                                {visibleColumns.selling_price && <td className="p-6 font-black text-slate-900">{product.selling_price}</td>}
                                {visibleColumns.quantity && (
                                    <td className="p-6 text-center">
                                        <span className={`font-bold ${product.quantity < 5 ? 'text-red-500' : 'text-slate-700'}`}>
                                            {product.quantity.toFixed(2)}
                                        </span>
                                    </td>
                                )}
                                {visibleColumns.in_stock && (
                                    <td className="p-6">
                                        <div
                                            className={`flex items-center justify-center rounded-full px-1 py-1 border gap-2 text-xs ${product.in_stock
                                                ? 'bg-green-100 border-green-200 text-green-900'
                                                : 'bg-red-100 border-red-200 text-red-900'
                                                }`}
                                        >
                                            <p className="text-wrap text-center">{product.in_stock ? 'In Stock' : 'Out of Stock'}</p>
                                        </div>
                                    </td>
                                )}
                                <td className="p-6">
                                    <div className="flex justify-center items-center gap-3">
                                        <div className="bg-slate-200 rounded-full p-2 w-10 h-10 flex items-center justify-center group-hover:opacity-100 transition-opacity">
                                            <motion.button
                                                whileHover={{ scale: 1.2, rotate: 5 }}
                                                className="text-slate-400 hover:text-blue-500 transition-colors"
                                                onClick={() => onViewDetails(product)}
                                            >
                                                <Eye size={25} />
                                            </motion.button>
                                        </div>
                                        <div className="bg-slate-200 rounded-full p-2 w-10 h-10 flex items-center justify-center">
                                            <EditButton onClick={() => onEdit(product)} variant="icon" size="lg" />
                                        </div>
                                        <div className="bg-slate-200 rounded-full p-2 w-10 h-10 flex items-center justify-center">
                                            <DeleteButton onClick={() => onDelete(product.id)} variant="icon" size="lg" />
                                        </div>
                                    </div>
                                </td>
                            </motion.tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={11} className="p-20 text-center">
                                <div className="flex flex-col items-center gap-4 text-slate-400">
                                    <AlertCircle size={48} strokeWidth={1} />
                                    <p className="text-lg font-medium italic">No products found matching your search.</p>
                                    <button
                                        onClick={() => {
                                            // Reset filters handled by parent
                                        }}
                                        className="text-blue-600 font-bold hover:underline"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ProductTable;