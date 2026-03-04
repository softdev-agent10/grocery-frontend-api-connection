"use client";

import React from "react";
import { CartItemType } from "@/components/sales/cart-items";

interface InvoiceProps {
    items: CartItemType[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    cashGiven: number;
    change: number;
    customerName?: string;
    date: Date;
}

export default function Invoice({
    items,
    subtotal,
    taxAmount,
    discountAmount,
    total,
    cashGiven,
    change,
    customerName,
    date
}: InvoiceProps) {
    return (
        <div 
            id="pos-invoice"
            style={{ 
                fontFamily: "'Courier New', Courier, monospace", 
                width: "300px", 
                padding: "10px", 
                border: "1px solid #ccc", 
                fontSize: "14px",
                color: "#000",
                backgroundColor: "#fff"
            }}
        >
            <h2 style={{ textAlign: "center", margin: "0 0 5px 0" }}>DESI POS</h2>
            <p style={{ textAlign: "center", margin: "0" }}>123 Grocery Lane, City</p>
            <p style={{ textAlign: "center", margin: "0 0 10px 0" }}>Phone: 555-0199</p>
            
            <hr style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />
            
            <p style={{ margin: "5px 0" }}>Date: {date.toLocaleString()}</p>
            <p style={{ margin: "5px 0" }}>Customer: {customerName || 'Guest'}</p>
            
            <hr style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />
            
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "left" }}>Item</th>
                        <th style={{ textAlign: "right" }}>Qty</th>
                        <th style={{ textAlign: "right" }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            <td style={{ padding: "2px 0" }}>{item.name}</td>
                            <td style={{ textAlign: "right", padding: "2px 0" }}>{item.qty}</td>
                            <td style={{ textAlign: "right", padding: "2px 0" }}>${(item.price * item.qty).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <hr style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", margin: "5px 0" }}>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "5px 0" }}>
                <span>Tax:</span>
                <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "5px 0" }}>
                <span>Discount:</span>
                <span>${discountAmount.toFixed(2)}</span>
            </div>
            
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                fontWeight: "bold", 
                fontSize: "18px", 
                margin: "10px 0" 
            }}>
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
            </div>
            
            <hr style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", margin: "5px 0" }}>
                <span>Cash Given:</span>
                <span>${cashGiven.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "5px 0" }}>
                <span>Change:</span>
                <span>${change.toFixed(2)}</span>
            </div>
            
            <hr style={{ borderTop: "1px dashed #000", margin: "10px 0" }} />
            
            <p style={{ textAlign: "center", fontWeight: "bold", marginTop: "15px" }}>
                THANK YOU!
            </p>
        </div>
    );
}

/**
 * Helper function to generate HTML string for printing
 */
export const getInvoiceHtml = (props: InvoiceProps) => {
    const itemsHtml = props.items.map(item => `
        <tr>
            <td style="padding: 2px 0;">${item.name}</td>
            <td style="text-align: right; padding: 2px 0;">${item.qty}</td>
            <td style="text-align: right; padding: 2px 0;">$${(item.price * item.qty).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: 'Courier New', Courier, monospace; width: 300px; padding: 10px; border: 1px solid #ccc; font-size: 14px; color: #000; background-color: #fff;">
            <h2 style="text-align: center; margin: 0 0 5px 0;">GROCERY STORE</h2>
            <p style="text-align: center; margin: 0;">123 Grocery Lane, City</p>
            <p style="text-align: center; margin: 0 0 10px 0;">Phone: 555-0199</p>
            <hr style="border-top: 1px dashed #000; margin: 10px 0;"/>
            <p style="margin: 5px 0;">Date: ${props.date.toLocaleString()}</p>
            <p style="margin: 5px 0;">Customer: ${props.customerName || 'Guest'}</p>
            <hr style="border-top: 1px dashed #000; margin: 10px 0;"/>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: left;">Item</th>
                        <th style="text-align: right;">Qty</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            <hr style="border-top: 1px dashed #000; margin: 10px 0;"/>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>Subtotal:</span>
                <span>$${props.subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>Tax:</span>
                <span>$${props.taxAmount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>Discount:</span>
                <span>$${props.discountAmount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin: 10px 0;">
                <span>TOTAL:</span>
                <span>$${props.total.toFixed(2)}</span>
            </div>
            <hr style="border-top: 1px dashed #000; margin: 10px 0;"/>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>Cash Given:</span>
                <span>$${props.cashGiven.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>Change:</span>
                <span>$${props.change.toFixed(2)}</span>
            </div>
            <hr style="border-top: 1px dashed #000; margin: 10px 0;"/>
            <p style="text-align: center; font-weight: bold; margin-top: 15px;">THANK YOU FOR YOUR BUSINESS!</p>
        </div>
    `;
};
