"use client"

import { useState } from "react"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"

export type Items = {
    id: string
    name: string
}

export function SearchInput<T extends Items>({
    items,
    onSelect,
    placeholder = "Search items...",
    inputClassName,
}: {
    items: T[]
    onSelect: (item: T) => void
    placeholder?: string
    inputClassName?: string
}) {
    const [inputValue, setInputValue] = useState<string>("")

    const filteredItems = items.filter((i) =>
        i.name.toLowerCase().includes((inputValue ?? "").toLowerCase())
    )

    return (
        <Combobox
            onValueChange={(val) => {
                const str = (val ?? "") as string
                setInputValue(str)

                const selected = items.find((item) => item.name === str)
                if (selected) onSelect(selected)
            }}
        >
            <ComboboxInput
                className={inputClassName}
                placeholder={placeholder}
                showClear
                value={inputValue ?? ""}
                onChange={(e) => setInputValue(e.target.value)}
            />
            <ComboboxContent>
                {inputValue !== "" && filteredItems.length === 0 && (
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                )}
                <ComboboxList>
                    {filteredItems.map((item) => (
                        <ComboboxItem
                            key={item.id}
                            value={item.name}
                            onClick={() => onSelect(item)}
                        >
                            {item.name}
                        </ComboboxItem>
                    ))}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}