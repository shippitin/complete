// src/components/QuoteForms/RailQuoteForm.tsx
// CHANGE: navigate to /train-recommended-services instead of /train-results
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationAutocomplete from '../LocationAutocomplete';
import {
  QuoteFormHandle, TrainContainerFormData, TrainGoodsFormData,
  TrainParcelFormData, RailServiceType, ParsedVoiceCommand,
} from '../../types/QuoteFormHandle';

const parseNumber = (v: string | number | undefined | null): number | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
};

type BookingTab      = 'container' | 'parcel' | 'goods';
type ContainerMode   = 'domestic' | 'international';
type MovementType    = 'export' | 'import';

const EXPORT_SERVICE_TYPES: { value: RailServiceType; label: string }[] = [
  { value: 'terminalToPort',     label: 'Terminal to Port'     },
  { value: 'doorToPort',         label: 'Door to Port'         },
  { value: 'doorToTerminal',     label: 'Door to Terminal'     },
  { value: 'terminalToTerminal', label: 'Terminal to Terminal' },
];

const IMPORT_SERVICE_TYPES: { value: RailServiceType; label: string }[] = [
  { value: 'portToTerminal',     label: 'Port to Terminal'     },
  { value: 'portToDoor',         label: 'Port to Door'         },
  { value: 'terminalToDoor',     label: 'Terminal to Door'     },
  { value: 'terminalToTerminal', label: 'Terminal to Terminal' },
];

const DOMESTIC_SERVICE_TYPES: { value: RailServiceType; label: string }[] = [
  { value: 'terminalToTerminal', label: 'Terminal to Terminal' },
  { value: 'doorToDoor',         label: 'Door to Door'         },
  { value: 'doorToTerminal',     label: 'Door to Terminal'     },
  { value: 'terminalToDoor',     label: 'Terminal to Door'     },
];

const allCommodities = [
  'Batteries','Chemicals','Electronic Goods','FAK (Freight of All Kinds)',
  'Fabrics','Fruits & Vegetables','Garments','Handicrafts','Leather Goods',
  'Machinery','Meat & Seafood','Miscellaneous','Pharmaceuticals','Spare Parts','Vehicles','Other',
].map(v => ({ label: v, value: v }));

const containerTypes = [
  '20ft Standard','20ft High Cube','20ft High Cube Reefer',
  '40ft Standard','40ft High Cube','40ft High Cube Reefer','40ft Open Top High',
].map(v => ({ label: v, value: v }));

// International also allows empty-container moves (repositioning) — these carry no
// cargo, so weight is muted when selected.
const intlContainerTypes = [
  ...containerTypes,
  { label: '20ft Empty', value: '20ft Empty' },
  { label: '40ft Empty', value: '40ft Empty' },
];

const wagonTypes = [
  'Open Wagon','Covered Wagon','Flat Wagon','Hopper Wagon','Other',
].map(v => ({ label: v, value: v }));

interface RailQuoteFormProps {
  initialActiveService?: BookingTab;
  prefillData?: ParsedVoiceCommand;
  showButtons?: boolean;
  embedded?: boolean;   // when true, drop the card chrome so it flows inside the hero card
}

const toggleBtn = (active: boolean) =>
  `w-36 text-center px-4 py-2 rounded-lg text-sm font-medium outline-none transition-all border ${
    active
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50'
  }`;

const radioBtn = (active: boolean) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all border ${
    active
      ? 'bg-blue-50 text-blue-700 border-blue-300'
      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
  }`;

const RailQuoteForm = forwardRef<QuoteFormHandle, RailQuoteFormProps>(({
  initialActiveService = 'container', prefillData, showButtons = true, embedded = false,
}, ref) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<BookingTab>(initialActiveService);

  const [domServiceType,    setDomServiceType]    = useState<RailServiceType>('terminalToTerminal');
  const [domOriginTerminal, setDomOriginTerminal] = useState('');
  const [domOriginAddress,  setDomOriginAddress]  = useState('');
  const [domDestTerminal,   setDomDestTerminal]   = useState('');
  const [domDestAddress,    setDomDestAddress]    = useState('');

  const [movement,        setMovement]        = useState<MovementType>('export');
  const [intlServiceType, setIntlServiceType] = useState<RailServiceType>('terminalToPort');
  const [intlOriginICD,   setIntlOriginICD]   = useState('');
  const [intlOriginPort,  setIntlOriginPort]  = useState('');
  const [intlOriginAddr,  setIntlOriginAddr]  = useState('');
  const [intlOriginForeign, setIntlOriginForeign] = useState('');
  const [intlDestICD,     setIntlDestICD]     = useState('');
  const [intlDestPort,    setIntlDestPort]    = useState('');
  const [intlDestAddr,    setIntlDestAddr]    = useState('');
  const [intlDestForeign, setIntlDestForeign] = useState('');

  const [containerMode,   setContainerMode]   = useState<ContainerMode>('domestic');
  const [containerType,   setContainerType]   = useState('');
  const [numContainers,   setNumContainers]   = useState<number|''>(1);
  const [totalWeight,     setTotalWeight]     = useState<number|''>('');
  const [commodity,       setCommodity]       = useState('FAK (Freight of All Kinds)');
  const [hazardous,       setHazardous]       = useState<boolean|''>(false);
  const [readyDate,       setReadyDate]       = useState<Date|null>(new Date());
  // International empty-container move — derived from the selected container type
  // ("20ft Empty"/"40ft Empty"). Mutes the weight field and skips its validation.
  const isIntlEmpty = containerMode === 'international' && /empty/i.test(containerType);

  const [goodsServiceType, setGoodsServiceType] = useState<RailServiceType>('terminalToTerminal');
  const [goodsOriginTerm,  setGoodsOriginTerm]  = useState('');
  const [goodsOriginAddr,  setGoodsOriginAddr]  = useState('');
  const [goodsDestTerm,    setGoodsDestTerm]    = useState('');
  const [goodsDestAddr,    setGoodsDestAddr]    = useState('');
  const [goodsWeight,      setGoodsWeight]      = useState<number|''>('');
  const [goodsCommodity,   setGoodsCommodity]   = useState('FAK (Freight of All Kinds)');
  const [goodsWagonType,   setGoodsWagonType]   = useState('');
  const [numWagons,        setNumWagons]        = useState<number|''>(1);
  const [goodsHazardous,   setGoodsHazardous]   = useState<boolean|''>(false);
  const [goodsDate,        setGoodsDate]        = useState<Date|null>(new Date());

  const [parcelServiceType, setParcelServiceType] = useState<RailServiceType>('terminalToTerminal');
  const [parcelOriginTerm,  setParcelOriginTerm]  = useState('');
  const [parcelOriginAddr,  setParcelOriginAddr]  = useState('');
  const [parcelDestTerm,    setParcelDestTerm]    = useState('');
  const [parcelDestAddr,    setParcelDestAddr]    = useState('');
  const [parcelWeight,      setParcelWeight]      = useState<number|''>('');
  const [parcelDims,        setParcelDims]        = useState('');
  const [parcelDesc,        setParcelDesc]        = useState('');
  const [parcelHazardous,   setParcelHazardous]   = useState<boolean|''>(false);
  const [parcelDate,        setParcelDate]        = useState<Date|null>(new Date());
  const [parcelCount,       setParcelCount]       = useState<number|''>(1);

  const [errors,     setErrors]     = useState<Record<string,string>>({});
  const [showValMsg, setShowValMsg] = useState(false);

  useEffect(() => {
    if (movement === 'export') setIntlServiceType('terminalToPort');
    else                       setIntlServiceType('portToTerminal');
  }, [movement]);

  const getIntlOrigin = (): string => {
    if (movement === 'export') {
      if (intlServiceType === 'doorToPort' || intlServiceType === 'doorToTerminal') return intlOriginAddr;
      return intlOriginICD;
    }
    return intlOriginForeign;
  };

  const getIntlDest = (): string => {
    if (movement === 'export') {
      if (intlServiceType === 'terminalToPort' || intlServiceType === 'doorToPort') return intlDestPort;
      return intlDestICD;
    }
    if (intlServiceType === 'portToDoor' || intlServiceType === 'terminalToDoor') return intlDestAddr;
    return intlDestICD;
  };

  const inp = (err: boolean) =>
    `block w-full px-3 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition ${
      err ? 'border-orange-400' : 'border-gray-300'
    }`;

  const resetAll = () => {
    setDomServiceType('terminalToTerminal');
    setDomOriginTerminal(''); setDomOriginAddress('');
    setDomDestTerminal('');   setDomDestAddress('');
    setMovement('export');    setIntlServiceType('terminalToPort');
    setIntlOriginICD('');     setIntlOriginPort('');
    setIntlOriginAddr('');    setIntlOriginForeign('');
    setIntlDestICD('');       setIntlDestPort('');
    setIntlDestAddr('');      setIntlDestForeign('');
    setContainerType('');     setNumContainers(1);
    setTotalWeight('');       setCommodity('FAK (Freight of All Kinds)');
    setHazardous(false);      setReadyDate(new Date());
    setGoodsServiceType('terminalToTerminal');
    setGoodsOriginTerm('');   setGoodsOriginAddr('');
    setGoodsDestTerm('');     setGoodsDestAddr('');
    setGoodsWeight('');       setGoodsCommodity('FAK (Freight of All Kinds)');
    setGoodsWagonType('');    setNumWagons(1);
    setGoodsHazardous(false); setGoodsDate(new Date());
    setParcelServiceType('terminalToTerminal');
    setParcelOriginTerm('');  setParcelOriginAddr('');
    setParcelDestTerm('');    setParcelDestAddr('');
    setParcelWeight('');      setParcelDims('');
    setParcelDesc('');        setParcelHazardous(false);
    setParcelDate(new Date()); setParcelCount(1);
    setErrors({});            setShowValMsg(false);
  };

  // Clear location inputs when the user switches service type / mode / movement,
  // so a previously typed origin/destination doesn't linger into the new context.
  const resetDomLoc    = () => { setDomOriginTerminal(''); setDomOriginAddress(''); setDomDestTerminal(''); setDomDestAddress(''); };
  const resetIntlLoc   = () => { setIntlOriginICD(''); setIntlOriginPort(''); setIntlOriginAddr(''); setIntlOriginForeign(''); setIntlDestICD(''); setIntlDestPort(''); setIntlDestAddr(''); setIntlDestForeign(''); };
  const resetGoodsLoc  = () => { setGoodsOriginTerm(''); setGoodsOriginAddr(''); setGoodsDestTerm(''); setGoodsDestAddr(''); };
  const resetParcelLoc = () => { setParcelOriginTerm(''); setParcelOriginAddr(''); setParcelDestTerm(''); setParcelDestAddr(''); };

  const handleSubmit = async (): Promise<TrainContainerFormData | TrainGoodsFormData | TrainParcelFormData | null> => {
    const e: Record<string,string> = {};
    let fd: TrainContainerFormData | TrainGoodsFormData | TrainParcelFormData | null = null;

    if (activeTab === 'container') {
      if (containerMode === 'domestic') {
        const st = domServiceType;
        const isDoorO = st === 'doorToDoor' || st === 'doorToTerminal';
        const isDoorD = st === 'doorToDoor' || st === 'terminalToDoor';
        if (!domServiceType) e.serviceType = 'Required';
        if (isDoorO  && !domOriginAddress)  e.originAddress  = 'Required';
        if (!isDoorO && !domOriginTerminal) e.originTerminal = 'Required';
        if (isDoorD  && !domDestAddress)    e.destAddress    = 'Required';
        if (!isDoorD && !domDestTerminal)   e.destTerminal   = 'Required';
      } else {
        const org = getIntlOrigin();
        const dst = getIntlDest();
        if (!org) e.intlOrigin = 'Origin is required';
        if (!dst) e.intlDest   = 'Destination is required';
      }
      if (!containerType)                                                           e.containerType  = 'Required';
      if (!parseNumber(numContainers) || (parseNumber(numContainers)||0) < 1)     e.numContainers  = 'Required';
      // Empty international containers carry no cargo — weight isn't required.
      if (!isIntlEmpty) {
        if (!parseNumber(totalWeight) || (parseNumber(totalWeight)||0) < 1)       e.totalWeight    = 'Required';
      }
      if (!commodity)                                                               e.commodity      = 'Required';
      if (hazardous === '')                                                         e.hazardous      = 'Required';
      if (!readyDate)                                                               e.readyDate      = 'Required';

      if (Object.keys(e).length === 0) {
        const st         = containerMode === 'domestic' ? domServiceType : intlServiceType;
        const isDomestic = containerMode === 'domestic';
        const originStation = isDomestic
          ? (domServiceType === 'doorToDoor' || domServiceType === 'doorToTerminal' ? domOriginAddress : domOriginTerminal)
          : getIntlOrigin();
        const destStation = isDomestic
          ? (domServiceType === 'doorToDoor' || domServiceType === 'terminalToDoor' ? domDestAddress : domDestTerminal)
          : getIntlDest();

        fd = {
          bookingType: 'Train Container Booking',
          isDomestic,
          serviceType: st,
          originStation,
          destinationStation: destStation,
          originTerminal:      isDomestic && (domServiceType === 'terminalToTerminal' || domServiceType === 'terminalToDoor') ? domOriginTerminal : undefined,
          destinationTerminal: isDomestic && (domServiceType === 'terminalToTerminal' || domServiceType === 'doorToTerminal')  ? domDestTerminal   : undefined,
          containerType,
          numberOfContainers: parseNumber(numContainers) as number,
          totalWeight:        isIntlEmpty ? 0 : (parseNumber(totalWeight) as number),
          cargoType:          commodity,
          hazardousCargo:     hazardous === true,
          readyDate:          readyDate?.toISOString().split('T')[0] || '',
          cargoValue:         0,
          insuranceRequired:  false,
          ...(containerMode === 'international' && { etmsMovementType: movement, emptyContainer: isIntlEmpty }),
        } as TrainContainerFormData;
      }
    } else if (activeTab === 'goods') {
      const st = goodsServiceType;
      const isDoorO = st === 'doorToDoor' || st === 'doorToTerminal';
      const isDoorD = st === 'doorToDoor' || st === 'terminalToDoor';
      if (!st) e.serviceType = 'Required';
      if (isDoorO  && !goodsOriginAddr) e.originAddress  = 'Required';
      if (!isDoorO && !goodsOriginTerm) e.originTerminal = 'Required';
      if (isDoorD  && !goodsDestAddr)   e.destAddress    = 'Required';
      if (!isDoorD && !goodsDestTerm)   e.destTerminal   = 'Required';
      if (!parseNumber(goodsWeight)) e.goodsWeight = 'Required';
      if (!goodsCommodity)           e.commodity   = 'Required';
      if (!goodsWagonType)           e.wagonType   = 'Required';
      if (!parseNumber(numWagons))   e.numWagons   = 'Required';
      if (goodsHazardous === '')     e.hazardous   = 'Required';
      if (!goodsDate)                e.readyDate   = 'Required';
      if (Object.keys(e).length === 0) {
        fd = {
          bookingType:        'Train Goods Booking',
          isDomestic:         true,
          serviceType:        st,
          originStation:      isDoorO ? goodsOriginAddr : goodsOriginTerm,
          destinationStation: isDoorD ? goodsDestAddr   : goodsDestTerm,
          originTerminal:     !isDoorO ? goodsOriginTerm : undefined,
          originAddress:       isDoorO ? goodsOriginAddr : undefined,
          destinationTerminal:!isDoorD ? goodsDestTerm   : undefined,
          destinationAddress:  isDoorD ? goodsDestAddr   : undefined,
          totalWeight:        parseNumber(goodsWeight) as number,
          cargoType:          goodsCommodity,
          wagonType:          goodsWagonType,
          numberOfWagons:     parseNumber(numWagons) as number,
          hazardousCargo:     goodsHazardous === true,
          readyDate:          goodsDate?.toISOString().split('T')[0] || '',
          cargoValue: 0, insuranceRequired: false,
        } as TrainGoodsFormData;
      }
    } else if (activeTab === 'parcel') {
      const st = parcelServiceType;
      const isDoorO = st === 'doorToDoor' || st === 'doorToTerminal';
      const isDoorD = st === 'doorToDoor' || st === 'terminalToDoor';
      if (!st) e.serviceType = 'Required';
      if (isDoorO  && !parcelOriginAddr) e.originAddress  = 'Required';
      if (!isDoorO && !parcelOriginTerm) e.originTerminal = 'Required';
      if (isDoorD  && !parcelDestAddr)   e.destAddress    = 'Required';
      if (!isDoorD && !parcelDestTerm)   e.destTerminal   = 'Required';
      if (!parseNumber(parcelWeight)) e.parcelWeight = 'Required';
      if (!parcelDims)               e.parcelDims   = 'Required';
      if (!parcelDesc)               e.parcelDesc   = 'Required';
      if (!parseNumber(parcelCount)) e.parcelCount  = 'Required';
      if (parcelHazardous === '')    e.hazardous    = 'Required';
      if (!parcelDate)               e.readyDate    = 'Required';
      if (Object.keys(e).length === 0) {
        fd = {
          bookingType:        'Train Parcel Booking',
          isDomestic:         true,
          serviceType:        st,
          originStation:      isDoorO ? parcelOriginAddr : parcelOriginTerm,
          destinationStation: isDoorD ? parcelDestAddr   : parcelDestTerm,
          totalWeight:        parseNumber(parcelWeight) as number,
          dimensions:         parcelDims,
          detailedDescriptionOfGoods: parcelDesc,
          parcelCount:        parseNumber(parcelCount) as number,
          cargoType:          'Parcel',
          hazardousCargo:     parcelHazardous === true,
          readyDate:          parcelDate?.toISOString().split('T')[0] || '',
          cargoValue: 0, insuranceRequired: false,
        } as TrainParcelFormData;
      }
    }

    setErrors(e);
    if (Object.keys(e).length > 0) { setShowValMsg(true); return null; }

    // ── KEY CHANGE: go to recommended services first ──
    if (showButtons && fd) {
      navigate('/train-recommended-services', { state: { formData: fd } });
    }
    return fd;
  };

  useImperativeHandle(ref, () => ({ submit: handleSubmit, reset: resetAll }));

  const renderDomesticForm = () => {
    const st = domServiceType;
    const isDoorO = st === 'doorToDoor' || st === 'doorToTerminal';
    const isDoorD = st === 'doorToDoor' || st === 'terminalToDoor';
    return (
      <div className="space-y-4 mt-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Service Type</p>
          <div className="flex flex-wrap gap-2">
            {DOMESTIC_SERVICE_TYPES.map(opt => (
              <label key={opt.value} className={radioBtn(domServiceType === opt.value)}>
                <input type="radio" name="domST" value={opt.value}
                  checked={domServiceType === opt.value}
                  onChange={() => { setDomServiceType(opt.value); resetDomLoc(); setErrors(p => ({ ...p, serviceType: undefined as any })); }}
                  className="h-3.5 w-3.5 text-blue-600" />
                {opt.label}
              </label>
            ))}
          </div>
          {errors.serviceType && <p className="text-xs text-orange-500 mt-1">{errors.serviceType}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
          <div>
            {isDoorO
              ? <LocationAutocomplete key="dom-origin-city" label="Origin" required value={domOriginAddress}
                  onChange={v => { setDomOriginAddress(v); setErrors(p => ({ ...p, originAddress: undefined as any })); }}
                  placeholder="e.g., Chennai, 600001" locationType="city" />
              : <LocationAutocomplete key="dom-origin-term" label="Origin" required value={domOriginTerminal}
                  onChange={v => { setDomOriginTerminal(v); setErrors(p => ({ ...p, originTerminal: undefined as any })); }}
                  placeholder="e.g., Chennai" locationType="rail_terminal" />}
            {(errors.originAddress || errors.originTerminal) && <p className="text-xs text-orange-500 mt-1">{errors.originAddress || errors.originTerminal}</p>}
          </div>
          <div>
            {isDoorD
              ? <LocationAutocomplete key="dom-dest-city" label="Destination" required value={domDestAddress}
                  onChange={v => { setDomDestAddress(v); setErrors(p => ({ ...p, destAddress: undefined as any })); }}
                  placeholder="e.g., Delhi, 110001" locationType="city" />
              : <LocationAutocomplete key="dom-dest-term" label="Destination" required value={domDestTerminal}
                  onChange={v => { setDomDestTerminal(v); setErrors(p => ({ ...p, destTerminal: undefined as any })); }}
                  placeholder="e.g., Delhi" locationType="rail_terminal" />}
            {(errors.destAddress || errors.destTerminal) && <p className="text-xs text-orange-500 mt-1">{errors.destAddress || errors.destTerminal}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ready Date <span className="text-red-500">*</span></label>
            <input type="date" value={readyDate ? readyDate.toISOString().split('T')[0] : ''}
              onChange={e => setReadyDate(e.target.value ? new Date(e.target.value) : null)}
              className={inp(!!errors.readyDate)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Container Type <span className="text-red-500">*</span></label>
            <select value={containerType} onChange={e => setContainerType(e.target.value)} className={inp(!!errors.containerType)}>
              <option value="">Select</option>
              {containerTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (KG) <span className="text-red-500">*</span></label>
            <input type="number" value={totalWeight} placeholder="e.g., 20000"
              onChange={e => setTotalWeight(e.target.value === '' ? '' : Number(e.target.value))}
              className={inp(!!errors.totalWeight)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. of Containers <span className="text-red-500">*</span></label>
            <input type="number" value={numContainers} min="1" placeholder="1"
              onChange={e => setNumContainers(e.target.value === '' ? '' : Number(e.target.value))}
              className={inp(!!errors.numContainers)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type <span className="text-red-500">*</span></label>
            <select value={commodity} onChange={e => setCommodity(e.target.value)} className={inp(!!errors.commodity)}>
              {allCommodities.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hazardous <span className="text-red-500">*</span></label>
            <div className="flex gap-4 mt-1">
              {[{v:true,l:'Yes'},{v:false,l:'No'}].map(o => (
                <label key={String(o.v)} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="domHaz" checked={hazardous === o.v}
                    onChange={() => setHazardous(o.v)} className="h-4 w-4 text-blue-600" /> {o.l}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInternationalForm = () => {
    const serviceOptions = movement === 'export' ? EXPORT_SERVICE_TYPES : IMPORT_SERVICE_TYPES;
    const st = intlServiceType;

    const getOriginValue = () => {
      if (movement === 'export') {
        return (st === 'doorToPort' || st === 'doorToTerminal') ? intlOriginAddr : intlOriginICD;
      }
      return intlOriginForeign;
    };
    const setOriginValue = (v: string) => {
      setErrors(p => ({ ...p, intlOrigin: undefined as any }));
      if (movement === 'export') {
        if (st === 'doorToPort' || st === 'doorToTerminal') setIntlOriginAddr(v);
        else setIntlOriginICD(v);
      } else setIntlOriginForeign(v);
    };
    const getDestValue = () => {
      if (movement === 'export') {
        return (st === 'terminalToPort' || st === 'doorToPort') ? intlDestPort : intlDestICD;
      }
      return (st === 'portToDoor' || st === 'terminalToDoor') ? intlDestAddr : intlDestICD;
    };
    const setDestValue = (v: string) => {
      setErrors(p => ({ ...p, intlDest: undefined as any }));
      if (movement === 'export') {
        if (st === 'terminalToPort' || st === 'doorToPort') setIntlDestPort(v);
        else setIntlDestICD(v);
      } else {
        if (st === 'portToDoor' || st === 'terminalToDoor') setIntlDestAddr(v);
        else setIntlDestICD(v);
      }
    };
    const isOriginGlobal = movement === 'import';
    const isOriginDoor   = movement === 'export' && (st === 'doorToPort' || st === 'doorToTerminal');
    const isDestDoor     = movement === 'import' && (st === 'portToDoor' || st === 'terminalToDoor');

    return (
      <div className="space-y-3 mt-2">
        <div className="mb-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mode</p>
          <div className="flex flex-wrap gap-2">
            {([['export','Export'],['import','Import']] as const).map(([val, label]) => (
              <label key={val} className={`${radioBtn(movement === val)} w-36`}>
                <input type="radio" name="intlMovement" value={val}
                  checked={movement === val}
                  onChange={() => { setMovement(val); resetIntlLoc(); setErrors({}); }}
                  className="h-3.5 w-3.5 text-blue-600" />
                {label}
              </label>
            ))}
          </div>
        </div>
        <div className="mb-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Service Type</p>
          <div className="flex flex-wrap gap-2">
            {serviceOptions.map(opt => (
              <label key={opt.value} className={radioBtn(intlServiceType === opt.value)}>
                <input type="radio" name="intlST" value={opt.value}
                  checked={intlServiceType === opt.value}
                  onChange={() => {
                    setIntlServiceType(opt.value);
                    resetIntlLoc();
                    setErrors(p => ({ ...p, intlOrigin: undefined as any, intlDest: undefined as any }));
                  }}
                  className="h-3.5 w-3.5 text-blue-600" />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
          <div>
            <LocationAutocomplete key={`intl-origin-${movement}-${st}`} label="Origin" required
              value={getOriginValue()} onChange={setOriginValue}
              placeholder={isOriginDoor ? 'e.g., City / address' : isOriginGlobal ? 'e.g., Shanghai Port' : 'e.g., Chennai'}
              locationType={isOriginDoor ? 'city' : isOriginGlobal ? 'seaport' : 'rail_terminal'}
              global={isOriginGlobal} />
            {errors.intlOrigin && <p className="text-xs text-orange-500 mt-1">{errors.intlOrigin}</p>}
          </div>
          <div>
            <LocationAutocomplete key={`intl-dest-${movement}-${st}`} label="Destination" required
              value={getDestValue()} onChange={setDestValue}
              placeholder={isDestDoor ? 'e.g., City / address' : movement === 'export' && (st === 'terminalToPort' || st === 'doorToPort') ? 'e.g., JNPT, Mundra' : 'e.g., Delhi'}
              locationType={isDestDoor ? 'city' : movement === 'export' && (st === 'terminalToPort' || st === 'doorToPort') ? 'seaport' : 'rail_terminal'}
              global={false} />
            {errors.intlDest && <p className="text-xs text-orange-500 mt-1">{errors.intlDest}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
            <input type="date" value={readyDate ? readyDate.toISOString().split('T')[0] : ''}
              onChange={e => setReadyDate(e.target.value ? new Date(e.target.value) : null)}
              className={inp(!!errors.readyDate)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Container Type <span className="text-red-500">*</span></label>
            <select value={containerType} onChange={e => setContainerType(e.target.value)} className={inp(!!errors.containerType)}>
              <option value="">Select Container Type</option>
              {intlContainerTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (KG) {!isIntlEmpty && <span className="text-red-500">*</span>}
            </label>
            <input type="number" value={isIntlEmpty ? '' : totalWeight} disabled={isIntlEmpty}
              placeholder={isIntlEmpty ? 'Not required (empty container)' : 'e.g., 20000'}
              onChange={e => setTotalWeight(e.target.value === '' ? '' : Number(e.target.value))}
              className={`${inp(!!errors.totalWeight)} ${isIntlEmpty ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. of Containers <span className="text-red-500">*</span></label>
            <input type="number" value={numContainers} min="1"
              onChange={e => setNumContainers(e.target.value === '' ? '' : Number(e.target.value))}
              className={inp(!!errors.numContainers)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type <span className="text-red-500">*</span></label>
            <select value={commodity} onChange={e => setCommodity(e.target.value)} className={inp(!!errors.commodity)}>
              {allCommodities.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hazardous <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-4 pt-1">
              {[{v:true,l:'Yes'},{v:false,l:'No'}].map(o => (
                <label key={String(o.v)} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="intlHaz" checked={hazardous === o.v}
                    onChange={() => setHazardous(o.v)} className="h-4 w-4 text-blue-600" /> {o.l}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGoodsForm = () => {
    const st = goodsServiceType;
    const isDoorO = st === 'doorToDoor' || st === 'doorToTerminal';
    const isDoorD = st === 'doorToDoor' || st === 'terminalToDoor';
    return (
      <div className="space-y-4 mt-3">
        <div className="flex flex-wrap gap-2">
          {DOMESTIC_SERVICE_TYPES.map(opt => (
            <label key={opt.value} className={radioBtn(goodsServiceType === opt.value)}>
              <input type="radio" name="gdST" value={opt.value} checked={goodsServiceType === opt.value}
                onChange={() => { setGoodsServiceType(opt.value); resetGoodsLoc(); }} className="h-3.5 w-3.5 text-blue-600" />
              {opt.label}
            </label>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
          <div>
            {isDoorO
              ? <LocationAutocomplete key="goods-origin-city" label="Origin" required value={goodsOriginAddr}
                  onChange={v => setGoodsOriginAddr(v)} placeholder="City / address" locationType="city" />
              : <LocationAutocomplete key="goods-origin-term" label="Origin" required value={goodsOriginTerm}
                  onChange={v => setGoodsOriginTerm(v)} placeholder="e.g., Delhi" locationType="rail_terminal" />}
          </div>
          <div>
            {isDoorD
              ? <LocationAutocomplete key="goods-dest-city" label="Destination" required value={goodsDestAddr}
                  onChange={v => setGoodsDestAddr(v)} placeholder="City / address" locationType="city" />
              : <LocationAutocomplete key="goods-dest-term" label="Destination" required value={goodsDestTerm}
                  onChange={v => setGoodsDestTerm(v)} placeholder="e.g., Mumbai" locationType="rail_terminal" />}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
            <input type="date" value={goodsDate ? goodsDate.toISOString().split('T')[0] : ''}
              onChange={e => setGoodsDate(e.target.value ? new Date(e.target.value) : null)}
              className={inp(!!errors.readyDate)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wagon Type <span className="text-red-500">*</span></label>
            <select value={goodsWagonType} onChange={e => setGoodsWagonType(e.target.value)} className={inp(!!errors.wagonType)}>
              <option value="">Select</option>
              {wagonTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (Tons) <span className="text-red-500">*</span></label>
            <input type="number" value={goodsWeight} placeholder="e.g., 50"
              onChange={e => setGoodsWeight(e.target.value === '' ? '' : Number(e.target.value))}
              className={inp(!!errors.goodsWeight)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. of Wagons <span className="text-red-500">*</span></label>
            <input type="number" value={numWagons} min="1"
              onChange={e => setNumWagons(e.target.value === '' ? '' : Number(e.target.value))}
              className={inp(!!errors.numWagons)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type <span className="text-red-500">*</span></label>
            <select value={goodsCommodity} onChange={e => setGoodsCommodity(e.target.value)} className={inp(false)}>
              {allCommodities.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hazardous <span className="text-red-500">*</span></label>
            <div className="flex gap-4 mt-1">
              {[{v:true,l:'Yes'},{v:false,l:'No'}].map(o => (
                <label key={String(o.v)} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="radio" name="gdHaz" checked={goodsHazardous === o.v}
                    onChange={() => setGoodsHazardous(o.v)} className="h-4 w-4 text-blue-600" /> {o.l}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderParcelForm = () => {
    const st = parcelServiceType;
    const isDoorO = st === 'doorToDoor' || st === 'doorToTerminal';
    const isDoorD = st === 'doorToDoor' || st === 'terminalToDoor';
    return (
      <div className="space-y-4 mt-3">
        <div className="flex flex-wrap gap-2">
          {DOMESTIC_SERVICE_TYPES.map(opt => (
            <label key={opt.value} className={radioBtn(parcelServiceType === opt.value)}>
              <input type="radio" name="pcST" value={opt.value} checked={parcelServiceType === opt.value}
                onChange={() => { setParcelServiceType(opt.value); resetParcelLoc(); }} className="h-3.5 w-3.5 text-blue-600" />
              {opt.label}
            </label>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
          <div>
            {isDoorO
              ? <LocationAutocomplete key="parcel-origin-city" label="Origin" required value={parcelOriginAddr}
                  onChange={v => setParcelOriginAddr(v)} placeholder="City / address" locationType="city" />
              : <LocationAutocomplete key="parcel-origin-term" label="Origin" required value={parcelOriginTerm}
                  onChange={v => setParcelOriginTerm(v)} placeholder="e.g., Chennai" locationType="rail_terminal" />}
          </div>
          <div>
            {isDoorD
              ? <LocationAutocomplete key="parcel-dest-city" label="Destination" required value={parcelDestAddr}
                  onChange={v => setParcelDestAddr(v)} placeholder="City / address" locationType="city" />
              : <LocationAutocomplete key="parcel-dest-term" label="Destination" required value={parcelDestTerm}
                  onChange={v => setParcelDestTerm(v)} placeholder="e.g., Delhi" locationType="rail_terminal" />}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
            <input type="date" value={parcelDate ? parcelDate.toISOString().split('T')[0] : ''}
              onChange={e => setParcelDate(e.target.value ? new Date(e.target.value) : null)}
              className={inp(!!errors.readyDate)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (LxWxH cm) <span className="text-red-500">*</span></label>
            <input type="text" value={parcelDims} placeholder="e.g., 60x40x40"
              onChange={e => setParcelDims(e.target.value)} className={inp(!!errors.parcelDims)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (KG) <span className="text-red-500">*</span></label>
            <input type="number" value={parcelWeight} placeholder="e.g., 10"
              onChange={e => setParcelWeight(e.target.value === '' ? '' : Number(e.target.value))}
              className={inp(!!errors.parcelWeight)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <input type="text" value={parcelDesc} placeholder="e.g., Books, documents"
              onChange={e => setParcelDesc(e.target.value)} className={inp(!!errors.parcelDesc)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parcel Count <span className="text-red-500">*</span></label>
            <input type="number" value={parcelCount} min="1"
              onChange={e => setParcelCount(e.target.value === '' ? '' : Number(e.target.value))}
              className={inp(!!errors.parcelCount)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hazardous <span className="text-red-500">*</span></label>
            <div className="flex gap-4 mt-1">
              {[{v:true,l:'Yes'},{v:false,l:'No'}].map(o => (
                <label key={String(o.v)} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="radio" name="pcHaz" checked={parcelHazardous === o.v}
                    onChange={() => setParcelHazardous(o.v)} className="h-4 w-4 text-blue-600" /> {o.l}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={embedded ? '' : 'p-4 bg-white shadow-md rounded-xl border border-gray-200'}>
      <div className="flex justify-center gap-2 mb-4 p-1 bg-gray-50 rounded-xl border border-gray-200 w-fit mx-auto">
        {([['container','Container Train'],['parcel','Parcel Train'],['goods','Goods Train']] as const).map(([tab,label]) => (
          <button key={tab} type="button"
            onClick={() => { setActiveTab(tab); setErrors({}); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'container' && (
        <div>
          <div className="flex gap-3 mb-3">
            {([['domestic','Domestic'],['international','International']] as const).map(([mode,label]) => (
              <button key={mode} type="button" onClick={() => { setContainerMode(mode); resetDomLoc(); resetIntlLoc(); setErrors({}); }}
                className={toggleBtn(containerMode === mode)}>
                {label}
              </button>
            ))}
          </div>
          {containerMode === 'domestic' ? renderDomesticForm() : renderInternationalForm()}
        </div>
      )}

      {activeTab === 'goods'  && renderGoodsForm()}
      {activeTab === 'parcel' && renderParcelForm()}

      {showButtons && (
        <div className="flex justify-center mt-5">
          <button type="button" onClick={() => handleSubmit()}
            className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition">
            Search Quotes
          </button>
        </div>
      )}

      {showValMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <p className="text-gray-700 mb-4">Please fill in all required fields.</p>
            <button onClick={() => setShowValMsg(false)}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full">Got It</button>
          </div>
        </div>
      )}
    </div>
  );
});

export default RailQuoteForm;
