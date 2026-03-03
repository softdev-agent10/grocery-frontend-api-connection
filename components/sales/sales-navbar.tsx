"use client"
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Bell, LayoutDashboard, Maximize, RefreshCcw, Settings, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function SalesNavbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const router = useRouter()

    const iconButtons = [
        { icon: Settings, label: 'Settings' },
        { icon: Maximize, label: 'Maximize' },
        { icon: RefreshCcw, label: 'Refresh' },
        { icon: Bell, label: 'Notifications' },
    ]

    const handleIconClick = (label: string) => {
        switch (label) {
            case 'Maximize':
                if (document.fullscreenElement) {
                    document.exitFullscreen()?.then(() => setIsFullscreen(false))
                } else {
                    document.documentElement.requestFullscreen()?.then(() => setIsFullscreen(true))
                }
                break
            case 'Refresh':
                window.location.reload()
                break
            default:
                // other actions can be added later
                break
        }
    }

    return (
        <div className='w-full bg-primary shadow-md'>
            {/* Main navbar row */}
            <div className='w-full flex justify-between items-center px-4 h-16 md:h-20'>
                {/* Logo */}
                <div className='text-2xl md:text-3xl text-white font-bold'>
                    {/* <Image src="/assets/desi-payment-dark.png" alt="Grocery Logo" width={80} height={80} className='inline mr-2' /> */}
                    OneBalance
                </div>

                {/* Desktop actions */}
                <div className='hidden md:flex gap-3 items-center'>
                    {iconButtons.map(({ icon: Icon, label }) => (
                        <Button
                            key={label}
                            variant="outline"
                            size="icon"
                            className='size-10'
                            aria-label={label}
                            onClick={() => handleIconClick(label)}
                        >
                            <Icon className='size-5' />
                        </Button>
                    ))}
                    <a href="/dashboard">
                        <Button variant="outline" className='py-5 flex items-center gap-2'>
                            <LayoutDashboard className='size-5' />
                            <span className='text-base'>Dashboard</span>
                        </Button>
                    </a>
                    <div className="hidden md:flex flex-col items-end text-lg text-white ml-1">
                        <span>07 January 2026</span>
                        <span className="font-semibold">04:10 AM (GMT)</span>
                    </div>
                </div>

                {/* Mobile Hamburger */}
                <div className='flex md:hidden items-center gap-2'>
                    <Button variant="outline" size="icon" className='size-9' aria-label="Notifications">
                        <Bell className='size-5' />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className='size-9'
                        aria-label="Toggle menu"
                        onClick={() => setMenuOpen(prev => !prev)}
                    >
                        {menuOpen ? <X className='size-5' /> : <Menu className='size-5' />}
                    </Button>
                </div>
            </div>

            {/* Mobile dropdown menu */}
            {menuOpen && (
                <div className='md:hidden flex flex-col gap-2 px-4 pb-4'>
                    {iconButtons.map(({ icon: Icon, label }) => (
                        <Button
                            key={label}
                            variant="outline"
                            className='w-full justify-start gap-3'
                            aria-label={label}
                            onClick={() => handleIconClick(label)}
                        >
                            <Icon className='size-5' />
                            <span>{label}</span>
                        </Button>
                    ))}
                    <Button variant="outline" className='w-full justify-start gap-3'>
                        <LayoutDashboard className='size-5' />
                        <span>Dashboard</span>
                    </Button>
                </div>
            )}
        </div>
    )
}