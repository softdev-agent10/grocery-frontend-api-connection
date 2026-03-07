'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  ChevronDown,
  Search,
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    category: 'Cash Drawer',
    question: 'How do I open the cash drawer?',
    answer:
      'Navigate to Dashboard > Tools > Cash Drawer. Click the "Quick Open" button to open the drawer. You can also use the "Open Drawer" tab to view opening transactions.',
  },
  {
    id: '2',
    category: 'Cash Drawer',
    question: 'How do I record cash deposits?',
    answer:
      'Go to Cash Drawer, click on the "Cash In" tab, and add a new transaction with the amount, time, and reason for the deposit.',
  },
  {
    id: '3',
    category: 'Cash Drawer',
    question: 'What do the transaction filters mean?',
    answer:
      'All Transactions: Shows all transactions. Cash In: Shows deposits. Cash Out: Shows withdrawals. Open Drawer: Shows drawer opening transactions.',
  },
  {
    id: '4',
    category: 'Inventory',
    question: 'How do I add a new product to inventory?',
    answer:
      'Go to Dashboard > Inventory > View Product, then click "Add New Product". Fill in product details like name, SKU, price, and quantity.',
  },
  {
    id: '5',
    category: 'Inventory',
    question: 'How do I check low stock items?',
    answer:
      'Navigate to Dashboard > Inventory > Low Stocks to see all products that are running low on inventory. Set minimum stock levels in product settings.',
  },
  {
    id: '6',
    category: 'Sales',
    question: 'How do I process a customer order?',
    answer:
      'Go to Sales section, search for products, add items to cart, select customer profile, and complete payment. The transaction will be recorded automatically.',
  },
  {
    id: '7',
    category: 'Accounts',
    question: 'How do I create a new user account?',
    answer:
      'Go to Settings > Account Manager. Click "Add New User", enter user details (name, email, username), set password, and assign role (Admin, Manager, Employee).',
  },
  {
    id: '8',
    category: 'Accounts',
    question: 'How do I reset a user password?',
    answer:
      'Go to Settings > Account Manager, find the user, click on their profile, and select "Reset Password". You can send them a reset link via email.',
  },
  {
    id: '9',
    category: 'Permissions',
    question: 'What are the different user roles?',
    answer:
      'Admin: Full system access. Manager: Can manage inventory and sales. Employee: Can process sales and view inventory. Customer: Can view own account and orders.',
  },
  {
    id: '10',
    category: 'Settings',
    question: 'How do I configure email notifications?',
    answer:
      'Go to Settings > Email System. Set up email triggers for transactions, low stock alerts, and customer notifications. Customize email templates as needed.',
  },
  {
    id: '11',
    category: 'General',
    question: 'Where can I find my dashboard analytics?',
    answer:
      'Click on Dashboard in the main menu to see key metrics including sales, inventory status, customer activity, and system performance.',
  },
  {
    id: '12',
    category: 'Support',
    question: 'How do I report a bug or issue?',
    answer:
      'Go to Settings > Suggestion Page. Fill out the form with details about the issue. Our support team will review and respond within 24 hours.',
  },
];

export default function HelpPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(faqs.map((faq) => faq.category)))];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full w-full flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-white"
    >
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 md:px-6 md:py-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 md:p-3">
            <HelpCircle className="h-5 w-5 text-blue-600 md:h-6 md:w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Help & Support</h1>
            <p className="text-xs text-gray-500 md:text-sm">
              Find answers to common questions
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6 lg:px-8">
        <div className="mx-auto  ">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search help topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 md:py-3 md:text-base"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === 'All' ? null : category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category ||
                  (category === 'All' && !selectedCategory)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-500">No help topics found. Try a different search.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                >
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === faq.id ? null : faq.id)
                    }
                    className="flex w-full items-center justify-between px-4 py-3.5 transition-colors hover:bg-gray-50 md:px-5 md:py-4"
                  >
                    <div className="flex flex-1 items-start gap-3">
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                          {faq.question}
                        </h3>
                        <p className="text-xs text-gray-500 md:text-sm">
                          {faq.category}
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedId === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 text-gray-400"
                    >
                      <ChevronDown className="h-5 w-5" />
                    </motion.div>
                  </button>

                  {/* Answer */}
                  {expandedId === faq.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-200 bg-gray-50 px-4 py-3 md:px-5 md:py-4"
                    >
                      <p className="text-sm text-gray-700 leading-relaxed md:text-base">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </div>

          {/* Contact Support */}
          <div className="mt-8 rounded-lg border border-indigo-200 bg-indigo-50 p-4 md:p-6">
            <h3 className="font-semibold text-indigo-900 mb-2">Still need help?</h3>
            <p className="text-sm text-indigo-800 mb-4">
              Can't find what you're looking for? Contact our support team.
            </p>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
