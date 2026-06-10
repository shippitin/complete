// src/pages/TrainResultsPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTrain, FaShip, FaMapMarkerAlt, FaRupeeSign, FaArrowRight, FaArrowLeft, FaFilter, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import type { AllFormData, FreightTrainResult, RailServiceType, TrainContainerFormData } from '../types/QuoteFormHandle';
import API_BASE_URL from '../config/api';
import { computeRailCharges, doorPortFlags } from '../utils/railCharges';

type TrainTypeFilter   = 'Express Cargo' | 'Standard Cargo' | 'Premium Cargo' | 'Economy Cargo';
type OperatorFilter    = 'CONCOR' | 'BCSL' | 'Adani Logistics' | 'Maersk' | 'MSC' | 'CMA CGM' | 'Hapag-Lloyd' | 'Evergreen' | 'Cosco' | 'ZIM';
type ServiceTypeFilter = RailServiceType;

const getBadgeColor = (i: number) => ['#fb7185', '#fbbf24', '#38bdf8'][i] || 'transparent';
const getBadgeLabel = (i: number) => ['🔥 Most Popular', '★ Best Value', '⚡ Fastest'][i] || null;
const getBadgePill  = (i: number) => [
  'bg-rose-50 text-rose-700 border border-rose-200',
  'bg-amber-50 text-amber-700 border border-amber-200',
  'bg-sky-50 text-sky-700 border border-sky-200',
][i] || '';

const SERVICE_NAMES = ['Premium Rail Transit', 'Express Freight Link', 'Standard Cargo Express', 'Economy Freight'];

const formatServiceType = (st: string): string => {
  const map: Record<string, string> = {
    terminalToTerminal: 'Terminal to Terminal',
    doorToDoor:         'Door to Door',
    doorToTerminal:     'Door to Terminal',
    terminalToDoor:     'Terminal to Door',
    terminalToPort:     'Terminal to Port',
    doorToPort:         'Door to Port',
    portToTerminal:     'Port to Terminal',
    portToDoor:         'Port to Door',
  };
  return map[st] || st;
};

const TrainResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const [formData, setFormData]                     = useState<AllFormData | null>(null);
  const [allSearchResults, setAllSearchResults]     = useState<FreightTrainResult[]>([]);
  const [filteredResults, setFilteredResults]       = useState<FreightTrainResult[]>([]);
  const [loading, setLoading]                       = useState(true);
  const [error, setError]                           = useState<string | null>(null);
  const [sortBy, setSortBy]                         = useState<'recommended' | 'cheapest' | 'fastest'>('recommended');
  const [selectedTrainTypes, setSelectedTrainTypes] = useState<TrainTypeFilter[]>([]);
  const [selectedOperators, setSelectedOperators]   = useState<OperatorFilter[]>([]);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<ServiceTypeFilter[]>([]);

  const isDomesticBooking = (data: AllFormData) =>
    (data as TrainContainerFormData).isDomestic !== false;

  const getMovement = (data: AllFormData): 'export' | 'import' | null =>
    (data as TrainContainerFormData).etmsMovementType || null;

  const formatLocation = (loc: string, domestic: boolean): string => {
    if (!loc || loc === 'N/A') return loc;
    if (!domestic) return loc;
    return loc.replace(/\s*\([A-Z0-9]+\)/g, '').replace(/\bICD\b/gi, 'DCT').trim();
  };

  const getOriginDisplay = (data: AllFormData, raw = false): string => {
    const st = (data as any).serviceType as RailServiceType;
    const domestic = isDomesticBooking(data);
    let loc = '';
    if (st === 'doorToDoor' || st === 'doorToTerminal' || st === 'doorToPort')
      loc = data.originAddress || data.originStation || 'N/A';
    else
      loc = data.originTerminal || data.originStation || 'N/A';
    return raw ? loc : formatLocation(loc, domestic);
  };

  const getDestinationDisplay = (data: AllFormData, raw = false): string => {
    const st = (data as any).serviceType as RailServiceType;
    const domestic = isDomesticBooking(data);
    let loc = '';
    if (st === 'doorToDoor' || st === 'terminalToDoor' || st === 'portToDoor')
      loc = data.destinationAddress || data.destinationStation || 'N/A';
    else
      loc = data.destinationTerminal || data.destinationStation || 'N/A';
    return raw ? loc : formatLocation(loc, domestic);
  };

  const simulateResults = (data: AllFormData): FreightTrainResult[] => {
    const origin      = getOriginDisplay(data);
    const destination = getDestinationDisplay(data);
    const cd          = data as TrainContainerFormData;
    const is40ft      = cd.containerType?.includes('40ft');
    const n           = cd.numberOfContainers || 1;
    const domestic    = isDomesticBooking(data);
    const st          = (data as any).serviceType as RailServiceType;
    const weight      = data.totalWeight || 0;

    // CONCOR rates — domestic
    // 20ft: ≤10MT → ₹17,800 | ≤20MT → ₹21,000 | >20MT → ₹72,000
    // 40ft: ≤20MT → ₹29,800 | >20MT → ₹46,000
    const getSNF20ft = (wt: number) => {
      if (wt <= 10000) return 17800;
      if (wt <= 20000) return 21000;
      return 72000;
    };
    const getSNF40ft = (wt: number) => wt <= 20000 ? 29800 : 46000;

    const basePerContainer = is40ft ? getSNF40ft(weight) : getSNF20ft(weight);
    const baseTotal        = basePerContainer * n;
    // All services use the exact CONCOR base rate — they differ by transit time and features, not price.
    const serviceFeature   = formatServiceType(st);

    const domesticOperators = ['CONCOR', 'Adani Logistics'];
    const intlOperators     = ['CONCOR', 'BCSL', 'Maersk', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'Evergreen', 'Cosco', 'ZIM'];
    const operators         = domestic ? domesticOperators : intlOperators;

    return [
      {
        id: 'TRN001', serviceName: 'Priority Rail Express', operator: operators[0],
        originStation: origin, destinationStation: destination,
        departureTime: 'As per schedule', arrivalTime: 'Estimated',
        transitDuration: domestic ? '2 Days' : '4 Days',
        availableCapacity: '150 Containers',
        price: baseTotal,
        features: ['GPS Tracking', 'Priority Handling', 'Real-time Updates', serviceFeature],
        cargoType: cd.containerType || 'General', isHazardousCompatible: true,
        sourceDocument: 'CONCOR-SNF-TARIFF-2022', isDomestic: domestic,
      },
      {
        id: 'TRN002', serviceName: 'Express Freight Link', operator: operators[0],
        originStation: origin, destinationStation: destination,
        departureTime: 'As per schedule', arrivalTime: 'Estimated',
        transitDuration: domestic ? '3 Days' : '5 Days',
        availableCapacity: '200 Containers',
        price: baseTotal,
        features: ['GPS Tracking', 'Real-time Updates', serviceFeature],
        cargoType: cd.containerType || 'General', isHazardousCompatible: true,
        sourceDocument: 'CONCOR-SNF-TARIFF-2022', isDomestic: domestic,
      },
      {
        id: 'TRN003', serviceName: 'Standard Cargo Service', operator: operators[1] || operators[0],
        originStation: origin, destinationStation: destination,
        departureTime: 'As per schedule', arrivalTime: 'Estimated',
        transitDuration: domestic ? '4 Days' : '6 Days',
        availableCapacity: '300 Containers',
        price: baseTotal,
        features: ['Standard Service', serviceFeature],
        cargoType: cd.containerType || 'General', isHazardousCompatible: false,
        sourceDocument: 'CONCOR-SNF-TARIFF-2022', isDomestic: domestic,
      },
      {
        id: 'TRN004', serviceName: 'Economy Freight', operator: operators[1] || operators[0],
        originStation: origin, destinationStation: destination,
        departureTime: 'As per schedule', arrivalTime: 'Estimated',
        transitDuration: domestic ? '5 Days' : '7 Days',
        availableCapacity: '400 Containers',
        price: baseTotal,
        features: ['Economy Service', serviceFeature],
        cargoType: cd.containerType || 'General', isHazardousCompatible: false,
        sourceDocument: 'CONCOR-SNF-TARIFF-2022', isDomestic: domestic,
      },
    ];
  };

  useEffect(() => {
    const state = location.state as { formData: AllFormData } | undefined;
    if (!state?.formData) { setError('No form data provided.'); setLoading(false); return; }
    const data = state.formData;
    setFormData(data);

    (async () => {
      try {
        const token    = localStorage.getItem('shippitin_token');
        const cd       = data as TrainContainerFormData;
        const domestic = isDomesticBooking(data);
        const st       = (data as any).serviceType as RailServiceType;
        const originRaw      = getOriginDisplay(data, true);
        const destinationRaw = getDestinationDisplay(data, true);

        const res = await fetch(`${API_BASE_URL}/api/quotes/rail/quotes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            origin:             originRaw      || '',
            destination:        destinationRaw || '',
            containerType:      cd.containerType       || '20ft Standard',
            numberOfContainers: cd.numberOfContainers  || 1,
            weight:             data.totalWeight       || 0,
            cargoType:          data.cargoType         || 'FAK (Freight of All Kinds)',
            serviceType:        st || 'terminalToTerminal',
            isDomestic:         domestic,
            bookingDate:        data.readyDate         || new Date().toISOString().split('T')[0],
            etmsMovementType:   (cd as any).etmsMovementType || null,
          }),
        });

        const json = await res.json();

        if (json.success && json.data?.length > 0) {
          const serviceFeature = formatServiceType(st);
          const domestic2 = isDomesticBooking(data);
          const operators  = domestic2 ? ['CONCOR', 'Adani Logistics'] : ['CONCOR', 'BCSL', 'Maersk', 'MSC', 'CMA CGM'];

          const mapped: FreightTrainResult[] = json.data.map((r: any, i: number) => ({
            id:                   `TRN00${i + 1}`,
            serviceName:          SERVICE_NAMES[i] || `Service ${i + 1}`,
            operator:             r.provider || operators[i % operators.length],
            originStation:        formatLocation(r.origin      || originRaw      || '', domestic2),
            destinationStation:   formatLocation(r.destination || destinationRaw || '', domestic2),
            departureTime:        'As per schedule',
            arrivalTime:          'Estimated',
            transitDuration:      `${r.transitDays} Days`,
            availableCapacity:    `${(r.availableRakes || 5) * 10} Containers`,
            price:                r.price,
            features:             ['GPS Tracking', 'Real-time Updates', serviceFeature],
            cargoType:            (data as TrainContainerFormData).containerType || 'General',
            isHazardousCompatible: i < 2,
            sourceDocument:       r.sourceDocument,
            isDomestic:           domestic2,
          }));
          setAllSearchResults(mapped);
          setFilteredResults(mapped);
        } else {
          const sim = simulateResults(data);
          setAllSearchResults(sim);
          setFilteredResults(sim);
        }
      } catch (err) {
        const sim = simulateResults(data);
        setAllSearchResults(sim);
        setFilteredResults(sim);
      } finally {
        setLoading(false);
      }
    })();
  }, [location.state]);

  useEffect(() => {
    let cur = [...allSearchResults];
    if (selectedTrainTypes.length > 0)
      cur = cur.filter(r => selectedTrainTypes.some(t => r.serviceName.includes(t.replace(' Cargo', ''))));
    if (selectedOperators.length > 0)
      cur = cur.filter(r => selectedOperators.includes(r.operator as OperatorFilter));
    if (selectedServiceTypes.length > 0)
      cur = cur.filter(r => selectedServiceTypes.some(st => r.features.includes(formatServiceType(st))));
    if (sortBy === 'cheapest') cur.sort((a, b) => a.price - b.price);
    if (sortBy === 'fastest')  cur.sort((a, b) => parseInt(a.transitDuration) - parseInt(b.transitDuration));
    // 'recommended' keeps the original order (Priority / Best Value / Fastest badges)
    setFilteredResults(cur);
  }, [selectedTrainTypes, selectedOperators, selectedServiceTypes, sortBy, allSearchResults]);

  const handleViewDetails = (result: FreightTrainResult) => {
    if (formData) navigate('/train-service-details', { state: { formData, selectedTrainResult: result } });
  };

  const handleFilter = (type: string, value: string) => {
    if (type === 'trainType')
      setSelectedTrainTypes(p => p.includes(value as TrainTypeFilter) ? p.filter(i => i !== value) : [...p, value as TrainTypeFilter]);
    if (type === 'operator')
      setSelectedOperators(p => p.includes(value as OperatorFilter) ? p.filter(i => i !== value) : [...p, value as OperatorFilter]);
    if (type === 'serviceType')
      setSelectedServiceTypes(p => p.includes(value as ServiceTypeFilter) ? p.filter(i => i !== value) : [...p, value as ServiceTypeFilter]);
  };

  const domestic    = formData ? isDomesticBooking(formData) : true;
  const movement    = formData ? getMovement(formData) : null;
  const serviceType = formData ? (formData as any).serviceType as RailServiceType : 'terminalToTerminal';

  // All-in indicative pricing (excl. GST) — uses the same CONCOR charge model as
  // checkout, so Door-to-Door reflects pickup/delivery instead of base freight only.
  const isContainerBooking = formData?.bookingType === 'Train Container Booking';
  const cType = (formData as TrainContainerFormData | null)?.containerType || '20ft Standard';
  const nCont = (formData as TrainContainerFormData | null)?.numberOfContainers || 1;
  const chargeFlags = doorPortFlags(isContainerBooking, serviceType);
  const allInPrice = (base: number) =>
    computeRailCharges({
      baseRailFreight: base, isDomestic: domestic,
      containerType: cType, numContainers: nCont, ...chargeFlags,
    }).subtotal;

  const domesticOperators = ['CONCOR', 'Adani Logistics'];
  const intlOperators     = ['CONCOR', 'BCSL', 'Maersk', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'Evergreen', 'Cosco', 'ZIM'];
  const operatorOptions   = domestic ? domesticOperators : intlOperators;

  const domesticServiceTypes = [
    ['terminalToTerminal','Terminal to Terminal'],
    ['doorToDoor','Door to Door'],
    ['doorToTerminal','Door to Terminal'],
    ['terminalToDoor','Terminal to Door'],
  ];
  const exportServiceTypes = [
    ['terminalToPort','Terminal to Port'],
    ['terminalToTerminal','Terminal to Terminal'],
    ['doorToPort','Door to Port'],
    ['doorToTerminal','Door to Terminal'],
  ];
  const importServiceTypes = [
    ['portToTerminal','Port to Terminal'],
    ['terminalToTerminal','Terminal to Terminal'],
    ['portToDoor','Port to Door'],
    ['terminalToDoor','Terminal to Door'],
  ];
  const serviceTypeOptions = domestic
    ? domesticServiceTypes
    : movement === 'import' ? importServiceTypes : exportServiceTypes;

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center p-10 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">Fetching CONCOR rates...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-6 py-12 bg-white shadow-sm rounded-2xl border border-gray-100 text-center">
        <h3 className="text-2xl font-bold text-red-500 mb-4">Error</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Sticky top bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-5 text-sm">
            <button onClick={() => navigate('/train-recommended-services', { state: { formData } })}
              className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 transition font-medium">
              <FaArrowLeft className="text-xs" /> Back
            </button>
            {formData && (
              <>
                <div className="h-4 w-px bg-gray-200" />
                <div className="flex items-center gap-2 text-gray-700">
                  <FaMapMarkerAlt className="text-blue-400 text-xs" />
                  <span className="font-semibold">{getOriginDisplay(formData)}</span>
                  <span className="text-gray-300">→</span>
                  <span className="font-semibold">{getDestinationDisplay(formData)}</span>
                </div>
                <div className="h-4 w-px bg-gray-200" />
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                  {!domestic && movement && <span className="mr-1 capitalize">{movement} ·</span>}
                  {formatServiceType(serviceType)}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Sort by:</span>
            {[
              { key: 'recommended', label: 'Recommended' },
              { key: 'cheapest',    label: 'Cheapest' },
              { key: 'fastest',     label: 'Fastest' },
            ].map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${sortBy === s.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">

        {/* Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-36">
            <h3 className="font-bold text-gray-700 text-sm mb-4 flex items-center gap-2">
              <FaFilter className="text-blue-400 text-xs" /> Filters
            </h3>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Train Type</p>
                {(['Premium Cargo', 'Express Cargo', 'Standard Cargo', 'Economy Cargo'] as TrainTypeFilter[]).map(t => (
                  <label key={t} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-600">
                    <input type="checkbox" className="rounded text-blue-600"
                      checked={selectedTrainTypes.includes(t)}
                      onChange={() => handleFilter('trainType', t)} />
                    {t}
                  </label>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Operators</p>
                {operatorOptions.map(o => (
                  <label key={o} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-600">
                    <input type="checkbox" className="rounded text-blue-600"
                      checked={selectedOperators.includes(o as OperatorFilter)}
                      onChange={() => handleFilter('operator', o)} />
                    {o}
                    {o === 'BCSL' && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium ml-auto">New</span>}
                  </label>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Service Type</p>
                {serviceTypeOptions.map(([v, l]) => (
                  <label key={v} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-600">
                    <input type="checkbox" className="rounded text-blue-600"
                      checked={selectedServiceTypes.includes(v as ServiceTypeFilter)}
                      onChange={() => handleFilter('serviceType', v)} />
                    {l}
                  </label>
                ))}
              </div>
              <button
                onClick={() => { setSelectedTrainTypes([]); setSelectedOperators([]); setSelectedServiceTypes([]); }}
                className="w-full bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition text-sm">
                Clear Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="mb-5">
            <h1 className="text-xl font-bold text-gray-800">Rail Freight Quotes</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {filteredResults.length} options ·{' '}
              {domestic ? 'Domestic DCT rates' : `International — ${movement === 'import' ? 'Import' : 'Export'}`}
              {' · Prices excl. GST'}
            </p>
          </div>

          {filteredResults.length > 0 ? (
            <div className="space-y-4">
              {filteredResults.map((result, index) => (
                <div key={result.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                  style={{ borderLeft: `4px solid ${getBadgeColor(index)}` }}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                          {domestic ? <FaTrain className="text-blue-500 text-sm" /> : <FaShip className="text-blue-500 text-sm" />}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-800">
                            {result.serviceName}
                            <span className="text-xs text-gray-400 font-normal ml-1">({result.id})</span>
                          </h3>
                          <p className="text-xs text-gray-400">
                            Operator: <span className="font-semibold text-gray-600">{result.operator}</span>
                            {result.operator === 'BCSL' && (
                              <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">Bharat Container Shipping Line</span>
                            )}
                          </p>
                        </div>
                      </div>
                      {getBadgeLabel(index) && (
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBadgePill(index)}`}>
                          {getBadgeLabel(index)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div><p className="text-xs text-gray-400 mb-0.5">FROM</p><p className="text-sm font-bold text-gray-800">{result.originStation}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">TO</p><p className="text-sm font-bold text-gray-800">{result.destinationStation}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">TRANSIT</p><p className="text-sm font-semibold text-gray-700">{result.transitDuration}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">SERVICE</p><p className="text-sm font-semibold text-gray-700">{formatServiceType((formData as any)?.serviceType || 'terminalToTerminal')}</p></div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.features.map((f, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{f}</span>
                      ))}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${result.isHazardousCompatible ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                        {result.isHazardousCompatible ? <FaCheckCircle className="text-xs" /> : <FaTimesCircle className="text-xs" />}
                        Hazardous {result.isHazardousCompatible ? 'OK' : 'No'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div>
                        <p className="text-xs text-gray-400">{result.cargoType || 'General Cargo'}</p>
                        {(result as any).sourceDocument && (result as any).sourceDocument !== 'CONCOR-ESTIMATED' && (
                          <p className="text-xs text-green-600 mt-0.5 font-medium">✓ CONCOR Official Rate</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-black text-gray-900 flex items-center gap-1">
                            <FaRupeeSign className="text-lg text-blue-500" />
                            {Math.round(allInPrice(result.price)).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-400">Indicative total · excl. GST</p>
                        </div>
                        <button onClick={() => handleViewDetails(result)}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition text-sm whitespace-nowrap">
                          View Details <FaArrowRight className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <FaTrain className="text-gray-200 text-5xl mx-auto mb-4" />
              <p className="text-gray-500 font-semibold">No train services found for your criteria.</p>
              <button onClick={() => { setSelectedTrainTypes([]); setSelectedOperators([]); setSelectedServiceTypes([]); }}
                className="mt-4 text-blue-600 text-sm hover:underline">Clear filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainResultsPage;
