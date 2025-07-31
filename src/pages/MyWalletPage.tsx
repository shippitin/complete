// src/pages/MyWalletPage.tsx
import React, { useState } from 'react';
import { FaRupeeSign, FaSearch, FaChevronDown, FaInfoCircle, FaCoins, FaGift, FaRegCreditCard } from 'react-icons/fa';

interface Transaction {
  id: number;
  type: 'Credit' | 'Debit';
  amount: number;
  date: string;
  description: string;
  shipmentId?: string;
  bookingCategory?: string;
  transactionType: 'myCash' | 'Reward Bonus' | 'Refund' | 'Other'; // New: Specific type for filtering
}

const MyWalletPage: React.FC = () => {
  const [balance] = useState(5000); // Dummy initial balance
  const [] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'myCash' | 'Reward Bonus'>('All'); // New: for transaction tabs
  const [activeSubTab, setActiveSubTab] = useState<'Refunds' | 'Others'>('Refunds'); // New: for transaction sub-tabs

  const [transactionHistory] = useState<Transaction[]>([
    { id: 1, type: 'Credit', amount: 2000, date: '2025-07-10', description: 'Initial Top-up', transactionType: 'myCash' },
    { id: 2, type: 'Debit', amount: 500, date: '2025-07-12', description: 'Payment for FLM-12345', shipmentId: 'FLM-12345', bookingCategory: 'First/Last Mile', transactionType: 'myCash' },
    { id: 3, type: 'Credit', amount: 3500, date: '2025-07-15', description: 'Top-up from Bank', transactionType: 'myCash' },
    { id: 4, type: 'Credit', amount: 1000, date: '2025-07-18', description: 'Refund for shipment #9876', shipmentId: 'TRK-9876', bookingCategory: 'Truck', transactionType: 'Refund' },
    { id: 5, type: 'Debit', amount: 750, date: '2025-07-19', description: 'Payment for Air-54321', shipmentId: 'AIR-54321', bookingCategory: 'Air', transactionType: 'myCash' },
    { id: 6, type: 'Debit', amount: 1200, date: '2025-07-20', description: 'Payment for Sea-7890', shipmentId: 'SEA-7890', bookingCategory: 'Sea', transactionType: 'myCash' },
    { id: 7, type: 'Credit', amount: 300, date: '2025-07-21', description: 'Insurance claim payout', bookingCategory: 'Insurance', transactionType: 'Reward Bonus' },
    { id: 8, type: 'Credit', amount: 150, date: '2025-07-22', description: 'Reward for referral', transactionType: 'Reward Bonus' },
    { id: 9, type: 'Debit', amount: 201, date: '2023-07-15', description: 'Booking', shipmentId: 'NF7ECKKXRRDTN62M6T4761', transactionType: 'myCash' },
    { id: 10, type: 'Debit', amount: 802, date: '2023-07-15', description: 'Booking', shipmentId: 'NU710581056600636', transactionType: 'myCash' },
    { id: 11, type: 'Credit', amount: 1003, date: '2022-05-01', description: 'Booking', shipmentId: 'NF76OWJ4TYZS1YY93441', transactionType: 'myCash' },
  ]);

  const faqItems = [
    { question: 'What is My Cash?', answer: 'My Cash is the balance in your wallet that can be used for booking logistics services.' },
    { question: 'When does My Cash expire?', answer: 'My Cash typically does not expire, but promotional credits may have an expiry date.' },
    { question: 'Where is My Cash applicable?', answer: 'My Cash can be used for all logistics bookings available on our platform.' },
    { question: 'What is Reward Bonus?', answer: 'Reward Bonus is extra credit earned through promotions, referrals, or loyalty programs.' },
    { question: 'When does Reward Bonus expire?', answer: 'Reward Bonus may have varying expiry dates depending on the promotion. Please check specific terms.' },
    { question: 'Where is Reward Bonus applicable?', answer: 'Reward Bonus can be used for specific services or bookings as outlined in the promotion terms.' },
  ];



  const getTransactionsByDate = (transactions: Transaction[]) => {
    const grouped: { [key: string]: Transaction[] } = {};
    transactions.forEach(t => {
      const date = new Date(t.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(t);
    });
    return grouped;
  };

  const filteredTransactions = transactionHistory.filter(transaction => {
    const matchesSearch = searchTerm === '' ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.shipmentId && transaction.shipmentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.bookingCategory && transaction.bookingCategory.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTab = activeTab === 'All' || transaction.transactionType === activeTab;
    const matchesSubTab = activeTab !== 'All' || (activeSubTab === 'Refunds' && transaction.transactionType === 'Refund') || (activeSubTab === 'Others' && transaction.transactionType !== 'Refund');

    return matchesSearch && matchesTab && matchesSubTab;
  });

  const groupedTransactions = getTransactionsByDate(filteredTransactions);
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  console.log("MyWalletPage component is attempting to render."); // Debug log

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="lg:w-1/3 bg-white rounded-3xl shadow-xl overflow-hidden p-6 space-y-6">
          {/* Wallet Balance Summary */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-800 text-white p-6 rounded-2xl text-center">
            <p className="text-lg font-semibold opacity-90">WALLET BALANCE</p>
            <p className="text-5xl font-extrabold flex items-center justify-center mt-2">
              <FaRupeeSign className="text-4xl mr-2" />{balance.toLocaleString('en-IN')}
            </p>
          </div>

          {/* My Cash Section */}
          <div className="border border-gray-200 rounded-2xl p-5 bg-blue-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <FaCoins className="mr-2 text-yellow-500" /> My Cash
              </h3>
              <span className="text-2xl font-bold text-gray-900 flex items-center">
                <FaRupeeSign className="text-xl mr-1" />{balance.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4 flex items-center">
              <FaInfoCircle className="mr-1 text-blue-500" /> USE UNRESTRICTED
            </p>
            <button className="text-blue-600 hover:underline text-sm font-semibold">How to earn?</button>
          </div>

          {/* FAQs Section */}
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <details key={index} className="group bg-gray-50 rounded-lg p-4 shadow-sm cursor-pointer hover:bg-gray-100 transition-colors">
                <summary className="flex justify-between items-center font-semibold text-gray-800">
                  {faq.question}
                  <FaChevronDown className="transform transition-transform group-open:rotate-180 text-gray-500" />
                </summary>
                <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:w-2/3 bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Wallet Transactions Header */}
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <FaRegCreditCard className="mr-3 text-purple-600" /> Wallet Transactions
            </h2>
          </div>

          {/* Transaction Tabs */}
          <div className="px-6 sm:px-8 pt-4 border-b border-gray-200">
            <div className="flex space-x-4 mb-4">
              <button
                className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
                  activeTab === 'All' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('All')}
              >
                All
              </button>
              <button
                className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
                  activeTab === 'myCash' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('myCash')}
              >
                myCash
              </button>
              <button
                className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
                  activeTab === 'Reward Bonus' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('Reward Bonus')}
              >
                <FaGift className="inline mr-1" /> Reward Bonus
              </button>
            </div>

            {activeTab === 'All' && (
              <div className="flex space-x-4 mb-4">
                <button
                  className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
                    activeSubTab === 'Refunds' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveSubTab('Refunds')}
                >
                  Refunds
                </button>
                <button
                  className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
                    activeSubTab === 'Others' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveSubTab('Others')}
                >
                  Others
                </button>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative px-6 sm:px-8 py-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-lg shadow-sm"
            />
            <FaSearch className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Transaction List */}
          <div className="p-6 sm:p-8 space-y-6">
            {sortedDates.length > 0 ? (
              sortedDates.map(date => (
                <div key={date}>
                  <p className="text-sm font-semibold text-gray-500 mb-3 uppercase">{date}</p>
                  <div className="space-y-4">
                    {groupedTransactions[date].map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center">
                          <div className="bg-gray-200 p-3 rounded-full mr-4">
                            <FaRegCreditCard className="text-gray-600 text-xl" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{transaction.description}</p>
                            {transaction.shipmentId && (
                              <p className="text-sm text-blue-600 font-medium">Booking ID: {transaction.shipmentId}</p>
                            )}
                            <p className="text-xs text-gray-500">{transaction.transactionType} Debited</p> {/* Example: My Cash Debited */}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold flex items-center ${transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'Credit' ? '+' : '-'} <FaRupeeSign className="text-sm mr-1" />{transaction.amount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">No transactions found matching your criteria.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyWalletPage;
