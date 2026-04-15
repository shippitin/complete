import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Truck, Search, CheckCircle, MapPin, XCircle, ChevronDown, ListPlus, X, LucideIcon, Zap } from 'lucide-react'; // Added Zap icon

// --- 1. TYPE DEFINITIONS (Based on our data models) ---

interface Asset {
  assetID: string;
  assetType: '20ft' | '40ft' | 'flatbed';
  currentLocation: string; // The location where it is currently EMPTY
  lastUnloadTime: string;
  status: 'Empty_Available' | 'Empty_InTransit' | 'Loaded';
}

interface Demand {
  shipmentID: string;
  requiredAssetType: '20ft' | '40ft' | 'flatbed';
  originStation: string; // The location where a shipment needs to be picked up
  destinationStation: string;
  readyDate: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface Match {
  assetID: string;
  shipmentID: string;
  originStation: string;
  destinationStation: string;
  assetType: '20ft' | '40ft' | 'flatbed';
  daysIdle: number;
  priority: 'High' | 'Medium' | 'Low';
  score: number; // Added score for prioritized sorting
}

// --- 2. MOCK DATA (Simulating Backend Data) ---

const mockAssets: Asset[] = [
    { assetID: 'C40-1001', assetType: '40ft', currentLocation: 'Mumbai_JNPT', lastUnloadTime: '2025-10-29', status: 'Empty_Available' },
    { assetID: 'C20-2005', assetType: '20ft', currentLocation: 'Delhi_Tughlakabad', lastUnloadTime: '2025-11-01', status: 'Empty_Available' },
    { assetID: 'C40-3011', assetType: '40ft', currentLocation: 'Chennai_ICD', lastUnloadTime: '2025-10-25', status: 'Empty_Available' },
    { assetID: 'F-7001', assetType: 'flatbed', currentLocation: 'Mumbai_JNPT', lastUnloadTime: '2025-11-03', status: 'Empty_Available' },
    // Changed status from 'Empty_InTransit' to 'Empty_Available' for demo visibility and matching
    { assetID: 'C20-4100', assetType: '20ft', currentLocation: 'Kolkata_Port', lastUnloadTime: '2025-11-04', status: 'Empty_Available' }, 
];

const mockDemand: Demand[] = [
    { shipmentID: 'S-900A', requiredAssetType: '40ft', originStation: 'Mumbai_JNPT', destinationStation: 'Delhi_Tughlakabad', readyDate: '2025-11-05', priority: 'High' },
    { shipmentID: 'S-901B', requiredAssetType: '20ft', originStation: 'Chennai_ICD', destinationStation: 'Bengaluru', readyDate: '2025-11-06', priority: 'Medium' },
    { shipmentID: 'S-902C', requiredAssetType: '40ft', originStation: 'Nagpur', destinationStation: 'Pune', readyDate: '2025-11-07', priority: 'Low' },
    { shipmentID: 'S-903D', requiredAssetType: '40ft', originStation: 'Mumbai_JNPT', destinationStation: 'Ahmedabad', readyDate: '2025-11-05', priority: 'High' },
];

// --- 3. HELPER FUNCTIONS ---

/**
 * Calculates the number of full days an asset has been idle.
 * Uses Math.floor for accurate full-day counting (0 days if unloaded today).
 * @param unloadTime The date string when the asset was last unloaded.
 * @returns The number of full idle days.
 */
const calculateDaysIdle = (unloadTime: string): number => {
    const today = new Date();
    const unloadDate = new Date(unloadTime);
    // Calculate the difference in milliseconds
    const diffTime = today.getTime() - unloadDate.getTime();
    // Calculate the difference in full days (using Math.floor)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    // Ensure non-negative
    return Math.max(0, diffDays); 
};

/**
 * Assigns a prioritization score to a potential match. Higher is better.
 * Logic: (Idle Days * 2) + Priority Bonus
 */
const getMatchScore = (match: Omit<Match, 'score'>): number => {
    let score = 0;
    
    // 1. Days Idle (Weight: 2) - Prioritize assets that have been idle longer
    score += match.daysIdle * 2;

    // 2. Priority (Bonus) - Prioritize High Demand
    if (match.priority === 'High') {
        score += 5; // Strong boost for High Priority
    } else if (match.priority === 'Medium') {
        score += 3;
    } else {
        score += 1; // Low
    }
    return score;
};


// --- 4. CORE COMPONENTS AND LOGIC ---

// Animation variants
const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    exit: { opacity: 0, scale: 0.8 }
};

// Simple reusable component for metrics
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
};

const MetricCard: React.FC<{ title: string, value: number, icon: LucideIcon, color: string }> = ({ title, value, icon: Icon, color }) => {
    const cardVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <motion.div 
            className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between border-b-4 border-indigo-200"
            variants={cardVariants}
        >
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
            </div>
            <Icon className={`w-8 h-8 ${color} opacity-70`} />
        </motion.div>
    );
};

// --- Confirmation Modal Component ---
interface ConfirmationModalProps {
    match: Match;
    onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ match, onClose }) => {
    // In a real app, this would be an API call
    const [isProcessing, setIsProcessing] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const handleBookingAction = () => {
        setIsProcessing(true);
        // Simulate an API call delay
        setTimeout(() => {
            setIsProcessing(false);
            setIsConfirmed(true);
        }, 1500);
    };

    return (
        <motion.div 
            className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div 
                className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl"
                variants={modalVariants}
            >
                <div className="flex justify-between items-start border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-green-700 flex items-center">
                        <CheckCircle className="w-6 h-6 mr-2" />
                        Confirm Backhaul Match
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <p className="text-lg font-semibold text-gray-800">
                        Asset <span className="text-indigo-600">{match.assetID}</span> ({match.assetType})
                        will fill shipment <span className="text-indigo-600">{match.shipmentID}</span>.
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg text-sm">
                        <p className="font-medium text-gray-700">Route:</p>
                        <p className="text-gray-900 font-bold">
                            {match.originStation} <span className="text-green-500 mx-1">→</span> {match.destinationStation}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                            The asset has been idle for <span className="font-bold text-red-600">{match.daysIdle} days</span>. This high-score match ({match.score}) drastically reduces empty movement emissions.
                        </p>
                    </div>

                    {!isConfirmed ? (
                        <button 
                            onClick={handleBookingAction}
                            disabled={isProcessing}
                            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                                isProcessing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {isProcessing ? 'Processing Booking...' : 'Execute Backhaul Booking'}
                        </button>
                    ) : (
                        <div className="text-center">
                            <CheckCircle className="w-10 h-10 mx-auto text-green-500 mb-2" />
                            <p className="text-xl font-bold text-green-600">Booking Confirmed!</p>
                            <p className="text-gray-600 text-sm mt-1">Shipment {match.shipmentID} is now linked to Asset {match.assetID}.</p>
                            <button onClick={onClose} className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-semibold">
                                Close and View Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};


const MatchCard: React.FC<{ match: Match, onConfirm: (match: Match) => void }> = ({ match, onConfirm }) => (
    <motion.div 
        className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500 shadow-md hover:shadow-lg transition flex flex-col space-y-2"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
    >
        <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2 text-green-700 font-bold">
                <CheckCircle className="w-5 h-5" />
                <span>MATCH FOUND</span>
            </div>
            {/* Display Match Score prominently */}
            <div className="flex items-center space-x-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                <Zap className="w-4 h-4" />
                <span>Score: {match.score}</span>
            </div>
        </div>
        
        <p className="text-xl font-extrabold text-gray-900">
            {match.assetID} ({match.assetType})
        </p>
        <div className="text-gray-600 flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold">{match.originStation}</span>
            <span className="text-xs text-gray-400">{' -> '}</span>
            <span>{match.destinationStation}</span>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-green-100">
            <span>Shipment: {match.shipmentID}</span>
            <span className={`font-medium ${match.daysIdle > 5 ? 'text-red-600' : 'text-orange-500'}`}>
                Idle for {match.daysIdle} days
            </span>
            <span className={`font-medium ${
                 match.priority === 'High' ? 'text-red-700' : 
                 match.priority === 'Medium' ? 'text-yellow-700' : 
                 'text-blue-700'
            }`}>
                {match.priority} Demand
            </span>
        </div>
        {/* Updated button to trigger the modal */}
        <button 
            className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
            onClick={() => onConfirm(match)}
        >
            Confirm Backhaul & Book
        </button>
    </motion.div>
);


// --- 5. MAIN ASSET TRACKER COMPONENT ---

const EmptyAssetTracker: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'All' | '20ft' | '40ft' | 'flatbed'>('All');
    // State for the confirmation modal
    const [modalMatch, setModalMatch] = useState<Match | null>(null);

    // Function to open the modal
    const handleConfirmBooking = (match: Match) => {
        setModalMatch(match);
    };

    // Function to close the modal
    const handleCloseModal = () => {
        setModalMatch(null);
        // In a real application, you would also refetch/update the mock data here 
        // to show the asset and demand are no longer available.
    };

    // Core Matching Logic
    const { availableAssets, matchingOpportunities } = useMemo(() => {
        const activeAssets = mockAssets.filter(asset => 
            asset.status === 'Empty_Available' && 
            (filterType === 'All' || asset.assetType === filterType)
        );

        const matches: Match[] = [];
        // Create a copy to track which assets haven't been matched yet
        const unmatchedAssets = [...activeAssets];

        // Simple nested loop matching: Asset Location must match Shipment Origin & Asset Type must match Required Type
        mockDemand.forEach(demand => {
            const potentialMatchIndex = unmatchedAssets.findIndex(asset =>
                asset.currentLocation === demand.originStation && 
                asset.assetType === demand.requiredAssetType
            );

            if (potentialMatchIndex !== -1) {
                const matchedAsset = unmatchedAssets[potentialMatchIndex];
                const calculatedIdleDays = calculateDaysIdle(matchedAsset.lastUnloadTime);

                const newMatch: Omit<Match, 'score'> = {
                    assetID: matchedAsset.assetID,
                    shipmentID: demand.shipmentID,
                    originStation: demand.originStation,
                    destinationStation: demand.destinationStation,
                    assetType: matchedAsset.assetType,
                    daysIdle: calculatedIdleDays,
                    priority: demand.priority,
                };
                
                // Calculate the score and push the final Match object
                matches.push({
                    ...newMatch,
                    score: getMatchScore(newMatch)
                });
                
                // Remove the matched asset from the available pool to avoid double booking
                unmatchedAssets.splice(potentialMatchIndex, 1);
            }
        });

        // 🎯 Sort the matches by score, descending (Highest score first)
        matches.sort((a, b) => b.score - a.score);

        return { availableAssets: unmatchedAssets, matchingOpportunities: matches };
    }, [filterType]); // Recalculate if the filter type changes

    // Filtering for the available assets list
    const filteredAvailableAssets = availableAssets.filter(asset => 
        asset.assetID.toLowerCase().includes(searchTerm.toLowerCase()) || 
        asset.currentLocation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const AssetCard: React.FC<{ asset: Asset }> = ({ asset }) => (
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex justify-between items-center hover:shadow-md transition">
            <div>
                <p className="font-bold text-lg text-indigo-700">{asset.assetID}</p>
                <p className="text-sm text-gray-500 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    {asset.currentLocation}
                </p>
            </div>
            <div className="text-right">
                <p className="font-semibold text-gray-800">{asset.assetType.toUpperCase()}</p>
                <p className="text-xs text-gray-500">Idle: {calculateDaysIdle(asset.lastUnloadTime)} days</p>
            </div>
        </div>
    );


    return (
        <div className="min-h-screen bg-gray-100 p-8 font-inter">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2 flex items-center">
                <Truck className="w-8 h-8 mr-3 text-indigo-600" />
                Empty Asset Tracker & Backhaul Matcher
            </h1>
            <p className="text-lg text-gray-500 mb-8">
                Centralized tool to reduce empty rail movements and improve green logistics metrics.
            </p>

            {/* --- Key Metrics Summary --- */}
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <MetricCard title="Available Empty Assets" value={availableAssets.length + matchingOpportunities.length} icon={ListPlus} color="text-indigo-600" />
                <MetricCard title="Immediate Backhaul Matches" value={matchingOpportunities.length} icon={CheckCircle} color="text-green-600" />
                <MetricCard title="Total Unmatched Demand" value={mockDemand.length - matchingOpportunities.length} icon={XCircle} color="text-red-600" />
            </motion.div>

            {/* --- Main Dashboard Layout --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- 1. Matching Opportunities (High-Value Section) --- */}
                <motion.div className="lg:col-span-2" variants={sectionVariants} initial="hidden" animate="visible">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                        Prioritized Backhaul Matches ({matchingOpportunities.length})
                    </h2>
                    {matchingOpportunities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {matchingOpportunities.map(match => (
                                <MatchCard key={match.assetID} match={match} onConfirm={handleConfirmBooking} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-yellow-500 text-center text-gray-600">
                            <Search className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                            <p>No immediate backhaul matches found based on current empty assets and active demand.</p>
                            <p className="text-sm mt-2">Check the Available Assets list for manual positioning.</p>
                        </div>
                    )}
                </motion.div>

                {/* --- 2. Available Empty Assets (Filterable List) --- */}
                <motion.div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-xl border-t-4 border-indigo-500" variants={sectionVariants} initial="hidden" animate="visible">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Available Empty Assets ({filteredAvailableAssets.length})
                    </h2>
                    
                    {/* Filters and Search */}
                    <div className="mb-4 space-y-3">
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by ID or Location..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="relative">
                            <select
                                className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                            >
                                <option value="All">All Asset Types</option>
                                <option value="20ft">20ft Container</option>
                                <option value="40ft">40ft Container</option>
                                <option value="flatbed">Flatbed Railcar</option>
                            </select>
                            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    
                    {/* Asset List */}
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {filteredAvailableAssets.length > 0 ? (
                            filteredAvailableAssets.map(asset => (
                                <AssetCard key={asset.assetID} asset={asset} />
                            ))
                        ) : (
                            <div className="text-center py-6 text-gray-500 text-sm">
                                No empty assets found matching your criteria.
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* --- Confirmation Modal Render --- */}
            <AnimatePresence>
                {modalMatch && (
                    <ConfirmationModal match={modalMatch} onClose={handleCloseModal} />
                )}
            </AnimatePresence>
        </div>
    );
};


// The main export should be the component itself
export default EmptyAssetTracker;