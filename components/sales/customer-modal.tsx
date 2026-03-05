import { Field, FieldGroup } from '../ui/field'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useState } from 'react'
import { SearchInput } from './search-input'
import { Button } from '../ui/button'
import { SalesActionsDialog } from './sales-actions-modal'
import { DateOfBirthInput } from '../date-of-birth-input'
import { Textarea } from '../ui/textarea'

const users = [
    {
        id: "1",
        name: "John Doe",
        contact: "8888888888"
    },
    {
        id: "2",
        name: "Alex Smith",
        contact: "9999999999"
    },
    {
        id: "3",
        name: "Jane Doe",
        contact: "7777777777"
    },
]

export default function CustomerModal({ customer, setCustomer }: { customer: { name: string; contact: string } | null; setCustomer: (customer: { name: string; contact: string }) => void }) {
    const [modalOpen, setModalOpen] = useState(false)

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
                        <div className='flex'>
                            <SearchInput
                                items={users}
                                placeholder="Search users..."
                                inputClassName='md:h-12 flex-1'
                                onSelect={(item) => {
                                    setCustomer(item)
                                }}
                            />
                            <Button
                                type="button"
                                className="w-10 md:h-12"
                                onClick={() => setModalOpen(true)}
                            >
                                +
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
                        console.log("submitted...");
                        // TODO: perform validation/save logic here
                        setModalOpen(false);
                    }}
                >
                    {/* Modal content goes here */}
                    <div className="flex flex-col mt-5">
                        <div className='flex gap-2'>
                            <Input placeholder="Customer Name" className="mb-4 md:h-12" />
                            {/* <Input placeholder="Contact Number" className="mb-4 md:h-12" /> */}
                            <DateOfBirthInput className="mb-4" />
                        </div>
                        <div className='flex gap-2'>
                            <Input placeholder="Contact Number" className="mb-4 md:h-12" />
                            <Input placeholder="Email Address" className="mb-4 md:h-12" />
                        </div>
                        <Textarea placeholder="Address" className="mb-4 md:h-24" />
                    </div>
                </SalesActionsDialog>
            )}
        </>
    )
}
