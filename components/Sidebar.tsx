"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Package,
  Wrench,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import {
  NAVIGATION_ITEMS,
  INVENTORY_ITEMS,
  TOOLS_ITEMS,
  SETTINGS_LINK,
  HELP_LINK,
  NavItem,
} from "@/lib/constants";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}) => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({ inventory: false, tools: false });

  const isItemActive = (href: string, matcher: "exact" | "prefix" = "exact"): boolean => {
    if (matcher === "exact") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isParentActive = (items: NavItem[]): boolean => {
    return items.some((item) => isItemActive(item.href, item.matcher || "exact"));
  };

  const toggleMenu = (menu: "inventory" | "tools") => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const sidebarVariants = {
    hidden: { x: -320, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.2 },
    }),
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Desktop (Always Visible) */}
      <div
        className={`
          hidden lg:flex flex-col h-full bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        {/* Logo Section */}
        <div
          className={`p-5 flex items-center justify-center border-b border-gray-200 shrink-0`}
        >
          <div className="group cursor-pointer overflow-hidden flex items-center">
            <Image
              src={isCollapsed ? "/assets/onebalance-icon.svg" : "/assets/onebalance-logo.svg"}
              alt="OneBalance Logo"
              width={isCollapsed ? 140 : 200}
              height={isCollapsed ? 100 : 60}
              className="transition-all duration-300 group-hover:opacity-80 object-contain"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar ">
          {/* Main Navigation */}
          {NAVIGATION_ITEMS.map((item, idx) => {
            const isActive = isItemActive(item.href, item.matcher);

            return (
              <motion.div
                key={item.href}
                custom={idx}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link href={item.href} onClick={onClose}>
                  <div
                    className={`
                      relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer font-semibold text-sm
                      transition-all duration-200 group
                      focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                      ${isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:scale-[1.02] hover:shadow-sm"
                      }
                      ${isCollapsed ? "justify-center" : ""}
                    `}
                  >
                    {isActive && !isCollapsed && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-blue-500 to-blue-600 rounded-r-full shadow-lg shadow-blue-500/50"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    {isActive && isCollapsed && (
                      <motion.div
                        layoutId="activeIndicatorCollapsed"
                        className="absolute inset-0 bg-blue-50 rounded-lg border-2 border-blue-500 shadow-lg shadow-blue-500/30"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    <span className="shrink-0"><item.icon size={20} /></span>
                    {!isCollapsed && <span>{item.label}</span>}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-60 shadow-lg font-medium">
                        {item.label}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {/* Inventory Section */}
          <motion.div custom={NAVIGATION_ITEMS.length} variants={itemVariants} initial="hidden" animate="visible">
            <button
              onClick={() => toggleMenu("inventory")}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group cursor-pointer
                focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                ${openMenus.inventory || isParentActive(INVENTORY_ITEMS)
                  ? "bg-gray-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:scale-[1.02] hover:shadow-sm"
                }
                ${isCollapsed ? "justify-center" : ""}
              `}
              aria-label="Toggle inventory menu"
            >
              <div className="flex items-center gap-3">
                <Package size={20} className="shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">Inventory</span>}
              </div>
              {!isCollapsed && (
                <motion.div
                  animate={{ rotate: openMenus.inventory ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown
                    size={18}
                    className={
                      openMenus.inventory ? "text-blue-500" : "text-gray-400"
                    }
                  />
                </motion.div>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-60 shadow-lg font-medium">
                  Inventory
                </div>
              )}
            </button>

            {openMenus.inventory && (
              <motion.div
                initial={isCollapsed ? { opacity: 0 } : { opacity: 0, height: 0 }}
                animate={isCollapsed ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                exit={isCollapsed ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: isCollapsed ? 0 : 0.2 }}
                className={`overflow-hidden ${isCollapsed
                    ? "mt-1 flex flex-col gap-1"
                    : "mt-1 ml-4 pl-4 border-l-2 border-gray-100 space-y-1"
                  }`}
              >
                {INVENTORY_ITEMS.map((item) => {
                  const isActive = isItemActive(item.href, item.matcher);
                  return (
                    <Link key={item.href} href={item.href} onClick={onClose}>
                      <div
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 group cursor-pointer
                          focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                          ${isCollapsed ? "justify-center py-2.5" : "text-[13px]"}
                          ${isActive
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 hover:scale-[1.02]"
                          }
                        `}
                      >
                        <span className={`shrink-0 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}`}>
                          <item.icon size={isCollapsed ? 18 : 16} />
                        </span>
                        {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-60 shadow-lg font-medium">
                            {item.label}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </motion.div>

          {/* Tools Section */}
          <motion.div custom={NAVIGATION_ITEMS.length + 1} variants={itemVariants} initial="hidden" animate="visible">
            <button
              onClick={() => toggleMenu("tools")}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group cursor-pointer
                focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                ${openMenus.tools || isParentActive(TOOLS_ITEMS)
                  ? "bg-gray-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:scale-[1.02] hover:shadow-sm"
                }
                ${isCollapsed ? "justify-center" : ""}
              `}
              aria-label="Toggle tools menu"
            >
              <div className="flex items-center gap-3">
                <Wrench size={20} className="shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">Tools</span>}
              </div>
              {!isCollapsed && (
                <motion.div
                  animate={{ rotate: openMenus.tools ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown
                    size={18}
                    className={openMenus.tools ? "text-blue-500" : "text-gray-400"}
                  />
                </motion.div>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-60 shadow-lg font-medium">
                  Tools
                </div>
              )}
            </button>

            {openMenus.tools && (
              <motion.div
                initial={isCollapsed ? { opacity: 0 } : { opacity: 0, height: 0 }}
                animate={isCollapsed ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                exit={isCollapsed ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: isCollapsed ? 0 : 0.2 }}
                className={`overflow-hidden ${isCollapsed
                    ? "mt-1 absolute left-full top-0 ml-2"
                    : "mt-1 ml-4 pl-4 border-l-2 border-gray-100 space-y-1"
                  }`}
              >
                {TOOLS_ITEMS.map((item) => {
                  const isActive = isItemActive(item.href, item.matcher);
                  return (
                    <Link key={item.href} href={item.href} onClick={onClose}>
                      <div
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 group cursor-pointer
                          focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                          ${isCollapsed ? "justify-center py-2.5" : "text-[13px]"}
                          ${isActive
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 hover:scale-[1.02]"
                          }
                        `}
                      >
                        <span className={`shrink-0 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}`}>
                          <item.icon size={isCollapsed ? 18 : 16} />
                        </span>
                        {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-60 shadow-lg font-medium">
                            {item.label}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </motion.div>

          {/* Bottom Settings & Help */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="space-y-1">
              <motion.div custom={NAVIGATION_ITEMS.length + 2} variants={itemVariants} initial="hidden" animate="visible">
                <Link href={SETTINGS_LINK.href} onClick={onClose}>
                  <div
                    className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                    focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                    text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:scale-[1.02] hover:shadow-sm
                    ${isCollapsed ? "justify-center" : ""}
                    cursor-pointer
                  `}
                  >
                    <SETTINGS_LINK.icon size={20} className="shrink-0" />
                    {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-60 shadow-lg font-medium">
                        Settings
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>

              <motion.div custom={NAVIGATION_ITEMS.length + 3} variants={itemVariants} initial="hidden" animate="visible">
                <Link href={HELP_LINK.href} onClick={onClose}>
                  <div
                    className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                    focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                    text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:scale-[1.02] hover:shadow-sm
                    ${isCollapsed ? "justify-center" : ""}
                    cursor-pointer
                  `}
                  >
                    <HELP_LINK.icon size={20} className="shrink-0" />
                    {!isCollapsed && <span className="text-sm font-medium">Help</span>}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-60 shadow-lg font-medium">
                        Help
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Collapse Toggle Button (Desktop Bottom) */}
            <button
              onClick={onToggleCollapse}
              className="w-full hidden lg:flex items-center justify-center gap-3 p-3 mt-4 border-t border-gray-100 hover:bg-gray-50 text-blue-500 rounded-lg transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
              {!isCollapsed && <span className="text-sm font-medium"></span>}
            </button>
          </div>
        </nav>
      </div>
      {isOpen && (
        <motion.aside
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 w-64 lg:hidden flex flex-col h-full overflow-hidden"
        >
          {/* Logo Section */}
          <div className="p-4 flex items-center justify-between border-b border-gray-200 shrink-0">
            <div className="group cursor-pointer overflow-hidden flex items-center">
              <Image
                src="/assets/onebalance-logo.svg"
                alt="OneBalance Logo"
                width={160}
                height={40}
                className="transition-all group-hover:opacity-80"
              />
            </div>
            <button
              className="p-1 hover:bg-gray-100 rounded-md shrink-0"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation - Reuse from above */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
            {NAVIGATION_ITEMS.map((item, idx) => {
              const isActive = isItemActive(item.href, item.matcher);
              return (
                <motion.div key={item.href} custom={idx} variants={itemVariants} initial="hidden" animate="visible">
                  <Link href={item.href} onClick={onClose}>
                    <div
                      className={`
                        relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer font-semibold text-sm
                        transition-all duration-200 group
                        focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                        ${isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:scale-[1.02] hover:shadow-sm"
                        }
                      `}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicatorMobile"
                          className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-blue-500 to-blue-600 rounded-r-full shadow-lg shadow-blue-500/50"
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                      <span className="shrink-0">{item.icon && <item.icon size={16} />}</span>
                      <span>{item.label}</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {/* Inventory Section Mobile */}
            <motion.div custom={NAVIGATION_ITEMS.length} variants={itemVariants} initial="hidden" animate="visible">
              <button
                onClick={() => toggleMenu("inventory")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                  ${openMenus.inventory || isParentActive(INVENTORY_ITEMS)
                    ? "bg-gray-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:scale-[1.02] hover:shadow-sm"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Package size={20} className="shrink-0" />
                  <span className="text-sm font-medium">Inventory</span>
                </div>
                <motion.div animate={{ rotate: openMenus.inventory ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
                  <ChevronDown size={18} className={openMenus.inventory ? "text-blue-500" : "text-gray-400"} />
                </motion.div>
              </button>
              {openMenus.inventory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 space-y-1 overflow-hidden"
                >
                  {INVENTORY_ITEMS.map((item, idx) => {
                    const isActive = isItemActive(item.href, item.matcher);
                    return (
                      <motion.div key={item.href} custom={idx} variants={itemVariants} initial="hidden" animate="visible">
                        <Link href={item.href} onClick={onClose}>
                          <div className={`flex items-center gap-2 px-3 py-2 text-[13px] rounded-md transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                            ${isActive
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 hover:scale-[1.02]"
                            }`}>
                            <span className={`shrink-0 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}`}>
                              <item.icon size={16} />
                            </span>
                            <span className="font-medium truncate">{item.label}</span>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>

            {/* Tools Section Mobile */}
            <motion.div custom={NAVIGATION_ITEMS.length + 1} variants={itemVariants} initial="hidden" animate="visible">
              <button
                onClick={() => toggleMenu("tools")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                  ${openMenus.tools || isParentActive(TOOLS_ITEMS)
                    ? "bg-gray-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:scale-[1.02] hover:shadow-sm"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Wrench size={20} className="shrink-0" />
                  <span className="text-sm font-medium">Tools</span>
                </div>
                <motion.div animate={{ rotate: openMenus.tools ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
                  <ChevronDown size={18} className={openMenus.tools ? "text-blue-500" : "text-gray-400"} />
                </motion.div>
              </button>
              {openMenus.tools && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 space-y-1 overflow-hidden"
                >
                  {TOOLS_ITEMS.map((item, idx) => {
                    const isActive = isItemActive(item.href, item.matcher);
                    return (
                      <motion.div key={item.href} custom={idx} variants={itemVariants} initial="hidden" animate="visible">
                        <Link href={item.href} onClick={onClose}>
                          <div className={`flex items-center gap-2 px-3 py-2 text-[13px] rounded-md transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                            ${isActive
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 hover:scale-[1.02]"
                            }`}>
                            <span className={`shrink-0 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}`}>
                              <item.icon size={16} />
                            </span>
                            <span className="font-medium truncate">{item.label}</span>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>

            {/* Bottom Settings & Help Mobile */}
            <div className="mt-auto pt-4 border-t border-gray-100 space-y-1">
              <motion.div custom={NAVIGATION_ITEMS.length + 2} variants={itemVariants} initial="hidden" animate="visible">
                <Link href={SETTINGS_LINK.href} onClick={onClose}>
                  <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:scale-[1.02] hover:shadow-sm cursor-pointer">
                    <SETTINGS_LINK.icon size={20} className="shrink-0" />
                    <span className="text-sm font-medium">Settings</span>
                  </div>
                </Link>
              </motion.div>
              <motion.div custom={NAVIGATION_ITEMS.length + 3} variants={itemVariants} initial="hidden" animate="visible">
                <Link href={HELP_LINK.href} onClick={onClose}>
                  <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:scale-[1.02] hover:shadow-sm cursor-pointer">
                    <HELP_LINK.icon size={20} className="shrink-0" />
                    <span className="text-sm font-medium">Help</span>
                  </div>
                </Link>
              </motion.div>
            </div>
          </nav>
        </motion.aside>
      )}
    </>
  );
};
