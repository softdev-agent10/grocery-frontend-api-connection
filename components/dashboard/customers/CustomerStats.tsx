// import { StatCard } from "../StatCard";
import { StatCard } from "@/app/dashboard/tools/components/StatCard";
import { Users, CheckCircle2, XCircle, Phone } from "lucide-react";

interface CustomerStatsProps {
    total: number;
    active: number;
    inactive: number;
    contactRequired: number;
}

export function CustomerStats({ total, active, inactive, contactRequired }: CustomerStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                icon={<Users size={24} />}
                label="Total Customers"
                value={total}
                change={{ value: 15, direction: "up" }}
                color="blue"
            />
            <StatCard
                icon={<CheckCircle2 size={24} />}
                label="Active Customers"
                value={active}
                color="green"
            />
            <StatCard
                icon={<XCircle size={24} />}
                label="Inactive"
                value={inactive}
                color="orange"
            />
            <StatCard
                icon={<Phone size={24} />}
                label="Contact Required"
                value={contactRequired}
                color="purple"
            />
        </div>
    );
}