import { Boxes, Package, Filter } from 'lucide-react';

interface CategoriesStatsProps {
    pageCount: number;
    productCount: number;
    totalCount: number;
}

export function CategoriesStats({ pageCount, productCount, totalCount }: CategoriesStatsProps) {
    return (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-300 transition-transform duration-300">
                <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><Boxes size={24} /></div>
                <div><p className="text-xs font-bold text-slate-500 uppercase">Departments on Page</p><p className="text-2xl font-black text-slate-800">{pageCount}</p></div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-300 transition-transform duration-300">
                <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600"><Package size={24} /></div>
                <div><p className="text-xs font-bold text-slate-500 uppercase">Products on Page</p><p className="text-2xl font-black text-slate-800">{productCount}</p></div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-300 transition-transform duration-300">
                <div className="bg-amber-100 p-3 rounded-xl text-amber-600"><Filter size={24} /></div>
                <div><p className="text-xs font-bold text-slate-500 uppercase">Total Departments</p><p className="text-2xl font-black text-slate-800">{totalCount}</p></div>
            </div>
        </div>
    );
}