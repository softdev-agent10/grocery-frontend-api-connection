import { useState } from "react";
import { Field, FieldGroup } from "../ui/field";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { getCustomers } from "@/app/services/customer/service.customer";

export default function MembershipModal() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (value: string) => {
        setQuery(value);

        if (!value || value.trim().length < 2) {
            setResults([]);
            return;
        }

        try {
            setLoading(true);

            const res = await getCustomers({
                branchId: "1234567890",
                token: "123456",
            });

            const items = res?.data?.items || [];

            const filtered = items.filter((c: any) => {
                const name = c.name?.toLowerCase() || "";
                const card = c.card_number?.toLowerCase() || "";
                const q = value.toLowerCase();

                return name.includes(q) || card.includes(q);
            });

            setResults(filtered);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <FieldGroup className="gap-4 my-4">
            <Field>
                <Label htmlFor="search" className="md:text-2xl">
                    Member Name or Card Number <span className="text-red-600">*</span>
                </Label>

                <Input
                    id="search"
                    name="search"
                    placeholder="Search by name or card number..."
                    className="md:h-12"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                />

                {/* Results */}
                {results.length > 0 && (
                    <div className="border mt-2 rounded-md bg-white shadow max-h-60 overflow-auto">
                        {results.map((user) => (
                            <div
                                key={user.id}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    setQuery(`${user.name} - ${user.card_number}`);
                                    setResults([]);
                                }}
                            >
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">
                                    {user.card_number}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {loading && (
                    <p className="text-sm text-gray-500 mt-1">Searching...</p>
                )}
            </Field>
        </FieldGroup>
    );
}