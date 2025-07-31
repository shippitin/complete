// src/components/TrainBooking/RailPayment.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaMoneyBillWave, FaArrowLeft, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaRupeeSign, FaBuilding } from 'react-icons/fa';

interface RailPaymentProps {
  finalPrice: number;
  onBackToCompleteBooking: () => void; // Callback to go back to RailCompleteBooking
}

const RailPayment: React.FC<RailPaymentProps> = ({ finalPrice, onBackToCompleteBooking }) => {
  // --- DEBUGGING: Check if this component is rendering ---
  console.log("RailPayment component is rendering.");
  console.log("Received finalPrice:", finalPrice);
  // --- END DEBUGGING ---

  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | ''>('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [netbankingBank, setNetbankingBank] = useState('');

  // State for validation errors
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const handlePayment = () => {
    const newErrors: Partial<Record<string, string>> = {};

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method.';
    } else if (paymentMethod === 'card') {
      if (!cardNumber || !/^\d{16}$/.test(cardNumber)) newErrors.cardNumber = 'Valid 16-digit Card Number is required.';
      if (!cardName) newErrors.cardName = 'Card Holder Name is required.';
      if (!expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) newErrors.expiryDate = 'Valid MM/YY Expiry Date is required.';
      if (!cvv || !/^\d{3,4}$/.test(cvv)) newErrors.cvv = 'Valid 3 or 4 digit CVV is required.';
    } else if (paymentMethod === 'upi') {
      if (!upiId || !/\S+@\S+/.test(upiId)) newErrors.upiId = 'Valid UPI ID is required (e.g., yourname@bank).';
    } else if (paymentMethod === 'netbanking') {
      if (!netbankingBank) newErrors.netbankingBank = 'Please select your bank.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setValidationMessage('Please correct the highlighted payment details.');
      setShowValidationMessage(true);
      return;
    }

    // Simulate payment success
    console.log("Simulating payment for:", finalPrice);
    // In a real application, you would integrate with a payment gateway here.
    // On successful payment, navigate to confirmation page.
    const bookingId = `TRN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    navigate('/booking-confirmation', { state: { bookingId, amountPaid: finalPrice, serviceType: 'Train Booking' } });
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'card':
        return (
          <div className="grid grid-cols-1 gap-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number<span className="text-red-500">*</span></label>
              <input
                type="text"
                id="cardNumber"
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 ${errors.cardNumber ? 'border-orange-500' : ''}`}
                placeholder="XXXX XXXX XXXX XXXX"
                value={cardNumber}
                onChange={(e) => { setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16)); setErrors((prev) => ({ ...prev, cardNumber: undefined })); }}
                maxLength={16}
                required
              />
              {errors.cardNumber && <p className="mt-1 text-sm text-orange-600">{errors.cardNumber}</p>}
            </div>
            <div>
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name<span className="text-red-500">*</span></label>
              <input
                type="text"
                id="cardName"
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 ${errors.cardName ? 'border-orange-500' : ''}`}
                placeholder="Name on Card"
                value={cardName}
                onChange={(e) => { setCardName(e.target.value); setErrors((prev) => ({ ...prev, cardName: undefined })); }}
                required
              />
              {errors.cardName && <p className="mt-1 text-sm text-orange-600">{errors.cardName}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (MM/YY)<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="expiryDate"
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 ${errors.expiryDate ? 'border-orange-500' : ''}`}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 2) {
                      value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    setExpiryDate(value);
                    setErrors((prev) => ({ ...prev, expiryDate: undefined }));
                  }}
                  maxLength={5}
                  required
                />
                {errors.expiryDate && <p className="mt-1 text-sm text-orange-600">{errors.expiryDate}</p>}
              </div>
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV<span className="text-red-500">*</span></label>
                <input
                  type="password"
                  id="cvv"
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 ${errors.cvv ? 'border-orange-500' : ''}`}
                  placeholder="XXX"
                  value={cvv}
                  onChange={(e) => { setCvv(e.target.value.replace(/\D/g, '').slice(0, 4)); setErrors((prev) => ({ ...prev, cvv: undefined })); }}
                  maxLength={4}
                  required
                />
                {errors.cvv && <p className="mt-1 text-sm text-orange-600">{errors.cvv}</p>}
              </div>
            </div>
          </div>
        );
      case 'upi':
        return (
          <div>
            <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">UPI ID<span className="text-red-500">*</span></label>
            <input
              type="text"
              id="upiId"
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 ${errors.upiId ? 'border-orange-500' : ''}`}
              placeholder="yourname@bank"
              value={upiId}
              onChange={(e) => { setUpiId(e.target.value); setErrors((prev) => ({ ...prev, upiId: undefined })); }}
              required
            />
            {errors.upiId && <p className="mt-1 text-sm text-orange-600">{errors.upiId}</p>}
            <p className="mt-2 text-sm text-gray-500">
              You will receive a payment request on your UPI app.
            </p>
          </div>
        );
      case 'netbanking':
        const banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Other'];
        return (
          <div>
            <label htmlFor="netbankingBank" className="block text-sm font-medium text-gray-700 mb-1">Select Bank<span className="text-red-500">*</span></label>
            <select
              id="netbankingBank"
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 ${errors.netbankingBank ? 'border-orange-500' : ''}`}
              value={netbankingBank}
              onChange={(e) => { setNetbankingBank(e.target.value); setErrors((prev) => ({ ...prev, netbankingBank: undefined })); }}
              required
            >
              <option value="">Select your bank</option>
              {banks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
            {errors.netbankingBank && <p className="mt-1 text-sm text-orange-600">{errors.netbankingBank}</p>}
            <p className="mt-2 text-sm text-gray-500">
              You will be redirected to your bank's netbanking portal.
            </p>
          </div>
        );
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            Please select a payment method to proceed.
          </div>
        );
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-xl border border-gray-200 font-inter max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBackToCompleteBooking}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium transition duration-200"
      >
        <FaArrowLeft className="mr-2" /> Back to Complete Booking
      </button>

      {/* Step Indicators */}
      <div className="flex justify-around mb-8 text-center">
        <div className={`flex-1 text-blue-600 font-bold`}>
          <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-blue-600 bg-blue-100`}>
            1
          </div>
          Review Details
        </div>
        <div className={`flex-1 text-blue-600 font-bold`}>
          <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-blue-600 bg-blue-100`}>
            2
          </div>
          Contact & KYC Details
        </div>
        <div className={`flex-1 text-blue-600 font-bold`}>
          <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-blue-600 bg-blue-100`}>
            3
          </div>
          Payment
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center">
        <FaCreditCard className="text-blue-500 mr-4 text-4xl" /> Secure Payment
      </h2>
      <p className="text-gray-700 mb-8 text-center">
        Your total amount due is: <span className="text-blue-700 font-bold text-2xl flex items-center justify-center mt-2"><FaRupeeSign className="text-xl mr-1" />{finalPrice.toLocaleString('en-IN')}</span>
      </p>

      {/* Payment Method Selection */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <FaMoneyBillWave className="text-blue-500 mr-3 text-3xl" /> Select Payment Method
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => { setPaymentMethod('card'); setErrors((prev) => ({ ...prev, paymentMethod: undefined })); }}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition duration-200 ${
              paymentMethod === 'card' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <FaCreditCard className="text-4xl text-blue-600 mb-2" />
            <span className="font-semibold text-gray-800">Credit/Debit Card</span>
          </button>
          <button
            type="button"
            onClick={() => { setPaymentMethod('upi'); setErrors((prev) => ({ ...prev, paymentMethod: undefined })); }}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition duration-200 ${
              paymentMethod === 'upi' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-Vector.svg" alt="UPI Logo" className="h-10 mb-2" />
            <span className="font-semibold text-gray-800">UPI</span>
          </button>
          <button
            type="button"
            onClick={() => { setPaymentMethod('netbanking'); setErrors((prev) => ({ ...prev, paymentMethod: undefined })); }}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition duration-200 ${
              paymentMethod === 'netbanking' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <FaBuilding className="text-4xl text-blue-600 mb-2" />
            <span className="font-semibold text-gray-800">Net Banking</span>
          </button>
        </div>
        {errors.paymentMethod && <p className="mt-4 text-sm text-orange-600 text-center">{errors.paymentMethod}</p>}
      </div>

      {/* Conditional Payment Form */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
        {renderPaymentForm()}
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={handlePayment}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-full shadow-lg text-xl transition duration-300 transform hover:scale-105 flex items-center"
        >
          Pay Now <FaCheckCircle className="ml-2" />
        </button>
      </div>

      {/* Custom Validation Message Box */}
      {showValidationMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full relative">
            <button
              onClick={() => setShowValidationMessage(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <FaTimesCircle className="h-6 w-6" />
            </button>
            <div className="flex items-center mb-4">
              <FaInfoCircle className="text-orange-500 h-8 w-8 mr-3" />
              <h4 className="text-xl font-bold text-gray-800">Validation Error</h4>
            </div>
            <p className="text-gray-700 mb-6">{validationMessage}</p>
            <button
              onClick={() => setShowValidationMessage(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md w-full"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RailPayment;
