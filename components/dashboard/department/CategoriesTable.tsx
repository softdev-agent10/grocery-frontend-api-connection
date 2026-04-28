import { motion } from 'framer-motion';
import { Package, CheckCircle2, X, Edit2, Trash2 } from 'lucide-react';
import { EditButton, DeleteButton } from '@/components/toolbar-buttons';

interface Category {
    id: number;
    name: string;
    description?: string;
    tax_id?: number;
    fee_id?: number;
    product_count?: number;
    is_active: boolean;
    created_at: string;
}

interface CategoriesTableProps {
    categories: Category[];
    selectedIds: Set<number>;
    onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectOne: (id: number) => void;
    onEdit: (category: Category) => void;
    onDelete: (id: number) => void;
    taxes: any[];
    fees: any[];
}

export function CategoriesTable({
    categories,
    selectedIds,
    onSelectAll,
    onSelectOne,
    onEdit,
    onDelete,
    taxes,
    fees,
}: CategoriesTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-blue-600 border-b border-slate-200">
                        <th className="p-5 w-16">
                            <div className="flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    checked={categories.length > 0 && selectedIds.size === categories.length}
                                    onChange={onSelectAll}
                                />
                            </div>
                        </th>
                        <th className="p-5 font-bold text-xs text-white uppercase tracking-widest">Department Name</th>
                        <th className="p-5 font-bold text-xs text-white uppercase tracking-widest">Taxes</th>
                        <th className="p-5 font-bold text-xs text-white uppercase tracking-widest">Fees</th>
                        <th className="p-5 font-bold text-xs text-white uppercase tracking-widest">Products</th>
                        <th className="p-5 font-bold text-xs text-white uppercase tracking-widest">Is Active</th>
                        <th className="p-5 font-bold text-xs text-white uppercase tracking-widest">Created On</th>
                        <th className="p-5 font-bold text-xs text-white uppercase tracking-widest text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {categories.map((category) => (
                        <motion.tr key={category.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group hover:bg-indigo-50/30 transition-colors">
                            <td className="p-5">
                                <div className="flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        checked={selectedIds.has(category.id)}
                                        onChange={() => onSelectOne(category.id)}
                                    />
                                </div>
                            </td>
                            <td className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        {category.name.charAt(0)}
                                    </div>
                                    <span className="font-bold text-slate-800">{category.name}</span>
                                </div>
                            </td>
                            <td className="p-5">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${!category.tax_id ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                                    {!category.tax_id ? 'No tax' : taxes.find(t => t.id === category.tax_id)?.name || 'Unknown'}
                                </span>
                            </td>
                            <td className="p-5">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${!category.fee_id ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                                    {category.fee_id ? fees.find(f => f.id === category.fee_id)?.name : 'No fee'}
                                </span>
                            </td>
                            <td className="p-5">
                                <div className="flex items-center gap-2">
                                    <Package size={14} className="text-slate-400" />
                                    <span className="font-mono font-bold text-slate-700">{category.product_count ?? 0}</span>
                                </div>
                            </td>
                            <td className="p-5">
                                {category.is_active ? (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                        <span className="text-emerald-700 font-bold text-sm">Active</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <X size={14} className="text-red-500" />
                                        <span className="text-red-700 font-bold text-sm">Inactive</span>
                                    </div>
                                )}
                            </td>
                            <td className="p-5 text-slate-500 text-sm font-medium">
                                {new Date(category.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-5">
                                <div className="flex justify-center items-center gap-3">
                                    <div className="bg-slate-200 rounded-full p-2 w-10 h-10 flex items-center justify-center">
                                        <button
                                            onClick={() => onEdit(category)}
                                            disabled={!!category.product_count && category.product_count > 0}
                                            title={category.product_count && category.product_count > 0 ? "Cannot edit category with existing products" : ""}
                                            className="text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                    <div className="bg-slate-200 rounded-full p-2 w-10 h-10 flex items-center justify-center">
                                        <button
                                            onClick={() => onDelete(category.id)}
                                            disabled={!!category.product_count && category.product_count > 0}
                                            title={category.product_count && category.product_count > 0 ? "Cannot delete category with existing products" : ""}
                                            className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}