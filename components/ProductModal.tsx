'use client';

import { ChevronDown, X, Upload, Lock, Save, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: ProductFormData) => void;
  isEditing?: boolean;
}

export interface ProductFormData {
  image?: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
  upc: string;
  ageVerification: 'none' | 'default' | 'custom';
  description?: string;
  pricingStrategy: 'fixed' | 'daily' | 'everytime';
  productType: 'single' | 'bundle';
  price: number;
  cost: number;
  quantity: number;
  quantityAlert: number;
  discount: number;
  ebtEligible: boolean;
  soldByWeight: boolean;
  customField1?: string;
  customField2?: string;
  customField3?: string;
}

const defaultFormData: ProductFormData = {
  image: '',
  name: '',
  category: '',
  brand: '',
  unit: '',
  upc: '',
  ageVerification: 'default',
  description: '',
  pricingStrategy: 'fixed',
  productType: 'single',
  price: 0,
  cost: 0,
  quantity: 0,
  quantityAlert: 10,
  discount: 0,
  ebtEligible: false,
  soldByWeight: false,
  customField1: '',
  customField2: '',
  customField3: '',
};

export function ProductModal({ isOpen, onClose, onSave, isEditing = false }: ProductModalProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('info');
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [addNewModal, setAddNewModal] = useState<{
    isOpen: boolean;
    type: 'category' | 'brand' | 'unit' | null;
    name: string;
    description: string;
    taxes: string;
    fees: string;
  }>({
    isOpen: false,
    type: null,
    name: '',
    description: '',
    taxes: '',
    fees: '',
  });

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const generateUPC = () => {
    const upc = Math.floor(Math.random() * 1000000000000)
      .toString()
      .padStart(12, '0');
    handleInputChange('upc', upc);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl overflow-y-auto rounded-xl sm:rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Add/Edit Product</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
          >
            <X size={20} sm-size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-3 sm:space-y-4 px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Product Information Section */}
          <motion.div className="overflow-hidden rounded-lg border border-gray-200">
            <button
              onClick={() =>
                setExpandedSection(expandedSection === 'info' ? null : 'info')
              }
              className="flex w-full items-center justify-between bg-gray-50 px-6 py-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm font-bold text-blue-600">ℹ</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  Product Information
                </span>
              </div>
              <ChevronDown
                size={20}
                className={`transition-transform text-gray-600 ${
                  expandedSection === 'info' ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {expandedSection === 'info' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-200 px-6 py-6 space-y-6 bg-white"
                >
                  <div className={`grid gap-6 ${isEditing ? 'grid-cols-3' : 'grid-cols-1'}`}>
                    {/* Image Upload - Only show when editing */}
                    {isEditing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Add Image
                        </label>
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 flex flex-col items-center justify-center bg-blue-50">
                          <Upload size={24} className="text-blue-600 mb-2" />
                          <button
                            type="button"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                          >
                            <Upload size={16} />
                            Upload Image
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Product Name */}
                    <div className={isEditing ? "col-span-2" : ""}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange('name', e.target.value)
                        }
                        placeholder="Enter product name"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            handleInputChange('category', e.target.value)
                          }
                          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option>Choose Category</option>
                          <option value="electronics">Electronics</option>
                          <option value="groceries">Groceries</option>
                          <option value="clothing">Clothing</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setAddNewModal({ ...addNewModal, isOpen: true, type: 'category' })}
                          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 whitespace-nowrap flex items-center gap-1 transition-colors"
                        >
                          <Plus size={16} />
                          <span className="hidden sm:inline">Add New</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={formData.brand}
                          onChange={(e) =>
                            handleInputChange('brand', e.target.value)
                          }
                          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option>Choose Brand</option>
                          <option value="brand1">Brand 1</option>
                          <option value="brand2">Brand 2</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setAddNewModal({ ...addNewModal, isOpen: true, type: 'brand' })}
                          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 whitespace-nowrap flex items-center gap-1 transition-colors"
                        >
                          <Plus size={16} />
                          <span className="hidden sm:inline">Add New</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Units
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={formData.unit}
                          onChange={(e) =>
                            handleInputChange('unit', e.target.value)
                          }
                          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option>Choose Unit</option>
                          <option value="pcs">Piece</option>
                          <option value="kg">Kg</option>
                          <option value="liter">Liter</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setAddNewModal({ ...addNewModal, isOpen: true, type: 'unit' })}
                          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 whitespace-nowrap flex items-center gap-1 transition-colors"
                        >
                          <Plus size={16} />
                          <span className="hidden sm:inline">Add New</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UPC Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.upc}
                          onChange={(e) =>
                            handleInputChange('upc', e.target.value)
                          }
                          placeholder="Enter UPC code"
                          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={generateUPC}
                          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 whitespace-nowrap"
                        >
                          🔄 Generate
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Age Verification
                    </label>
                    <div className="flex gap-4">
                      {[
                        { value: 'none', label: 'None' },
                        { value: 'default', label: 'Default (18+)' },
                        { value: 'custom', label: 'Custom' },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="ageVerification"
                            value={option.value}
                            checked={formData.ageVerification === option.value}
                            onChange={(e) =>
                              handleInputChange('ageVerification', e.target.value)
                            }
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange('description', e.target.value)
                      }
                      placeholder="Enter product description..."
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Pricing & Stocks Section */}
          <motion.div className="overflow-hidden rounded-lg border border-gray-200">
            <button
              onClick={() =>
                setExpandedSection(
                  expandedSection === 'pricing' ? null : 'pricing'
                )
              }
              className="flex w-full items-center justify-between bg-gray-50 px-6 py-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <span className="text-sm font-bold text-green-600">$</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  Pricing Strategy
                </span>
              </div>
              <ChevronDown
                size={20}
                className={`transition-transform text-gray-600 ${
                  expandedSection === 'pricing' ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {expandedSection === 'pricing' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-200 px-6 py-6 space-y-6 bg-white"
                >
                  {/* Pricing Strategy Options */}
                  <div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {[
                        { value: 'fixed', label: 'Fixed Price' },
                        { value: 'daily', label: 'Custom Daily' },
                        { value: 'everytime', label: 'Custom Every Time' },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`relative flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.pricingStrategy === option.value
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="pricingStrategy"
                            value={option.value}
                            checked={formData.pricingStrategy === option.value}
                            onChange={(e) =>
                              handleInputChange('pricingStrategy', e.target.value)
                            }
                            className="h-5 w-5 text-blue-600"
                          />
                          <Lock size={16} className="text-blue-600" />
                          <span className="font-medium text-gray-900">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    {formData.pricingStrategy === 'fixed' && (
                      <div className="p-3 bg-blue-50 text-sm text-blue-700 rounded-lg flex gap-2">
                        <span>ℹ️</span>
                        <span>Fixed price will be saved until product is deleted</span>
                      </div>
                    )}
                  </div>

                  {/* Product Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      👥 Product Type
                    </label>
                    <div className="flex gap-3">
                      {[
                        { value: 'single', label: 'Single Product' },
                        { value: 'bundle', label: 'Bundle' },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="productType"
                            value={option.value}
                            checked={formData.productType === option.value}
                            onChange={(e) =>
                              handleInputChange('productType', e.target.value)
                            }
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price & Cost */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          handleInputChange('price', parseFloat(e.target.value))
                        }
                        placeholder="0.00"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will be used as the base/fixed price
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost ($)
                      </label>
                      <input
                        type="number"
                        value={formData.cost}
                        onChange={(e) =>
                          handleInputChange('cost', parseFloat(e.target.value))
                        }
                        placeholder="0.00"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          handleInputChange('quantity', parseInt(e.target.value) || 0)
                        }
                        placeholder="0"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity Alert
                      </label>
                      <input
                        type="number"
                        value={formData.quantityAlert}
                        onChange={(e) =>
                          handleInputChange('quantityAlert', parseInt(e.target.value) || 10)
                        }
                        placeholder="10"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount ($)
                    </label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) =>
                        handleInputChange('discount', parseFloat(e.target.value))
                      }
                      placeholder="0.00"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Toggle Buttons */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        EBT Eligible
                      </label>
                      <div className="flex gap-2">
                        {[
                          { value: false, label: 'OFF' },
                          { value: true, label: 'ON' },
                        ].map((option) => (
                          <button
                            key={String(option.value)}
                            onClick={() =>
                              handleInputChange('ebtEligible', option.value)
                            }
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                              formData.ebtEligible === option.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Sold By Weight
                      </label>
                      <div className="flex gap-2">
                        {[
                          { value: false, label: 'OFF' },
                          { value: true, label: 'ON' },
                        ].map((option) => (
                          <button
                            key={String(option.value)}
                            onClick={() =>
                              handleInputChange('soldByWeight', option.value)
                            }
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                              formData.soldByWeight === option.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Custom Fields Section */}
          <motion.div className="overflow-hidden rounded-lg border border-gray-200">
            <button
              onClick={() =>
                setExpandedSection(
                  expandedSection === 'custom' ? null : 'custom'
                )
              }
              className="flex w-full items-center justify-between bg-gray-50 px-6 py-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-sm font-bold text-slate-600">⚙</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  Custom Fields
                </span>
              </div>
              <ChevronDown
                size={20}
                className={`transition-transform text-gray-600 ${
                  expandedSection === 'custom' ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {expandedSection === 'custom' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-200 px-6 py-6 space-y-4 bg-white"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Field 1
                    </label>
                    <input
                      type="text"
                      value={formData.customField1}
                      onChange={(e) =>
                        handleInputChange('customField1', e.target.value)
                      }
                      placeholder="Enter custom field"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Field 2
                    </label>
                    <input
                      type="text"
                      value={formData.customField2}
                      onChange={(e) =>
                        handleInputChange('customField2', e.target.value)
                      }
                      placeholder="Enter custom field"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Field 3
                    </label>
                    <input
                      type="text"
                      value={formData.customField3}
                      onChange={(e) =>
                        handleInputChange('customField3', e.target.value)
                      }
                      placeholder="Enter custom field"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="sticky bottom-0 flex gap-2 sm:gap-3 border-t border-gray-200 bg-white px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 rounded-lg border-2 border-red-500 px-4 sm:px-6 py-2 sm:py-3 font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <X size={18} />
            <span className="hidden sm:inline">Cancel</span>
          </motion.button>
          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 rounded-lg bg-green-500 px-4 sm:px-6 py-2 sm:py-3 font-semibold text-white hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={18} />
            <span className="hidden sm:inline">Save Product</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Right Side Modal for Adding New Items */}
      <AnimatePresence>
        {addNewModal.isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddNewModal({ ...addNewModal, isOpen: false, type: null, name: '', description: '', taxes: '', fees: '' })}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />
            {/* Modal */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed right-0 top-0 h-screen w-full sm:w-96 lg:w-[420px] bg-white shadow-2xl z-50 overflow-y-auto"
            >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 sm:py-6 text-white flex justify-between items-center gap-2">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold">
                Add {addNewModal.type === 'category' ? 'Category' : addNewModal.type === 'brand' ? 'Brand' : 'Unit'}
              </h2>
              <button
                onClick={() => setAddNewModal({ ...addNewModal, isOpen: false, type: null, name: '', description: '', taxes: '', fees: '' })}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">
                  {addNewModal.type === 'category' ? 'Category Name' : addNewModal.type === 'brand' ? 'Brand Name' : 'Unit Name'} *
                </label>
                <input
                  type="text"
                  value={addNewModal.name}
                  onChange={(e) => setAddNewModal({ ...addNewModal, name: e.target.value })}
                  placeholder={`Enter ${addNewModal.type === 'category' ? 'category' : addNewModal.type === 'brand' ? 'brand' : 'unit'} name`}
                  className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">
                  Description
                </label>
                <textarea
                  value={addNewModal.description}
                  onChange={(e) => setAddNewModal({ ...addNewModal, description: e.target.value })}
                  placeholder={`Enter ${addNewModal.type === 'category' ? 'category' : addNewModal.type === 'brand' ? 'brand' : 'unit'} description`}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              {/* Taxes Field (for Category) */}
              {addNewModal.type === 'category' && (
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">
                    Applicable Taxes
                  </label>
                  <input
                    type="text"
                    value={addNewModal.taxes}
                    onChange={(e) => setAddNewModal({ ...addNewModal, taxes: e.target.value })}
                    placeholder="e.g., test (10.00%)"
                    className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              )}

              {/* Fees Field (for Category) */}
              {addNewModal.type === 'category' && (
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">
                    Applicable Fees
                  </label>
                  <input
                    type="text"
                    value={addNewModal.fees}
                    onChange={(e) => setAddNewModal({ ...addNewModal, fees: e.target.value })}
                    placeholder="Enter applicable fees"
                    className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="sticky bottom-0 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex gap-2 sm:gap-3 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAddNewModal({ ...addNewModal, isOpen: false, type: null, name: '', description: '', taxes: '', fees: '' })}
                className="flex-1 rounded-lg border-2 border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 font-bold text-gray-700 hover:bg-gray-100 transition-colors text-sm sm:text-base"
              >
                Close
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // Add the new item and close modal
                  setAddNewModal({ ...addNewModal, isOpen: false, type: null, name: '', description: '', taxes: '', fees: '' });
                }}
                className="flex-1 rounded-lg bg-blue-600 px-3 sm:px-4 py-2 sm:py-2.5 font-bold text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 text-sm sm:text-base"
              >
                <Check size={16} />
                Save
              </motion.button>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
