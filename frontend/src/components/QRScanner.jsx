import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import jsQR from 'jsqr';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';

const QRScanner = ({ onScan, onClose }) => {
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);
  const [lastScanned, setLastScanned] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const scannerInstance = useRef(null);

  useEffect(() => {
    // Initialize scanner immediately
    const initScanner = () => {
      try {
        if (!scannerInstance.current) {
          scannerInstance.current = new Html5QrcodeScanner(
            'qr-reader',
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            false
          );

          scannerInstance.current.render(onScanSuccess, onScanError);
        }
      } catch (err) {
        console.error('Error initializing scanner:', err);
        setError('Scanner non disponible. Utilisez l\'import d\'image.');
      }
    };

    initScanner();

    return () => {
      if (scannerInstance.current) {
        scannerInstance.current.clear().catch(console.error);
      }
    };
  }, []);

  const onScanSuccess = async (decodedText, decodedResult) => {
    if (!scanning) return;
    await processQRCode(decodedText);
  };

  const onScanError = (errorMessage) => {
    // Ignore common scanning errors, only show real errors
    if (!errorMessage.includes('No QR code found')) {
      console.warn('QR Scan error:', errorMessage);
    }
  };

  const resetScanner = () => {
    setError('');
    setScanning(true);
    setLastScanned(null);
    // Restart the scanner if it was stopped
    if (scannerInstance.current) {
      scannerInstance.current.resume();
    }
  };

  const processQRCode = async (qrData) => {
    setScanning(false);
    setLastScanned(qrData);
    setError('');

    try {
      const result = await onScan(qrData);

      if (result.success) {
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Erreur lors de l\'enregistrement');
        setScanning(true);
      }
    } catch (err) {
      setError('Erreur lors du scan');
      setScanning(true);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setError('');
      setScanning(true);

      // Create a canvas to draw the image and extract image data
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Scan for QR code using jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          // QR code found
          processQRCode(code.data);
        } else {
          // No QR code found
          setError('Aucun QR code trouvé dans l\'image');
          setScanning(false);
        }
      };

      img.onerror = () => {
        setError('Erreur lors du chargement de l\'image');
        setScanning(false);
      };

      // Load the image file
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('File upload error:', error);
      setError('Erreur lors de l\'analyse de l\'image');
      setScanning(false);
    }
  };


  return (
    <>
      {/* Add professional styles for html5-qrcode */}
      <style dangerouslySetInnerHTML={{
        __html: `
          #qr-reader {
            position: relative !important;
            width: 100% !important;
            height: 100% !important;
          }
          #qr-reader video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border-radius: 12px !important;
          }
          #qr-reader__scan_region {
            border: none !important;
            box-shadow: none !important;
          }
          #qr-reader__dashboard_section {
            display: none !important;
          }
          #qr-reader__header_message {
            display: none !important;
          }
          #qr-reader__camera_selection {
            display: none !important;
          }
          #qr-reader__status_span {
            display: none !important;
          }
          #qr-reader button {
            display: none !important;
          }
          .qr-scanner-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
          }
        `
      }} />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--company-color)] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera size={24} className="text-white" />
            <h2 className="text-xl font-bold text-white">Scanner QR Code</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scanner */}
        <div className="p-6">
          <div className="mb-4">
            <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-lg" style={{ height: '320px' }}>
              {/* Scanner Container */}
              <div id="qr-reader" className="absolute inset-0 w-full h-full"></div>

              {/* Overlay Instructions */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-white">
                  <div className="bg-black bg-opacity-60 rounded-lg p-4 backdrop-blur-sm">
                    <Camera size={32} className="mx-auto mb-2 text-blue-400" />
                    <p className="text-sm font-semibold">Positionnez le QR code dans le cadre</p>
                    <p className="text-xs opacity-80 mt-1">Le scan se fait automatiquement</p>
                  </div>
                </div>
              </div>

              {/* Corner brackets for better UX */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-blue-400 rounded-tl-lg"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-blue-400 rounded-tr-lg"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-blue-400 rounded-bl-lg"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-blue-400 rounded-br-lg"></div>
              </div>

              {/* Scanning line animation */}
              <div className="absolute inset-x-8 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
                <div className="h-0.5 bg-blue-400 animate-ping opacity-75 -mt-0.5"></div>
              </div>
            </div>
          </div>

          {/* Status and Alternative Methods */}
          <div className="border-t pt-4">
            {/* Status Indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${scanning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {scanning ? 'Scanner actif - Prêt à scanner' : 'Scanner inactif'}
              </span>
            </div>

            {/* Alternative Input Methods */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📁 Importer une image QR :
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[var(--company-color)] focus:ring-1 focus:ring-[var(--company-color)] file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--company-color)] file:text-white hover:file:bg-[var(--company-color-dark)]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sélectionnez une photo contenant un QR code d'employé
                </p>
              </div>
            </div>
          </div>


          {/* Status Messages */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">Erreur du scanner</p>
              <p className="text-red-600 text-xs mt-1">{error}</p>
              <p className="text-red-600 text-xs mt-2">Utilisez l'import d'image ci-dessous.</p>
            </div>
          )}

          {lastScanned && !error && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm font-medium">✅ Présence enregistrée avec succès</p>
              <p className="text-green-600 text-xs mt-1">L'employé a été marqué présent.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default QRScanner;