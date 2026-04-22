import { useState, useEffect } from 'react';
import { Field, FieldGroup } from '../ui/field';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { SearchInput } from './search-input';
import { Button } from '../ui/button';
import { SalesActionsDialog } from './sales-actions-modal';
import { DateOfBirthInput } from '../date-of-birth-input';
import { Textarea } from '../ui/textarea';
import { getCustomers, createCustomer, validateCustomer } from '@/app/services/customer/service.customer';
import { apiClient } from '@/lib/apiClient';

interface CustomerModalProps {
    customer: { name: string; contact: string; id?: string } | null;
    setCustomer: (customer: { name: string; contact: string; id?: string }) => void;
}

export default function CustomerModal({ customer, setCustomer }: CustomerModalProps) {
    const [customers, setCustomers] = useState<{ id: string; name: string; contact: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", contact: "", email: "", address: "" });

    // Initialize ApiClient with your merchant context
    useEffect(() => {
        // Set your actual merchant context here
        apiClient.setContext("1", "511020165504577", "your-token-here");
    }, []);

    // Fetch customers
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setIsLoading(true);
                const res = await getCustomers({ limit: 50 });
                console.log("API Response:", res); // Debug: See what the API returns
                
                // Handle different response structures
                let items = [];
                if (res?.data?.items) {
                    items = res.data.items;
                } else if (res?.data && Array.isArray(res.data)) {
                    items = res.data;
                } else if (Array.isArray(res)) {
                    items = res;
                }
                
                const formatted = items.map((item: any) => ({
                    id: item.id?.toString() || "",
                    name: item.name || "",
                    contact: item.phone_number || item.contact || "",
                }));
                setCustomers(formatted);
            } catch (err) {
                console.error("Failed to fetch customers:", err);
                setError("Failed to load customers");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const handleSaveCustomer = async () => {
        // Validate
        const validationError = validateCustomer(formData);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await createCustomer({
                name: formData.name.trim(),
                phone_number: formData.contact.trim(),
                email: formData.email.trim() || null,
                address: formData.address.trim() || null,
            });

            console.log("Create response:", res); // Debug: See what the API returns
            
            const newCustomer = res?.data;
            if (newCustomer) {
                const formattedCustomer = {
                    id: newCustomer.id?.toString() || Date.now().toString(),
                    name: newCustomer.name,
                    contact: newCustomer.phone_number || "",
                };
                
                setCustomers(prev => [formattedCustomer, ...prev]);
                setCustomer(formattedCustomer);
                setFormData({ name: "", contact: "", email: "", address: "" });
                setModalOpen(false);
            } else {
                throw new Error("No data returned from API");
            }
        } catch (err) {
            console.error("Create customer error:", err);
            setError("Failed to create customer");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div>
                <FieldGroup className="gap-4 my-4">
                    <Field>
                        <Label htmlFor="contact" className="md:text-2xl">
                            Member Card or Contact <span className="text-red-600">*</span>
                        </Label>
                        <div className='flex gap-2'>
                            <SearchInput
                                items={customers}
                                placeholder="Search users..."
                                inputClassName='md:h-12 flex-1'
                                onSelect={(item) => setCustomer(item)}
                                isLoading={isLoading}
                            />
                            <Button
                                type="button"
                                className="w-36 md:h-12"
                                onClick={() => setModalOpen(true)}
                                disabled={isLoading}
                            >
                                + Add Customer
                            </Button>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </Field>
                </FieldGroup>
            </div>

            {modalOpen && (
                <SalesActionsDialog
                    open={modalOpen}
                    onOpenChange={() => {
                        setModalOpen(false);
                        setFormData({ name: "", contact: "", email: "", address: "" });
                        setError(null);
                    }}
                    title="Add New Customer"
                    className='sm:max-w-1/2'
                    onSubmit={(e: React.FormEvent) => {
                        e.preventDefault();
                        handleSaveCustomer();
                    }}
                >
                    <div className="flex flex-col mt-5">
                        {error && (
                            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                                {error}
                            </div>
                        )}
                        <div className='flex gap-2'>
                            <Input
                                placeholder="Customer Name"
                                className="mb-4 md:h-12"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={isLoading}
                            />
                            <DateOfBirthInput
                                className="mb-4"
                                onChange={(date: string) => console.log("DOB:", date)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className='flex gap-2'>
                            <Input
                                placeholder="Contact Number"
                                className="mb-4 md:h-12"
                                value={formData.contact}
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                disabled={isLoading}
                            />
                            <Input
                                placeholder="Email Address"
                                type="email"
                                className="mb-4 md:h-12"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>
                        <Textarea
                            placeholder="Address"
                            className="mb-4 md:h-24"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            disabled={isLoading}
                        />
                    </div>
                </SalesActionsDialog>
            )}
        </>
    );
}