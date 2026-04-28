'use client';

import { ChevronDown, X, Upload, Lock, Save, Plus, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategories } from '@/app/services/categories/service.categories';
import { getBrands } from '@/app/services/brand/brand.service';
import { getUnits } from '@/app/services/units/units.service';
import { formatDate, set } from 'date-fns';
import { ProductData, ProductFormData } from '@/app/services/product/service.product';



interface ProductModalProps {
  product?: ProductFormData;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: ProductFormData) => void;
  isEditing?: boolean;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
}

export const defaultFormData: ProductFormData = {
  id: 0,
  name: '',
  category_name: '',
  brand_name: '',
  unit_name: '',
  upc_code: '',
  plu_code: '',
  description: '',

  buying_price: 0,
  selling_price: 0,
  custom_price: 0,

  quantity: 0,
  quantity_alert: 0,
  discount: 0,

  age_verification: false,
  ebt_eligible: false,
  sold_by_weight: false,
  is_refundable: false,

  warranty_period: '',
  warranty_description: '',

  manufacturer_date: '',
  expiration_date: '',

  image_url: '',
  is_available: true,
};

type ExpandedSection = 'info' | 'pricing' | 'details' | 'unitDropdown' | null;

export function ProductModal({ product, isOpen, onClose, title = "Add/Edit Product", subtitle = "This is for added products", onSave, isEditing = false, isLoading }: ProductModalProps) {

  const [expandedSection, setExpandedSection] = useState<ExpandedSection>('info');
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);


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
  const [expandedSection2, setExpandedSection2] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

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
    const upc_code = Math.floor(Math.random() * 1000000000)
      .toString()
      .padStart(11, '0');
    handleInputChange('upc_code', upc_code);
  };

  const generatePLU = () => {
    const plu_code = Math.floor(Math.random() * 10000000)
      .toString()
      .padStart(8, '0');
    handleInputChange('plu_code', plu_code);
  };

  // Fetch categories from API and update state
  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      // console.log('Fetched categories:', response.data.items);
      setCategories(response.data.items);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch brands from API and update state
  const fetchBrands = async () => {
    try {
      const response = await getBrands();
      setBrands(response.data.items);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  // Fetch units from API and update state
  const fetchUnits = async () => {
    try {
      const response = await getUnits();
      setUnits(response.data.items);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  // Load all dropdown data when modal opens
  const loadDropdownData = async () => {
    setIsLoadingData(true);
    try {
      await Promise.all([fetchCategories(), fetchBrands(), fetchUnits()]);
      setDataLoaded(true);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      setIsLoadingData(false);
    }
    finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      // Load data only when modal opens
      if (!dataLoaded && !isLoadingData) {
        loadDropdownData();
      }
      // Set form data when opening
      const data = product ? { ...defaultFormData, ...product } : defaultFormData;
      if (isMounted) {
        setFormData(data);
      }
    } else {
      // Reset when closing
      if (isMounted) {
        setFormData(defaultFormData);
        setExpandedSection('info');
        setValidationErrors({});
        setSaveSuccess(false);
        setIsSaving(false);
        setDataLoaded(false); // Reset so data loads fresh on next open
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, product]);

  const [codeType, setCodeType] = useState<'upc' | 'plu'>('upc');




  // Validate and submit form to parent component
  async function handleSaveNewProduct() {
    try {
      // Clear previous errors and set loading state
      setValidationErrors({});
      setSaveSuccess(false);
      setIsSaving(true);

      const errors: Record<string, string> = {};

      // Validation logic
      if (!formData.name?.trim()) {
        errors.name = 'Product name is required';
      }

      if (formData.category_name === '') {
        errors.category_name = 'Category is required';
      }

      if (formData.brand_name === '') {
        errors.brand_name = 'Brand is required';
      }

      if (formData.unit_name === '') {
        errors.unit_name = 'Unit is required';
      }

      if (!formData.upc_code?.trim()) {
        errors.upc_code = 'UPC code is required';
      }

      if (formData.selling_price <= 0) {
        errors.selling_price = 'Selling price must be greater than 0';
      }

      if (formData.buying_price <= 0) {
        errors.buying_price = 'Buying price must be greater than 0';
      }

      // Custom price validation: custom_price cannot be greater than selling_price
      if (formData.custom_price > formData.selling_price) {
        errors.custom_price = `Custom price (${formData.custom_price}) cannot be greater than selling price (${formData.selling_price})`;
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        console.error("Validation errors:", errors);
        setIsSaving(false);
        return;
      }

      // // Look up IDs from names before passing to parent
      // const categoryName = formData.category_name?.trim();
      // const brandName = formData.brand_name?.trim();
      // const unitName = formData.unit_name?.trim();

      // const categoryId = categories.find(c => c.name === categoryName)?.id || 1;
      // const brandId = brands.find(b => b.name === brandName)?.id || 1;
      // const unitId = units.find(u => u.name === unitName)?.id || 1;

      // // Add IDs to form data for parent to use
      // const dataWithIds = {
      //   ...formData,
      //   category_id: categoryId,
      //   brand_id: brandId,
      //   unit_id: unitId,
      // };

      // Pass validated form data to parent component for API handling
      if (onSave) {
        await onSave(formData as any);
      }

      // Show success message
      setSaveSuccess(true);
      setValidationErrors({});

      // Close modal after brief delay for success message visibility
      setTimeout(() => {
        onClose();
        setIsSaving(false);
      }, 800);

    } catch (error: any) {
      console.error("Product save error:", error.message);
      console.error("Full error:", error);

      // Parse API error response and display to user
      try {
        const errorMessage = error.message || '';

        // Handle duplicate UPC error
        if (errorMessage.includes('DUPLICATE_RESOURCE') || errorMessage.includes('UPC code already exists')) {
          const match = errorMessage.match(/existing_product_id["\']?\s*:?\s*(\d+)/);
          const existingId = match ? match[1] : 'unknown';

          setValidationErrors({
            upc_code: `UPC code already exists (Product ID: ${existingId}). Please use a different UPC or edit the existing product.`
          });
        } else if (errorMessage.includes('409')) {
          // Generic 409 conflict error
          setValidationErrors({
            submit: 'Conflict: This product already exists. Please check the UPC code.'
          });
        } else {
          // Generic API error
          setValidationErrors({
            submit: `Error: ${errorMessage.split('\n')[0] || 'Failed to save product'}`,
          });
        }
      } catch (parseError) {
        setValidationErrors({
          submit: 'An unexpected error occurred. Please try again.'
        });
      }

      setIsSaving(false);
    }
  }

  // if (!isOpen) return null;

  return (
    <div>
      <AnimatePresence>
        {
          isOpen && (
            <div className="fixed inset-0 z-100 flex items-center justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40"
                onClick={onClose}
              >
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                  className="fixed right-0 top-0 h-full w-3/4 bg-white shadow-2xl z-50 flex flex-col rounded-l-[3rem] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="bg-slate-900 p-10 flex justify-between items-center text-white shrink-0">
                    <div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-200">{title}</h2>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                        {subtitle}
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="rounded-lg p-2 bg-gray-400 hover:bg-gray-100 transition-colors"
                    >
                      <X size={20} sm-size={24} className="text-gray-600" />
                    </button>
                  </div>

                  {/* Sections */}
                  <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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
                          className={`transition-transform text-gray-600 ${expandedSection === 'info' ? 'rotate-180' : ''
                            }`}
                        />
                      </button>

                      <AnimatePresence>
                        {expandedSection === 'info' && (
                          <motion.div
                            key="info-section"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-gray-200 px-6 py-6 space-y-6 bg-white"
                          >
                            <div className="grid gap-6 grid-cols-2 items-start">
                              <div>
                                {/* Product Name */}
                                <div className="col-span-2">
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
                                {/* Product Description */}
                                <div className="col-span-2 mt-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Description
                                  </label>
                                  <textarea rows={5}
                                    value={formData.description}
                                    onChange={(e) =>
                                      handleInputChange('description', e.target.value)
                                    }
                                    placeholder="Enter product description..."
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" ></textarea>

                                </div>
                              </div>
                              {/* Image Upload */}
                              <div >
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Add Image
                                </label>
                                <label className="border-2 border-dashed border-blue-300 rounded-lg p-4 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 cursor-pointer transition h-50 overflow-hidden">

                                  {/* Show preview INSIDE box */}
                                  {formData.image_url ? (
                                    <img
                                      src={formData.image_url}
                                      alt="Preview"
                                      className="h-full w-full object-cover rounded-md"
                                    />
                                  ) : (
                                    <>
                                      <Upload size={20} className="text-blue-600 mb-1" />
                                      <span className="text-xs text-gray-600">Click to upload</span>
                                    </>
                                  )}

                                  {/* Hidden input */}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          setFormData({
                                            ...formData,
                                            image_url: reader.result as string,
                                          });
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                              {/* Departments */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Departments</label>
                                <div className="flex gap-2">
                                  <div className="relative w-full">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedSection2(expandedSection2 === 'categoriDropdown' ? null : 'categoriDropdown')}
                                      disabled={isLoadingData}
                                      className="w-full flex justify-between items-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                                    >
                                      <span>{isLoadingData ? 'Loading...' : (formData.category_name || 'Choose Department')}</span>
                                      <ChevronDown size={16} />
                                    </button>

                                    {expandedSection2 === 'categoriDropdown' && (
                                      <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                                        {categories.map((category) => (
                                          <div
                                            key={category.id}
                                            onClick={() => {
                                              handleInputChange('category_name', category.name);
                                              setExpandedSection2(null);
                                            }}
                                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${formData.category_name === category.name ? 'bg-blue-100 font-medium' : ''
                                              }`}
                                          >
                                            {category.name}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setAddNewModal({ ...addNewModal, isOpen: true, type: 'category' })}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 whitespace-nowrap flex items-center gap-1"
                                  >
                                    <Plus size={16} />
                                    <span className="hidden sm:inline">Add New</span>
                                  </button>
                                </div>
                              </div>

                              {/* Brand */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                                <div className="flex gap-2">
                                  <div className="relative w-full">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedSection2(expandedSection2 === 'brandDropdown' ? null : 'brandDropdown')}
                                      disabled={isLoadingData}
                                      className="w-full flex justify-between items-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/20"
                                    >
                                      <span>{isLoadingData ? 'Loading...' : (formData.brand_name || 'Choose Brand')}</span>
                                      <ChevronDown size={16} />
                                    </button>

                                    {expandedSection2 === 'brandDropdown' && (
                                      <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                                        {brands.map((brand) => (
                                          <div
                                            key={brand.id}
                                            onClick={() => {
                                              handleInputChange('brand_name', brand.name);
                                              setExpandedSection2(null);
                                            }}
                                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${formData.brand_name === brand.name ? 'bg-blue-100 font-medium' : ''
                                              }`}
                                          >
                                            {brand.name}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setAddNewModal({ ...addNewModal, isOpen: true, type: 'brand' })}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 whitespace-nowrap flex items-center gap-1"
                                  >
                                    <Plus size={16} />
                                    <span className="hidden sm:inline">Add New</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center gap-4">
                              {/* Units */}
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
                                <div className="flex gap-2">
                                  <div className="relative w-full">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedSection2(expandedSection2 === 'unitDropdown' ? null : 'unitDropdown')}
                                      disabled={isLoadingData}
                                      className="w-full flex justify-between items-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/20"
                                    >
                                      <span>{isLoadingData ? 'Loading...' : (formData.unit_name || 'Choose Unit')}</span>
                                      <ChevronDown size={16} />
                                    </button>

                                    {expandedSection2 === 'unitDropdown' && (
                                      <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                                        {units.map((unit) => (
                                          <div
                                            key={unit.id}
                                            onClick={() => {
                                              handleInputChange('unit_name', unit.name);
                                              setExpandedSection2(null);
                                            }}
                                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${formData.unit_name === unit.name ? 'bg-blue-100 font-medium' : ''
                                              }`}
                                          >
                                            {unit.name}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setAddNewModal({ ...addNewModal, isOpen: true, type: 'unit' })}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 whitespace-nowrap flex items-center gap-1"
                                  >
                                    <Plus size={16} />
                                    <span className="hidden sm:inline">Add New</span>
                                  </button>
                                </div>
                              </div>

                              {/* UPC/PLU toggle and inputs (unchanged) */}
                              <div className="flex-1 flex justify-between items-center w-full gap-2">
                                <div className="flex-1 flex flex-col bg-gray-100 rounded-lg">
                                  {['upc', 'plu'].map((type) => (
                                    <button
                                      key={`code-toggle-${type}`}
                                      type="button"
                                      onClick={() => setCodeType(type as 'upc' | 'plu')}
                                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${codeType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                      {type.toUpperCase()}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {codeType === 'upc' ? 'UPC Code' : 'PLU Code'}
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={codeType === 'upc' ? formData.upc_code : formData.plu_code}
                                      onChange={(e) => {
                                        if (codeType === 'upc') {
                                          handleInputChange('upc_code', e.target.value);
                                          handleInputChange('plu_code', '');
                                        } else {
                                          handleInputChange('plu_code', e.target.value);
                                          handleInputChange('upc_code', '');
                                        }
                                      }}
                                      placeholder={`Enter ${codeType.toUpperCase()} code`}
                                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => (codeType === 'upc' ? generateUPC() : generatePLU())}
                                      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 whitespace-nowrap"
                                    >
                                      Generate
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-3">
                                Age Verification
                              </label>
                              <div className="flex gap-4">
                                {[
                                  { value: false, label: 'None' },
                                  { value: true, label: 'Default (18+)' },
                                ].map((option, index) => (
                                  <label key={`${option.label}-${index}`} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      checked={formData.age_verification === option.value}
                                      onChange={() => handleInputChange('age_verification', option.value)}
                                    />
                                    <span className="text-sm text-gray-700">{option.label}</span>
                                  </label>
                                ))}
                              </div>
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
                          className={`transition-transform text-gray-600 ${expandedSection === 'pricing' ? 'rotate-180' : ''
                            }`}
                        />
                      </button>

                      <AnimatePresence>
                        {expandedSection === 'pricing' && (
                          <motion.div
                            key="pricing-section"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-gray-200 px-6 py-6 space-y-6 bg-white"
                          >
                            <div className="grid grid-cols-3 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Buying Price
                                </label>
                                <input
                                  type="number"
                                  value={formData.buying_price}
                                  onChange={(e) =>
                                    handleInputChange('buying_price', e.target.value === '' ? 0 : Number(e.target.value))
                                  }
                                  placeholder="Enter buying price"
                                  className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${validationErrors.buying_price
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300'
                                    }`}
                                />
                                {validationErrors.buying_price && (
                                  <p className="text-xs text-red-600 mt-1">{validationErrors.buying_price}</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Selling Price
                                </label>
                                <input
                                  type="number"
                                  value={formData.selling_price}
                                  onChange={(e) =>
                                    handleInputChange('selling_price', parseFloat(e.target.value) || 0)
                                  }
                                  placeholder="Enter selling price"
                                  className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${validationErrors.selling_price
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300'
                                    }`}
                                />
                                {validationErrors.selling_price && (
                                  <p className="text-xs text-red-600 mt-1">{validationErrors.selling_price}</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Custom Price
                                </label>
                                <input
                                  type="number"
                                  value={formData.custom_price}
                                  onChange={(e) =>
                                    handleInputChange('custom_price', parseFloat(e.target.value) || 0)
                                  }
                                  placeholder="Enter custom price"
                                  className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${validationErrors.custom_price
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300'
                                    }`}
                                />
                                {validationErrors.custom_price && (
                                  <p className="text-xs text-red-600 mt-1">{validationErrors.custom_price}</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Quantity
                                </label>
                                <input
                                  type="number"
                                  value={formData.quantity}
                                  onChange={(e) =>
                                    handleInputChange('quantity', parseFloat(e.target.value) || 0)
                                  }
                                  placeholder="Enter quantity"
                                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Quantity Alert
                                </label>
                                <input
                                  type="number"
                                  value={formData.quantity_alert}
                                  onChange={(e) =>
                                    handleInputChange('quantity_alert', parseFloat(e.target.value) || 0)
                                  }
                                  placeholder="Enter quantity alert"
                                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>


                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Discount (%)
                                </label>
                                <input
                                  type="number"
                                  value={formData.discount}
                                  onChange={(e) =>
                                    handleInputChange('discount', parseFloat(e.target.value) || 0)
                                  }
                                  placeholder="Enter discount percentage"
                                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>

                            </div>

                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Details Section */}
                    <motion.div className="overflow-hidden rounded-lg border border-gray-200">
                      <button
                        onClick={() =>
                          setExpandedSection(
                            expandedSection === 'details' ? null : 'details'
                          )
                        }
                        className="flex w-full items-center justify-between bg-gray-50 px-6 py-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                            <span className="text-sm font-bold text-slate-600">⚙</span>
                          </div>
                          <span className="text-lg font-semibold text-gray-900">
                            Details
                          </span>
                        </div>
                        <ChevronDown
                          size={20}
                          className={`transition-transform text-gray-600 ${expandedSection === 'details' ? 'rotate-180' : ''
                            }`}
                        />
                      </button>

                      <AnimatePresence>
                        {expandedSection === 'details' && (
                          <motion.div
                            key="details-section"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-gray-200 px-6 py-6 space-y-4 bg-white"
                          >
                            <p className="text-sm text-gray-500 italic">
                              No details added yet. You can add details to provide more details about your products.
                            </p>

                            <div className='grid grid-cols-3 gap-6'>
                              <div>
                                <label className="block text-lg font-medium text-gray-700 mb-2">
                                  EBT Eligible
                                </label>
                                <div className="flex gap-4">
                                  {[
                                    { value: true, label: 'Yes' },
                                    { value: false, label: 'No' },
                                  ].map((option, index) => (
                                    <label key={option.label ?? `ebtEligible-${index}`} className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="ebt_eligible"
                                        value={option.value as unknown as string}
                                        checked={formData.ebt_eligible === option.value}
                                        onChange={() => handleInputChange('ebt_eligible', option.value)}

                                      />
                                      <span className="text-lg font-medium text-gray-700">
                                        {option.label}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block text-lg font-medium text-gray-700 mb-2">
                                  Sold by Weight
                                </label>
                                <div className="flex gap-4">
                                  {[
                                    { value: true, label: 'Yes' },
                                    { value: false, label: 'No' },
                                  ].map((option, index) => (
                                    <label key={option.label ?? `soldByWeight-${index}`} className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="sold_by_weight"
                                        checked={formData.sold_by_weight === option.value}
                                        onChange={() =>
                                          handleInputChange('sold_by_weight', option.value)
                                        }
                                      />
                                      <span className="text-lg font-medium text-gray-700">
                                        {option.label}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block text-lg font-medium text-gray-700 mb-2">
                                  Refundable
                                </label>
                                <div className="flex gap-4">
                                  {[
                                    { value: true, label: 'Yes' },
                                    { value: false, label: 'No' },
                                  ].map((option, index) => (
                                    <label key={option.label ?? `refundable-${index}`} className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="is_refundable"
                                        checked={formData.is_refundable === option.value}
                                        onChange={() =>
                                          handleInputChange('is_refundable', option.value)
                                        }
                                      />
                                      <span className="text-lg font-medium text-gray-700">
                                        {option.label}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Warranty Period
                                </label>
                                <input
                                  type="date"
                                  value={formData.warranty_period || ''}
                                  onChange={(e) =>
                                    handleInputChange('warranty_period', e.target.value)
                                  }
                                  placeholder="e.g. 6 months, 1 year"
                                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Manufacturer Date
                                </label>
                                <input
                                  type="date"
                                  value={formData.manufacturer_date || ''}
                                  onChange={(e) =>
                                    handleInputChange('manufacturer_date', e.target.value)
                                  }
                                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Expiration Date
                                </label>
                                <input
                                  type="date"
                                  value={formData.expiration_date || ''}
                                  onChange={(e) =>
                                    handleInputChange('expiration_date', e.target.value)
                                  }
                                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Warranty Description
                                </label>
                                <input
                                  type="text"
                                  value={formData.warranty_description}
                                  onChange={(e) =>
                                    handleInputChange('warranty_description', e.target.value)
                                  }
                                  placeholder="Enter warranty description"
                                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Availability
                                </label>
                                <div className="flex gap-4">
                                  {[
                                    { value: true, label: 'Available' },
                                    { value: false, label: 'Unavailable' },
                                  ].map((option, index) => (
                                    <label key={option.label ?? `availability-${index}`} className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="is_available"
                                        checked={formData.is_available === option.value}
                                        onChange={() =>
                                          handleInputChange('is_available', option.value)
                                        }
                                      />
                                      <span className="text-sm font-medium text-gray-700">
                                        {option.label}
                                      </span>
                                    </label>
                                  ))}

                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

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
                                className="fixed right-0 top-0 h-screen w-full sm:w-96 lg:w-105 bg-white shadow-2xl z-50 overflow-y-auto"
                              >
                                {/* Header */}
                                <div className="sticky top-0 bg-linear-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 sm:py-6 text-white flex justify-between items-center gap-2">
                                  <h2 className="text-base sm:text-lg lg:text-xl font-bold">
                                    Add {addNewModal.type === 'category' ? 'Category' : addNewModal.type === 'brand' ? 'Brand' : 'Unit'}
                                  </h2>
                                  <button
                                    onClick={() => setAddNewModal({ ...addNewModal, isOpen: false, type: null, name: '', description: '', taxes: '', fees: '' })}
                                    className="hover:bg-white/20 p-2 rounded-lg transition-colors shrink-0"
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
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>

                      </AnimatePresence>

                      {/* Footer Buttons */}
                      <div className="sticky bottom-0 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 space-y-3 border-t border-gray-200">
                        {saveSuccess && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                            <span className="text-lg">✅</span>
                            <p className="text-xs sm:text-sm font-semibold text-green-700">Product saved successfully!</p>
                          </div>
                        )}
                        {Object.keys(validationErrors).length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-xs sm:text-sm font-semibold text-red-700 mb-2">Validation Errors:</p>
                            <ul className="space-y-1">
                              {Object.entries(validationErrors).map(([field, error]) => (
                                <li key={field} className="text-xs text-red-600">• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex gap-2 sm:gap-3">
                          <motion.button
                            key={"close"}
                            disabled={isSaving}
                            whileHover={!isSaving ? { scale: 1.02 } : {}}
                            whileTap={!isSaving ? { scale: 0.98 } : {}}
                            onClick={onClose}
                            className={`flex-1 rounded-lg border-2 px-3 sm:px-4 py-2 sm:py-2.5 font-bold transition-colors text-sm sm:text-base ${isSaving
                              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                              }`}
                          >
                            Close
                          </motion.button>
                          <motion.button
                            key={"save"}
                            disabled={isSaving}
                            whileHover={!isSaving ? { scale: 1.02 } : {}}
                            whileTap={!isSaving ? { scale: 0.98 } : {}}
                            onClick={() => {
                              handleSaveNewProduct();
                              setAddNewModal({ ...addNewModal, isOpen: false, type: null, name: '', description: '', taxes: '', fees: '' });
                            }}
                            className={`flex-1 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 font-bold text-white transition-colors flex items-center justify-center gap-1 text-sm sm:text-base ${isSaving
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                          >
                            {isSaving ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1 }}
                                  className="w-4 h-4"
                                >
                                  ⏳
                                </motion.div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Check size={16} />
                                Save
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>

                  </div>
                </motion.div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence>
    </div>
  );
}

export default ProductModal;