"use client"

import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

export default function CashInForm() {
    return (
        <div className="flex flex-col mt-5">
            <div className='flex gap-2'>
                <Input 
                    placeholder="Cash In Amount" 
                    type="number" 
                    step="0.01" 
                    className="mb-4 md:h-12" 
                    required 
                    autoFocus 
                    name="amount" 
                />
            </div>
            <Textarea 
                placeholder="Notes" 
                className="mb-4 md:h-32" 
                name="notes" 
            />
        </div>
    )
}
