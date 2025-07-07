import React, { useState, useCallback } from 'react';

// Constants for PayPal fees. This is an approximation for international payments.
const PAYPAL_PERCENTAGE_FEE = 0.054; // 5.4%
const PAYPAL_FIXED_FEE = 0.30; // $0.30 USD

const DollarSignIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
  </svg>
);

const LogoIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round">
      <path d="M10 3h5.5C18.537 3 21 5.463 21 8.5S18.537 14 15.5 14H10v7H7V3h3zm3.5 8c1.38 0 2.5-1.12 2.5-2.5S14.88 6 13.5 6H10v5h3.5z" />
      <line x1="12" y1="1" x2="12" y2="23" strokeWidth="3.5" className="stroke-base-100" />
      <line x1="12" y1="1" x2="12" y2="23" strokeWidth="1.5" stroke="currentColor" />
    </svg>
  );

const PayPalCalculatorPage: React.FC = () => {
  const calculateReceivedAmount = useCallback((amount: number) => {
    if (isNaN(amount) || amount <= 0) return 0;
    const fee = (amount * PAYPAL_PERCENTAGE_FEE) + PAYPAL_FIXED_FEE;
    const result = amount - fee;
    return result > 0 ? result : 0;
  }, []);

  const calculateSendAmount = useCallback((amount: number) => {
    if (isNaN(amount) || amount <= 0) return 0;
    // Formula derived from: R = S - (S * P + F) => S = (R + F) / (1 - P)
    const result = (amount + PAYPAL_FIXED_FEE) / (1 - PAYPAL_PERCENTAGE_FEE);
    return result > 0 ? result : 0;
  }, []);

  const [sendAmount, setSendAmount] = useState('5.00');
  const [receiveAmount, setReceiveAmount] = useState(calculateReceivedAmount(5.00).toFixed(2));

  const handleSendAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSendAmount(value);
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > 0) {
        setReceiveAmount(calculateReceivedAmount(numericValue).toString());
      } else {
        setReceiveAmount('');
      }
    }
  }, [calculateReceivedAmount]);

  const handleReceiveAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setReceiveAmount(value);
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > 0) {
        setSendAmount(calculateSendAmount(numericValue).toString());
      } else {
        setSendAmount('');
      }
    }
  }, [calculateSendAmount]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value);

    if (isNaN(numericValue) || numericValue <= 0) {
        setSendAmount('0.00');
        setReceiveAmount('0.00');
    } else {
        if (name === 'amountToSend') {
            setSendAmount(numericValue.toFixed(2));
            setReceiveAmount(calculateReceivedAmount(numericValue).toFixed(2));
        } else { // name === 'amountToReceive'
            setReceiveAmount(numericValue.toFixed(2));
            setSendAmount(calculateSendAmount(numericValue).toFixed(2));
        }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-base-100 rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-8">
        <div className="flex items-center justify-center mb-6">
          <LogoIcon className="h-10 w-10 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-base-content ml-3">
            Calculadora PayPal
          </h1>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="amountToSend" className="text-sm font-medium text-gray-400">Se envía (USD)</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <DollarSignIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="amountToSend"
                name="amountToSend"
                value={sendAmount}
                onChange={handleSendAmountChange}
                onBlur={handleBlur}
                className="w-full pl-10 pr-4 py-3 text-2xl font-semibold text-base-content bg-base-200 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                autoComplete="off"
                inputMode="decimal"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="amountToReceive" className="text-sm font-medium text-gray-400">La cuenta destino recibe (USD)</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <DollarSignIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="amountToReceive"
                name="amountToReceive"
                value={receiveAmount}
                onChange={handleReceiveAmountChange}
                onBlur={handleBlur}
                className="w-full pl-10 pr-4 py-3 text-2xl font-semibold text-base-content bg-base-200 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                autoComplete="off"
                inputMode="decimal"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Cálculo basado en una tarifa estimada de <span className="font-semibold">{PAYPAL_PERCENTAGE_FEE * 100}% + ${PAYPAL_FIXED_FEE.toFixed(2)}</span> por transacción.
            Las tarifas pueden variar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayPalCalculatorPage;
