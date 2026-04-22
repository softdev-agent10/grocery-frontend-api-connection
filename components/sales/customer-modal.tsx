import { Field, FieldGroup } from '../ui/field'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { SearchInput } from './search-input'
import { Button } from '../ui/button'
import { SalesActionsDialog } from './sales-actions-modal'
import { DateOfBirthInput } from '../date-of-birth-input'
import { Textarea } from '../ui/textarea'
import { useEffect, useState } from 'react'
import { getCustomers, createCustomer } from '@/app/services/customer/service.customer'
import { m } from 'framer-motion'




export default function CustomerModal({ customer, setCustomer }: { customer: { name: string; contact: string } | null; setCustomer: (customer: { name: string; contact: string }) => void }) {
    const [customers, setCustomers] = useState<unknown[]>([]);
    const [modalOpen, setModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: "", dob: "", contact: "", email: "", address: "" })

    // api coinnect
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await getCustomers({
                    merchant_id: 9,
                    branchId: "1234567890",
                    token: "123456"
                });

                const items = res?.data?.items || [];

                const formatted = items.map((item: any) => ({
                    id: item.id?.toString(),
                    name: item.name,
                    contact: item.phone_number || "",
                }));

                setCustomers(formatted);
            } catch (err) {
                console.error(err);
            }
        };

        fetchCustomers();
    }, []);

    // helper function for validation
    const validateCustomer = () => {
    const name = formData.name.trim();
    const contact = formData.contact.trim();
    const email = formData.email?.trim();

    if (!name || name.length < 2) {
        return "Name must be at least 2 characters";
    }

    if (!contact) {
        return "Contact number is required";
    }

    // Bangladesh-style validation (adjust if needed)
    const phoneRegex = /$/;
    if (!phoneRegex.test(contact)) {
        return "Enter a valid Bangladeshi phone number (01XXXXXXXXX)";
    }

    if (email) {
        const emailRegex = /$/;
        if (!emailRegex.test(email)) {
            return "Invalid email address";
        }
    }

    return null;
};

    const handleSaveCustomer = async () => {
    const error = validateCustomer();

    if (error) {
        alert(error);
        return;
    }

    try {
        const payload = {
            name: formData.name.trim(),
            phone_number: formData.contact.trim(),
            email: formData.email?.trim() || null,
            address: formData.address?.trim() || null,
        };

        const res = await createCustomer({
            merchant_id: 9,
             branchId: "1234567890",
            data: payload,
            token: "123456",
        });

        const created = res?.data;

        if (!created?.id) {
            throw new Error("Customer creation failed");
        }

        const newCustomer = {
            id: created.id.toString(),
            name: created.name,
            contact: created.phone_number,
        };

        setCustomers((prev) => [newCustomer, ...prev]);
        setCustomer(newCustomer);

        setFormData({
            name: "",
            dob: "",
            contact: "",
            email: "",
            address: "",
        });

        setModalOpen(false);

    } catch (error) {
        console.error("Create customer error:", error);
        alert("Failed to create customer. Please try again.");
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
                        {/* <Input
                        className="md:h-12"
                        id="contact"
                        name="contact"
                        placeholder="452XXXXXXX"
                    /> */}
                        <div className='flex gap-2'>
                            <SearchInput
                                items={customers}
                                placeholder="Search users..."
                                inputClassName='md:h-12 flex-1'
                                onSelect={(item) => {
                                    setCustomer(item)
                                }}
                            />
                            <Button
                                type="button"
                                className="w-36 md:h-12"
                                onClick={() => setModalOpen(true)}
                            >
                                + Add Customer
                            </Button>
                        </div>
                    </Field>
                    {/* <Field>
                        <Label htmlFor="username" className="md:text-2xl">
                            Full Name
                        </Label>
                        <Input
                            className="md:h-12"
                            id="username"
                            name="full_name"
                            placeholder="John Doe"
                            value={customer?.name || ""}
                            readOnly
                        />
                    </Field> */}
                </FieldGroup>
            </div>
            {modalOpen && (
                <SalesActionsDialog
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    title="Add New Customer"
                    className='sm:max-w-1/2'
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveCustomer();
                    }}
                >
                    {/* Modal content goes here */}
                    <div className="flex flex-col mt-5">
                        <div className='flex gap-2'>
                            <Input
                                placeholder="Customer Name"
                                className="mb-4 md:h-12"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <DateOfBirthInput
                                className="mb-4"
                                onChange={(date: string) => setFormData({ ...formData, dob: date })}
                            />
                        </div>
                        <div className='flex gap-2'>
                            <Input
                                placeholder="Contact Number"
                                className="mb-4 md:h-12"
                                value={formData.contact}
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            />
                            <Input
                                placeholder="Email Address"
                                className="mb-4 md:h-12"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <Textarea
                            placeholder="Address"
                            className="mb-4 md:h-24"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                </SalesActionsDialog>
            )}
        </>
    )
}
