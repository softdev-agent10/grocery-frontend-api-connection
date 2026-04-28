import { Boxes } from 'lucide-react';

export function CategoriesHeader() {
    return (
        <header className="bg-blue-600 px-6 py-10 flex justify-between items-center shadow-xl relative overflow-hidden rounded-2xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Departments</h1>
                <p className="text-blue-100 mt-2 font-medium tracking-wide">Manage your product hierarchy with precision</p>
            </div>
            <div className="relative z-10 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 shadow-2xl">
                <Boxes size={48} className="text-white" strokeWidth={2} />
            </div>
        </header>
    );
}