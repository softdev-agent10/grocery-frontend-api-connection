import { Field, FieldGroup } from '../ui/field'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

export default function LoyaltyModal() {
    return (
            <FieldGroup className="gap-4 my-4">
                <Field>
                    <Label htmlFor="name-1" className="md:text-2xl">Card or Contact Number<span className='text-red-600'>*</span></Label>
                    <Input id="name-1" name="contact" placeholder='452XXXXXXX' className="md:h-12"/>
                </Field>
            </FieldGroup>
    )
}
