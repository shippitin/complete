// src/pages/RailServiceDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaClipboardList, FaArrowLeft,
  FaArrowRight, FaChevronDown, FaChevronUp, FaTag,
} from 'react-icons/fa';
import type {
  AllFormData, TrainContainerFormData, TrainGoodsFormData,
  TrainParcelFormData, FreightTrainResult,
} from '../types/QuoteFormHandle';

import { computeRailCharges } from '../utils/railCharges';

const VALID_PROMOS: Record<string, number> = {
  SHIP10:   0.10,
  RAIL5:    0.05,
  DEMO2026: 0.15,
};

const RailServiceDetailsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData]                       = useState<AllFormData | null>(null);
  const [selectedTrainResult, setSelectedTrainResult] = useState<FreightTrainResult | null>(null);
  const [loading, setLoading]                         = useState(true);
  const [error, setError]                             = useState<string | null>(null);
  const [insuranceRequired, setInsuranceRequired]     = useState(false);
  const [showBreakup, setShowBreakup]                 = useState(true);
  const [promoInput, setPromoInput]                   = useState('');
  const [promoCode, setPromoCode]                     = useState('');
  const [promoError, setPromoError]                   = useState('');
  const [termsConfirmed, setTermsConfirmed]           = useState(false);
  const [gstInput, setGstInput]                       = useState(false);   // "I have a GST number" — makes GSTIN required on the booking page

  useEffect(() => {
    const state = location.state as {
      formData: AllFormData;
      selectedTrainResult: FreightTrainResult;
    } | undefined;

    if (state?.formData && state?.selectedTrainResult) {
      setFormData(state.formData);
      setSelectedTrainResult(state.selectedTrainResult);
      if ('insuranceRequired' in state.formData) {
        setInsuranceRequired((state.formData as any).insuranceRequired || false);
      }
      setLoading(false);
    } else {
      setError('No service details provided. Please go back to search results.');
      setLoading(false);
    }
  }, [location.state]);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (VALID_PROMOS[code]) { setPromoCode(code); setPromoError(''); }
    else { setPromoCode(''); setPromoError('Invalid promo code. Try SHIP10, RAIL5 or DEMO2026.'); }
  };
  const removePromo = () => { setPromoCode(''); setPromoInput(''); setPromoError(''); };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center p-10 bg-white rounded-2xl shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading service details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-10 bg-white rounded-2xl shadow-xl text-center">
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <button onClick={() => navigate('/train-results')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          <FaArrowLeft className="inline mr-2" /> Back to Results
        </button>
      </div>
    </div>
  );

  const isContainer   = formData!.bookingType === 'Train Container Booking';
  const cfd           = formData as TrainContainerFormData;
  const isDomestic    = isContainer ? cfd.isDomestic !== false : true;
  const containerType = isContainer ? (cfd.containerType || '20ft Standard') : '20ft Standard';
  const numContainers = isContainer ? (cfd.numberOfContainers || 1) : 1;
  const serviceType   = isContainer ? cfd.serviceType : 'terminalToTerminal';

  // Read add-ons selected on Recommended Services page
  const addFirstMile = (formData as any)?.addFirstMile || false;
  const addLastMile  = (formData as any)?.addLastMile  || false;
  const addCustoms   = (formData as any)?.addCustoms   || false;

  const customsFee    = addCustoms ? 2000 : 0;
  const gstCustoms    = Math.round(customsFee * 0.18);

  const isDoorOrigin = isContainer && (
    addFirstMile ||
    serviceType === 'doorToDoor' || serviceType === 'doorToTerminal' || serviceType === 'doorToPort'
  );
  const isDoorDest = isContainer && (
    addLastMile ||
    serviceType === 'doorToDoor' || serviceType === 'terminalToDoor' || serviceType === 'portToDoor'
  );
  const isDestPort   = isContainer && (serviceType === 'terminalToPort' || serviceType === 'doorToPort');
  const isOriginPort = isContainer && (serviceType === 'portToTerminal' || serviceType === 'portToDoor');

  const baseRailFreight = selectedTrainResult!.price;

  const { thcPerSide, thcOrigin, thcDest, otherCharges, firstMile, lastMile, platformFee, subtotal } =
    computeRailCharges({
      baseRailFreight, isDomestic, containerType, numContainers,
      doorOrigin: isDoorOrigin, doorDest: isDoorDest,
      originPort: isOriginPort, destPort: isDestPort,
    });

  const gstRail     = Math.round(baseRailFreight * 0.05);
  const gstTHC      = Math.round((thcOrigin + thcDest + otherCharges) * 0.18);
  const gstFLML     = Math.round((firstMile + lastMile) * 0.05);
  const gstPlatform = Math.round(platformFee * 0.18);
  const totalGST    = gstRail + gstTHC + gstFLML + gstPlatform + gstCustoms;
  const insuranceAmt    = insuranceRequired ? Math.round(baseRailFreight * 0.01) : 0;
  const subtotalWithGST = subtotal + totalGST + insuranceAmt;
  const discountAmt     = promoCode && VALID_PROMOS[promoCode]
    ? Math.round(subtotalWithGST * VALID_PROMOS[promoCode]) : 0;
  const grandTotal      = subtotalWithGST - discountAmt;

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-5">

        {/* ── LEFT ── */}
        <div className="flex-grow space-y-3">

          {/* Back (no box) */}
          <button onClick={() => navigate('/train-results', { state: { formData: formData! } })}
            className="flex items-center text-blue-500 hover:text-blue-600 text-sm font-medium transition px-1">
            <FaArrowLeft className="mr-2" /> Back to Search Results
          </button>

          {/* Quote Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FaClipboardList className="text-gray-500 text-lg" />
              <h2 className="text-lg font-bold text-gray-800">Your Quote Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              {[
                { label: 'Operator',    value: selectedTrainResult!.operator },
                { label: 'ETA',         value: selectedTrainResult!.transitDuration },
                { label: 'Origin',      value: selectedTrainResult!.originStation },
                { label: 'Destination', value: selectedTrainResult!.destinationStation },
                { label: 'Ready Date',  value: formData!.readyDate },
                { label: 'Cargo Type',  value: formData!.cargoType || 'N/A' },
                { label: 'Weight',      value: formData!.totalWeight ? `${formData!.totalWeight} KG` : 'N/A' },
                { label: 'Hazardous',   value: formData!.hazardousCargo ? 'Yes' : 'No' },
              ].map((row, i) => (
                <div key={i} className="flex items-start justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className="text-sm font-medium text-gray-800 text-right">{row.value || 'N/A'}</span>
                </div>
              ))}
              {isContainer && <>
                <div className="flex items-start justify-between py-1.5 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Container Type</span>
                  <span className="text-sm font-medium text-gray-800">{cfd.containerType}</span>
                </div>
                <div className="flex items-start justify-between py-1.5 border-b border-gray-100">
                  <span className="text-sm text-gray-500">No. of Containers</span>
                  <span className="text-sm font-medium text-gray-800">{cfd.numberOfContainers}</span>
                </div>
                <div className="flex items-start justify-between py-1.5 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Booking Type</span>
                  <span className="text-sm font-medium text-gray-800">{isDomestic ? 'Domestic' : 'International'}</span>
                </div>
                <div className="flex items-start justify-between py-1.5 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Service Type</span>
                  <span className="text-sm font-medium text-gray-800">{cfd.serviceType || 'Terminal to Terminal'}</span>
                </div>
              </>}
              {formData!.bookingType === 'Train Goods Booking' && <>
                <div className="flex items-start justify-between py-1.5 border-b border-gray-100">
                  <span className="text-sm text-gray-500">No. of Wagons</span>
                  <span className="text-sm font-medium text-gray-800">{(formData as TrainGoodsFormData).numberOfWagons}</span>
                </div>
                <div className="flex items-start justify-between py-1.5 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Wagon Type</span>
                  <span className="text-sm font-medium text-gray-800">{(formData as TrainGoodsFormData).wagonType}</span>
                </div>
              </>}
              {formData!.bookingType === 'Train Parcel Booking' && (
                <div className="flex items-start justify-between py-1.5 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Parcel Count</span>
                  <span className="text-sm font-medium text-gray-800">{(formData as TrainParcelFormData).parcelCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Promo / Discount Code — no box */}
          <div className="px-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <FaTag className="text-blue-500" /> Promo / Discount Code
            </p>
            {promoCode ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 sm:max-w-md">
                <div>
                  <p className="text-sm font-bold text-green-700">{promoCode} applied!</p>
                  <p className="text-xs text-green-600">You save {fmt(discountAmt)}</p>
                </div>
                <button onClick={removePromo} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2 sm:max-w-md">
                <input type="text" value={promoInput}
                  onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                  placeholder="Enter code"
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 uppercase" />
                <button onClick={applyPromo}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition">
                  Apply
                </button>
              </div>
            )}
            {promoError && <p className="text-xs text-red-500 mt-1.5">{promoError}</p>}
          </div>

          {/* GST — plain checkbox; the GSTIN itself is entered (and required) on the booking page */}
          <label className="flex items-center gap-3 cursor-pointer px-1">
            <input type="checkbox" checked={gstInput} onChange={e => setGstInput(e.target.checked)}
              className="h-5 w-5 accent-blue-600 rounded flex-shrink-0" />
            <span className="text-base font-semibold text-gray-800">
              I have a GST number <span className="text-sm font-normal text-gray-400">(Optional)</span>
            </span>
          </label>

          {/* Terms & Conditions */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs text-gray-600 mb-2 leading-relaxed">
              This rate is valid for the current CONCOR tariff cycle. Rates are subject to change if the booking is not confirmed before the tariff revision date. For {isDomestic ? 'domestic' : 'international'} shipments, all charges are as per CONCOR's published Schedule of Charges.
            </p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsConfirmed}
                onChange={e => setTermsConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-blue-600 rounded"
              />
              <span className="text-xs text-gray-700 leading-relaxed">
                I confirm that this is a commercial shipment and all details entered are correct to the best of my knowledge. I accept the CONCOR tariff terms, Shippitin's conditions of booking, and all applicable charges as shown in the order summary.
              </span>
            </label>
          </div>

          {/* Proceed to Book */}
          <button
            onClick={() => {
              if (!termsConfirmed) return;
              navigate('/rail-booking-confirmation', {
                state: {
                  formData: formData!,
                  selectedTrainResult: selectedTrainResult!,
                  initialInsuranceRequired: insuranceRequired,
                  claimGstInput: gstInput,
                },
              });
            }}
            disabled={!termsConfirmed}
            className={`w-full py-3.5 font-bold rounded-xl transition text-sm shadow-md flex items-center justify-center gap-2 ${
              termsConfirmed
                ? 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Proceed to Book <FaArrowRight />
          </button>

        </div>
        {/* END LEFT */}

        {/* ── RIGHT ── */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <div className="sticky top-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Order Summary</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {numContainers} × {containerType} · {isDomestic ? 'Domestic DCT' : 'International ICD'}
              </p>
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* Breakup toggle */}
              <div>
                <button onClick={() => setShowBreakup(!showBreakup)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 hover:text-blue-500 transition">
                  <span>Charges Breakup</span>
                  {showBreakup ? <FaChevronUp /> : <FaChevronDown />}
                </button>

                {showBreakup && (
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-2">
                        <p className="text-sm text-gray-700">Base Rail Freight</p>
                        <p className="text-xs text-gray-400">Chassis-to-chassis haulage</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{fmt(baseRailFreight)}</span>
                    </div>

                    {!isOriginPort && (
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <p className="text-sm text-gray-700">THC — Origin ({numContainers} × {fmt(thcPerSide)})</p>
                          <p className="text-xs text-gray-400">{isDomestic ? 'DCT handling charge' : 'ICD handling charge'}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{fmt(thcOrigin)}</span>
                      </div>
                    )}

                    {!isDestPort && (
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <p className="text-sm text-gray-700">THC — Destination ({numContainers} × {fmt(thcPerSide)})</p>
                          <p className="text-xs text-gray-400">{isDomestic ? 'DCT handling charge' : 'ICD handling charge'}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{fmt(thcDest)}</span>
                      </div>
                    )}

                    {(isDestPort || isOriginPort) && (
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <p className="text-sm text-gray-700">Port Terminal Charges</p>
                          <p className="text-xs text-gray-400">Collected by port / shipping line separately</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-400">Billed at port</span>
                      </div>
                    )}

                    {!isDomestic && otherCharges > 0 && (
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <p className="text-sm text-gray-700">Other Terminal Charges ({numContainers} ×)</p>
                          <p className="text-xs text-gray-400">Infra + Equipment imbalance</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{fmt(otherCharges)}</span>
                      </div>
                    )}

                    {isDoorOrigin && (
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <p className="text-sm text-gray-700">First Mile ({numContainers} ×)</p>
                          <p className="text-xs text-gray-400">Pickup to {isDomestic ? 'DCT' : 'ICD'}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{fmt(firstMile)}</span>
                      </div>
                    )}

                    {isDoorDest && (
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <p className="text-sm text-gray-700">Last Mile ({numContainers} ×)</p>
                          <p className="text-xs text-gray-400">{isDomestic ? 'DCT' : 'ICD'} to delivery</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{fmt(lastMile)}</span>
                      </div>
                    )}

                    {addCustoms && (
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <p className="text-sm text-gray-700">Customs Clearance</p>
                          <p className="text-xs text-gray-400">CHA-assisted documentation · ₹2,000/document</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{fmt(customsFee)}</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-2">
                        <p className="text-sm text-gray-700">Platform Fee</p>
                        <p className="text-xs text-gray-400">Shippitin — {isDomestic ? 'Domestic' : 'International'}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{fmt(platformFee)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-center py-2 border-t border-dashed border-gray-200">
                <span className="text-sm font-semibold text-gray-600">Subtotal (excl. GST)</span>
                <span className="text-sm font-bold text-gray-800">{fmt(subtotal)}</span>
              </div>

              {/* GST */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">GST Breakup</p>
                <div className="space-y-2 bg-amber-50 rounded-xl p-3">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Rail Freight GST @5%</span><span className="font-medium">{fmt(gstRail)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>THC {!isDomestic && '+ Terminal'} GST @18%</span><span className="font-medium">{fmt(gstTHC)}</span>
                  </div>
                  {(isDoorOrigin || isDoorDest) && (
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>First/Last Mile GST @5%</span><span className="font-medium">{fmt(gstFLML)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Platform Fee GST @18%</span><span className="font-medium">{fmt(gstPlatform)}</span>
                  </div>
                  {addCustoms && (
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Customs Clearance GST @18%</span>
                      <span className="font-medium">{fmt(gstCustoms)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-bold text-gray-700 pt-1 border-t border-amber-200">
                    <span>Total GST</span><span>{fmt(totalGST)}</span>
                  </div>
                </div>
              </div>

              {/* Insurance */}
              {insuranceRequired && (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-700">Cargo Insurance</p>
                    <p className="text-xs text-gray-400">1% of base rail freight</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{fmt(insuranceAmt)}</span>
                </div>
              )}

              {discountAmt > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="text-sm font-medium">Discount ({(VALID_PROMOS[promoCode] * 100).toFixed(0)}%)</span>
                  <span className="text-sm font-bold">− {fmt(discountAmt)}</span>
                </div>
              )}

              {/* Grand Total — right side ends here */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-800">Grand Total</span>
                  <span className="text-xl font-extrabold text-blue-700">{fmt(grandTotal)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes and charges</p>
              </div>

            </div>
          </div>
        </div>
        {/* END RIGHT */}

      </div>
    </div>
  );
};

export default RailServiceDetailsPage;
