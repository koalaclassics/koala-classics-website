import React, { useState, useMemo } from 'react';

export default function CostCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState(35000);

  const breakdown = useMemo(() => {
    const sourcingFee = 2300;
    const inspection = 400;
    const customsBroker = 300;
    const registration = 200;
    const escrow = Math.max(270, Math.min(400, vehiclePrice * 0.01));
    const shipping = 3500 + (vehiclePrice / 100000) * 1500;
    const duty = vehiclePrice * 0.025;
    const total = vehiclePrice + sourcingFee + inspection + escrow + shipping + duty + customsBroker + registration;

    return {
      vehiclePrice,
      sourcingFee,
      inspection,
      escrow,
      shipping,
      duty,
      customsBroker,
      registration,
      total,
    };
  }, [vehiclePrice]);

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const downloadEstimate = () => {
    const lines = [
      'KOALA CLASSICS — IMPORT COST ESTIMATE',
      '=====================================',
      '',
      'Vehicle Purchase Price:       ' + formatCurrency(breakdown.vehiclePrice),
      'Sourcing & Coordination Fee:  ' + formatCurrency(breakdown.sourcingFee),
      'Independent Inspection:       ' + formatCurrency(breakdown.inspection),
      'Payment Protection:           ' + formatCurrency(breakdown.escrow),
      'Shipping (AU → USA):          ' + formatCurrency(breakdown.shipping),
      'US Import Duty (2.5%):        ' + formatCurrency(breakdown.duty),
      'US Customs Broker:            ' + formatCurrency(breakdown.customsBroker),
      'State Registration:           ' + formatCurrency(breakdown.registration),
      '',
      '————————————————————————————————————',
      'TOTAL LANDED COST:            ' + formatCurrency(breakdown.total),
      '',
      'Generated at: https://www.koalaclassics.com',
    ];

    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'koala-classics-estimate.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const emailEstimate = () => {
    const subject = 'Koala Classics Import Cost Estimate';
    const body = `Hello,\n\nHere's your estimated import cost breakdown for a ${formatCurrency(breakdown.vehiclePrice)} Australian classic car:\n\nVehicle Purchase Price:       ${formatCurrency(breakdown.vehiclePrice)}\nSourcing & Coordination Fee:  ${formatCurrency(breakdown.sourcingFee)}\nIndependent Inspection:       ${formatCurrency(breakdown.inspection)}\nPayment Protection:           ${formatCurrency(breakdown.escrow)}\nShipping (AU → USA):          ${formatCurrency(breakdown.shipping)}\nUS Import Duty (2.5%):        ${formatCurrency(breakdown.duty)}\nUS Customs Broker:            ${formatCurrency(breakdown.customsBroker)}\nState Registration:           ${formatCurrency(breakdown.registration)}\n\nTOTAL LANDED COST:            ${formatCurrency(breakdown.total)}\n\nLearn more: https://www.koalaclassics.com\n\nBest regards,\nKoala Classics`;

    const mailtoLink = `mailto:adminkoalaclassics@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const CostRow = ({ label, detail, amount, isBold = false }) => (
    <div className={`flex justify-between items-start py-3 px-0 gap-4 ${!isBold ? 'border-b border-gray-300' : 'border-t-2 border-yellow-700 pt-4 mt-2'}`}>
      <div className="flex-1">
        <div className={isBold ? 'font-semibold text-lg text-gray-900' : 'text-sm text-gray-800'}>
          {label}
        </div>
        {detail && <div className="text-xs text-gray-500 mt-1">{detail}</div>}
      </div>
      <div className={`text-right font-semibold whitespace-nowrap ${isBold ? 'text-xl text-yellow-700' : 'text-gray-800'}`}>
        {amount}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Import Cost Calculator</h1>
          <p className="text-lg text-gray-700">
            Get an instant estimate for importing your Australian classic to the USA
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Vehicle Price Input */}
          <div className="mb-10">
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              VEHICLE PURCHASE PRICE
            </label>
            <div className="flex gap-4 items-center mb-4">
              <input
                type="range"
                min="10000"
                max="100000"
                step="1000"
                value={vehiclePrice}
                onChange={(e) => setVehiclePrice(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-yellow-700"
              />
              <div className="w-32 text-right">
                <input
                  type="number"
                  value={vehiclePrice}
                  onChange={(e) => setVehiclePrice(Math.min(100000, Math.max(10000, Number(e.target.value))))}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded text-gray-900 font-semibold text-lg"
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>$10,000</span>
              <span>$100,000</span>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">COST BREAKDOWN</h2>
            <div className="space-y-0">
              <CostRow
                label="Vehicle Purchase Price"
                amount={formatCurrency(breakdown.vehiclePrice)}
              />
              <CostRow
                label="Koala Classics Sourcing & Coordination"
                detail="Expert sourcing, inspection coordination, export handling"
                amount={formatCurrency(breakdown.sourcingFee)}
              />
              <CostRow
                label="Independent Inspection"
                detail="Third-party pre-purchase inspection report"
                amount={formatCurrency(breakdown.inspection)}
              />
              <CostRow
                label="Payment Protection"
                detail={`${Math.min(400, Math.max(270, vehiclePrice * 0.01)).toFixed(0) === '400' ? 'Escrow coordination (max)' : 'Escrow coordination (1% of price)'}`}
                amount={formatCurrency(breakdown.escrow)}
              />
              <CostRow
                label="Shipping (Australia → USA)"
                detail="International freight, container & port fees"
                amount={formatCurrency(breakdown.shipping)}
              />
              <CostRow
                label="US Import Duty"
                detail="Federal import duty at 2.5% rate"
                amount={formatCurrency(breakdown.duty)}
              />
              <CostRow
                label="US Customs Broker"
                detail="Port of entry clearance & customs processing"
                amount={formatCurrency(breakdown.customsBroker)}
              />
              <CostRow
                label="State Registration"
                detail="Estimated import vehicle registration"
                amount={formatCurrency(breakdown.registration)}
              />
              <CostRow
                label="TOTAL LANDED COST"
                amount={formatCurrency(breakdown.total)}
                isBold={true}
              />
            </div>
          </div>

          {/* Protected Message */}
          <div className="bg-green-50 border-l-4 border-green-700 p-4 mb-8">
            <div className="inline-block bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold uppercase mb-2">
              Protected
            </div>
            <p className="text-sm text-gray-800">
              Your payment is held safely in escrow until you verify the vehicle has arrived in good condition. You stay in complete control of when funds release.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={downloadEstimate}
              className="bg-yellow-700 hover:bg-yellow-800 text-white font-semibold py-3 px-6 rounded transition"
            >
              Download Estimate
            </button>
            <button
              onClick={emailEstimate}
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-6 rounded transition"
            >
              Email Estimate
            </button>
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-50 border border-gray-300 rounded p-4 text-xs text-gray-600 leading-relaxed">
            <strong>Disclaimer:</strong> This estimate is for reference only and based on current market conditions. Actual costs may vary due to vehicle condition, shipping schedules, currency fluctuations, and state-specific registration requirements. Koala Classics provides guidance and coordination, but the buyer is responsible for complying with federal and state import laws. Estimates do not guarantee import approval or specific final costs.
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-gray-600 text-sm">
            Ready to get started? <a href="/#quote" className="text-yellow-700 font-semibold hover:underline">Get a free personalized quote</a>
          </p>
        </div>
      </div>
    </div>
  );
}
