// src/components/QRScanner.tsx
import { useState } from "react";
import QrScanner from "react-qr-scanner";

type QRScannerProps = {
  onScan: (value: string) => void;
  onClose: () => void;
};

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);

  const handleScan = (data: any) => {
    if (data?.text) {
      onScan(data.text);
      onClose();
    }
  };

  const handleError = (err: any) => {
    console.error("QR Scan error:", err);
    setError("Camera access failed or not supported.");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
      <p className="text-white mb-4">Scanning QR Code...</p>
      <div className="w-[300px] h-[300px] border border-white rounded">
        <QrScanner
          delay={300}
          style={{ width: "100%", height: "100%" }}
          onScan={handleScan}
          onError={handleError}
        />
      </div>
      <button onClick={onClose} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
        Cancel
      </button>
      {error && <p className="text-red-400 mt-2">{error}</p>}
    </div>
  );
};

export default QRScanner;