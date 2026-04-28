"use client";

import { CartItemType } from "@/components/sales/cart-items";
import { OrderItem } from "@/components/sales/activity/order-history";
import Image from "next/image";
import Barcode from "react-barcode";
import { renderToStaticMarkup } from "react-dom/server";

interface InvoiceProps {
    items: (CartItemType | OrderItem)[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    cashGiven: number;
    change: number;
    customerName?: string;
    date: Date | string;
    isBasketOnly?: boolean;
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
    date,
    isBasketOnly = false
}: InvoiceProps) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const invoiceId = `INV-${dateObj.getTime()}`;
    return (
        <div 
            id="pos-invoice"
            style={{ 
                fontFamily: "'Courier New', Courier, monospace", 
                width: "72mm", 
                padding: "0", 
                margin: "0",
                fontSize: "10px",
                color: "#000",
                backgroundColor: "#fff",
                lineHeight: "1.2",
                boxSizing: "border-box"
            }}
        >
            <div style={{ padding: "3mm" }}>
                {/* <h2 style={{ textAlign: "center", margin: "0 0 2mm 0", fontSize: "16px", fontWeight: "bold" }}>OneBalance</h2> */}
                <Image src="/assets/logo-light.svg" alt="Grocery Logo" width={200} height={60} style={{ display: "block", margin: "0 auto 2mm auto" }} />
                <p style={{ textAlign: "center", margin: "0" }}>123 Grocery Lane, City</p>
                <p style={{ textAlign: "center", margin: "0 0 4mm 0" }}>Phone: 555-0199</p>
                
                <div style={{ borderTop: "1px dashed #000", margin: "2mm 0" }} />
                
                <p style={{ margin: "1mm 0" }}>Date: {dateObj.toLocaleString()}</p>
                <p style={{ margin: "1mm 0" }}>Customer: {customerName || 'Guest'}</p>
                
                <div style={{ borderTop: "1px dashed #000", margin: "2mm 0" }} />
                
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: "left", paddingBottom: "1mm", width: "30mm" }}>Item</th>
                            <th style={{ textAlign: "right", paddingBottom: "1mm", width: "10mm" }}>Qty</th>
                            <th style={{ textAlign: "right", paddingBottom: "1mm", width: "14mm" }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => {
                            const itemSubtotal = item.price * item.qty;
                            const itemDiscount = item.discountType === "percentage"
                                ? (itemSubtotal * (item.discountValue || 0)) / 100
                                : (item.discountValue || 0);
                            const itemTotal = itemSubtotal - itemDiscount;
                            return (
                                <tr key={item.id}>
                                    <td style={{ padding: "1mm 0", verticalAlign: "top" }}>{item.name}</td>
                                    <td style={{ textAlign: "right", padding: "1mm 0", verticalAlign: "top" }}>{item.qty}</td>
                                    <td style={{ textAlign: "right", padding: "1mm 0", verticalAlign: "top" }}>${itemTotal.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                
                <div style={{ borderTop: "1px dashed #000", margin: "2mm 0" }} />
                
                <div style={{ display: "flex", justifyContent: "space-between", margin: "1mm 0" }}>
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "1mm 0" }}>
                    <span>Tax:</span>
                    <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "1mm 0" }}>
                    <span>Discount:</span>
                    <span>${discountAmount.toFixed(2)}</span>
                </div>
                
                <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    fontWeight: "bold", 
                    fontSize: "14px", 
                    margin: "2mm 0" 
                }}>
                    <span>TOTAL:</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                
                <div style={{ borderTop: "1px dashed #000", margin: "2mm 0" }} />
                
                {!isBasketOnly && (
                    <>
                        <div style={{ display: "flex", justifyContent: "space-between", margin: "1mm 0" }}>
                            <span>Cash Given:</span>
                            <span>${cashGiven.toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", margin: "1mm 0" }}>
                            <span>Change:</span>
                            <span>${change.toFixed(2)}</span>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "center", marginTop: "2mm", marginBottom: "2mm" }}>
                            <div style={{ width: "74mm", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Barcode value={invoiceId} displayValue={false} width={1} height={50} format="CODE128" margin={2} />
                                <div style={{ textAlign: "center", fontSize: "12px", marginTop: "2mm", wordBreak: "break-all" }}>{invoiceId}</div>
                            </div>
                        </div>
                        <div style={{ borderTop: "1px dashed #000", margin: "2mm 0" }} />
                    </>
                )}
                
                <p style={{ textAlign: "center", fontWeight: "bold", marginTop: "4mm" }}>
                    THANK YOU!
                </p>
                <p style={{ textAlign: "center", marginTop: "2mm", fontSize: "10px" }}>
                    Powered by OneBalance
                </p>
            </div>
        </div>
    );
}

/**
 * Helper function to generate HTML string for printing
 */
export const getInvoiceHtml = (props: InvoiceProps) => {
    const dateObj = typeof props.date === 'string' ? new Date(props.date) : props.date;
    const invoiceId = `INV-${dateObj.getTime()}`;
    const barcodeSvg = renderToStaticMarkup(
        <Barcode value={invoiceId} displayValue={false} width={1} height={50} format="CODE128" margin={2} />
    );
    const svgDataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(barcodeSvg)))}`;
    const itemsHtml = props.items.map(item => `
        <tr>
            <td style="padding: 1mm 0; vertical-align: top;">${item.name}</td>
            <td style="text-align: right; padding: 1mm 0; vertical-align: top;">${item.qty}</td>
            <td style="text-align: right; padding: 1mm 0; vertical-align: top;">$${(item.price * item.qty).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <html>
            <head>
                <style>
                    @page {
                        size: 72mm auto;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        width: 72mm;
                    }
                    * {
                        box-sizing: border-box;
                    }
                </style>
            </head>
            <body>
                <div style="font-family: 'Courier New', Courier, monospace; width: 72mm; padding: 3mm; font-size: 10px; color: #000; background-color: #fff; line-height: 1.2;">
                    <img src="/assets/logo-light.svg" alt="Grocery Logo" style="display: block; margin: 0 auto 2mm auto; width: 50mm; height: auto;" />
                    <p style="text-align: center; margin: 0;">123 Grocery Lane, City</p>
                    <p style="text-align: center; margin: 0 0 4mm 0;">Phone: 555-0199</p>
                    
                    <div style="border-top: 1px dashed #000; margin: 2mm 0;"></div>
                    
                    <p style="margin: 1mm 0;">Date: ${props.date.toLocaleString()}</p>
                    <p style="margin: 1mm 0;">Customer: ${props.customerName || 'Guest'}</p>
                    
                    <div style="border-top: 1px dashed #000; margin: 2mm 0;"></div>
                    
                    <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                        <thead>
                            <tr>
                                <th style="text-align: left; padding-bottom: 1mm; width: 30mm;">Item</th>
                                <th style="text-align: right; padding-bottom: 1mm; width: 12mm;">Qty</th>
                                <th style="text-align: right; padding-bottom: 1mm; width: 18mm;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    
                    <div style="border-top: 1px dashed #000; margin: 2mm 0;"></div>
                    
                    <div style="display: flex; justify-content: space-between; margin: 1mm 0;">
                        <span>Subtotal:</span>
                        <span>$${props.subtotal.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 1mm 0;">
                        <span>Tax:</span>
                        <span>$${props.taxAmount.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 1mm 0;">
                        <span>Discount:</span>
                        <span>$${props.discountAmount.toFixed(2)}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin: 2mm 0;">
                        <span>TOTAL:</span>
                        <span>$${props.total.toFixed(2)}</span>
                    </div>
                    
                    <div style="border-top: 1px dashed #000; margin: 2mm 0;"></div>
                    
                    ${!props.isBasketOnly ? `
                    <div style="display: flex; justify-content: space-between; margin: 1mm 0;">
                        <span>Cash Given:</span>
                        <span>$${props.cashGiven.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 1mm 0;">
                        <span>Change:</span>
                        <span>$${props.change.toFixed(2)}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: center; margin-top: 2mm; margin-bottom: 2mm;">
                        <div style="width: 74mm; margin: 0 auto; text-align: center;">
                            <img src="${svgDataUri}" alt="Invoice Barcode" style="width: 72mm; max-width: 72mm; height: auto;" />
                            <div style="text-align: center; font-size: 12px; margin-top: 2mm; word-break: break-all;">${invoiceId}</div>
                        </div>
                    </div>
                    <div style="border-top: 1px dashed #000; margin: 2mm 0;"></div>
                    ` : ''}
                    
                    <p style="text-align: center; font-weight: bold; margin-top: 4mm;">
                        THANK YOU!
                    </p>
                    <p style="text-align: center; margin-top: 1mm; font-size: 10px;">
                        Powered by OneBalance
                    </p>
                </div>
            </body>
        </html>
    `;
};
