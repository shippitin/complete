// src/pages/MyWalletPage.tsx
import React, { useState, useEffect } from 'react';
import { FaRupeeSign, FaSearch, FaChevronDown, FaInfoCircle, FaCoins, FaGift, FaRegCreditCard } from 'react-icons/fa';
import { userAPI } from '../services/api';

interface Transaction {
  id: string;
  type: 'Credit' | 'Debit';
  amount: number;
  date: string;
  description: string;
  transactionType: 'myCash' | 'Reward Bonus' | 'Refund' | 'Other';
}

const faqItems = [
  { question: 'What is My Cash?', answer: 'My Cash is the balance in your wallet that can be used for booking logistics services.' },
  { question: 'When does My Cash expire?', answer: 'My Cash typically does not expire, but promotional credits may have an expiry date.' },
  { question: 'Where is My Cash applicable?', answer: 'My Cash can be used for all logistics bookings available on our platform.' },
  { question: 'What is Reward Bonus?', answer: 'Reward Bonus is extra credit earned through promotions, referrals, or loyalty programs.' },
  { question: 'When does Reward Bonus expire?', answer: 'Reward Bonus may have varying expiry dates depending on the promotion.' },
  { question: 'Where is Reward Bonus applicable?', answer: 'Reward Bonus can be used for specific services as outlined in the promotion terms.' },
];

const MyWalletPage: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'myCash' | 'Reward Bonus'>('All');
  const [activeSubTab, setActiveSubTab] = useState<'Refunds' | 'Others'>('Refunds');

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const walletRes = await userAPI.getWallet();
        const walletData = walletRes.data.data;
        setBalance(walletData?.balance || 0);
        setCurrency(walletData?.currency || 'INR');

        // For now transactions come from wallet_transactions table
        // When real transactions exist they will show here
        setTransactions([]);
      } catch (error) {
        console.error('Wallet fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const getTransactionsByDate = (txns: Transaction[]) => {
    const grouped: { [key: string]: Transaction[] } = {};
    txns.forEach(t => {
      const date = new Date(t.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(t);
    });
    return grouped;
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = searchTerm === '' ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || t.transactionType === activeTab;
    return matchesSearch && matchesTab;
  });

  const groupedTransactions = getTransactionsByDate(filteredTransactions);
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">

        {/* Left Sidebar */}
        <div className="lg:w-1/3 bg-white rounded-3xl shadow-xl overflow-hidden p-6 space-y-6">

          {/* Wallet Balance */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-800 text-white p-6 rounded-2xl text-center">
            <p className="text-lg font-semibold opacity-90">WALLET BALANCE</p>
            <p className="text-5xl font-extrabold flex items-center justify-center mt-2">
              <FaRupeeSign className="text-4xl mr-2" />{balance.toLocaleString('en-IN')}
            </p>
            <p className="text-sm opacity-75 mt-2">{currency}</p>
          </div>

          {/* My Cash */}
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
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition">
              Add Money
            </button>
          </div>

          {/* FAQs */}
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

        {/* Right Content */}
        <div className="lg:w-2/3 bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <FaRegCreditCard className="mr-3 text-purple-600" /> Wallet Transactions
            </h2>
          </div>

          {/* Tabs */}
          <div className="px-6 sm:px-8 pt-4 border-b border-gray-200">
            <div className="flex space-x-4 mb-4">
              {(['All', 'myCash', 'Reward Bonus'] as const).map(tab => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
                    activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'Reward Bonus' && <FaGift className="inline mr-1" />}
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative px-6 sm:px-8 py-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-lg shadow-sm"
            />
            <FaSearch className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Transactions */}
          <div className="p-6 sm:p-8 space-y-6">
            {sortedDates.length > 0 ? (
              sortedDates.map(date => (
                <div key={date}>
                  <p className="text-sm font-semibold text-gray-500 mb-3 uppercase">{date}</p>
                  <div className="space-y-4">
                    {groupedTransactions[date].map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                          <div className="bg-gray-200 p-3 rounded-full mr-4">
                            <FaRegCreditCard className="text-gray-600 text-xl" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{transaction.description}</p>
                            <p className="text-xs text-gray-500">{transaction.transactionType}</p>
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
              <div className="text-center py-16">
                <FaCoins className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No transactions yet</p>
                <p className="text-gray-400 text-sm mt-2">Your wallet transactions will appear here once you start booking.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyWalletPage;
