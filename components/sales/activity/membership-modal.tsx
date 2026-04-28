"use client";

import { useState } from "react";
import { Field, FieldGroup } from "../../ui/field";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  getCustomers,
  Customer,
} from "@/app/services/customer/service.customer";

export default function MembershipModal() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleSearch = async (value: string) => {
    setQuery(value);
    setSelectedCustomer(null);

    if (!value || value.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);

      const res = await getCustomers({
        page: 1,
        limit: 20,
        search: value.trim(),
      });

      const items = (res?.data?.items || []).filter((c) => c.is_active);
      setResults(items);
    } catch (err) {
      console.error("Customer search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setQuery(customer.name);
    setResults([]);
  };

  return (
    <FieldGroup className="my-4 gap-4">
      <Field>
        <Label htmlFor="search" className="md:text-2xl">
          Member Name / Phone / Email <span className="text-red-600">*</span>
        </Label>

        <Input
          id="search"
          name="search"
          placeholder="Search by name, phone, or email..."
          className="md:h-12"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />

        {loading && (
          <p className="mt-1 text-sm text-gray-500">Searching...</p>
        )}

        {!loading && results.length > 0 && (
          <div className="mt-2 max-h-60 overflow-auto rounded-md border bg-white shadow">
            {results.map((customer) => (
              <div
                key={customer.id}
                className="cursor-pointer p-3 hover:bg-gray-100"
                onClick={() => handleSelectCustomer(customer)}
              >
                <div className="font-medium">{customer.name}</div>
                <div className="text-sm text-gray-500">
                  {customer.phone_number}
                </div>
                <div className="text-sm text-gray-500">
                  {customer.email}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && query.trim().length >= 2 && results.length === 0 && (
          <p className="mt-1 text-sm text-gray-500">No member found.</p>
        )}
      </Field>

      {selectedCustomer && (
        <div className="rounded-md border bg-gray-50 p-4">
          <h3 className="mb-2 font-semibold">Selected Member</h3>
          <p><span className="font-medium">Name:</span> {selectedCustomer.name}</p>
          <p><span className="font-medium">Phone:</span> {selectedCustomer.phone_number}</p>
          <p><span className="font-medium">Email:</span> {selectedCustomer.email}</p>
          <p><span className="font-medium">Address:</span> {selectedCustomer.address}</p>
        </div>
      )}
    </FieldGroup>
  );
}