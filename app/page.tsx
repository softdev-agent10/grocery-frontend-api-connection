import { redirect } from "next/navigation";

export default function Home() {
  return redirect("/login");
}

// export default function Home() {
//   return (
//     <div className="relative min-h-screen overflow-hidden">
//       {/* Background pattern */}
//       <div className="absolute inset-0 bg-grid-zinc-900/[0.02] dark:bg-grid-zinc-100/[0.02]"></div>
      
//       <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
//         {/* Welcome card */}
//         <div className="w-full max-w-2xl text-center">
//           <h1 className="mb-4 text-6xl font-black tracking-tight">
//             <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//               OneBalance
//             </span>
//           </h1>
          
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <a
//               href="/sales"
//               className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
//             >
//               Go to Sales
//             </a>
            
//             <a
//               href="/dashboard"
//               className="rounded-lg border-2 border-zinc-300 dark:border-zinc-700 px-8 py-4 font-semibold hover:border-purple-600 transition-all hover:scale-105"
//             >
//               Go to Dashboard
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }