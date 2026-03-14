// src/pages/DealAnalyzer.jsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import PropertyForm from '../components/analyzer/PropertyForm';
import AnalysisResults from '../components/analyzer/AnalysisResults';
import {
  calculateMortgagePayment,
  calculateMonthlyCashFlow,
  calculateAnnualCashFlow,
  calculateCashOnCashReturn,
  calculateCapRate,
  calculateTotalInterest,
  calculateRehabBudget,
  calculateCashPulledOut,
  calculateNetCashInvested
} from '../utils/calculations';

const DEFAULT_VALUES = {
  address: '',
  bedrooms: '',
  bathrooms: '',
  purchasePrice: '',
  cashDown: '',
  initialLoan: '',
  monthlyRent: '',
  expenses: {
    propertyTax: '',
    insurance: '',
    hoa: '',
    managementPercent: 10,
    maintenancePercent: 1,
    vacancyPercent: 5
  },
  financing: {
    interestRate: 7,
    loanTerm: 30
  },
  refinance: {
    refinanceLoan: ''
  }
};

export default function DealAnalyzer() {
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('id');

  // Load property for editing
  useEffect(() => {
    const loadProperty = async () => {
      if (propertyId && user) {
        setLoading(true);
        try {
          const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
          if (propertyDoc.exists() && propertyDoc.data().userId === user.uid) {
            const loadedData = propertyDoc.data();
            setValues({
              ...DEFAULT_VALUES,
              ...loadedData,
              expenses: { ...DEFAULT_VALUES.expenses, ...loadedData.expenses },
              financing: { ...DEFAULT_VALUES.financing, ...loadedData.financing },
              refinance: { ...DEFAULT_VALUES.refinance, ...loadedData.refinance }
            });
          } else {
            alert('Property not found or access denied');
            navigate('/properties');
          }
        } catch (error) {
          console.error('Error loading property:', error);
          alert('Failed to load property');
        } finally {
          setLoading(false);
        }
      }
    };

    loadProperty();
  }, [propertyId, user, navigate]);

  // Calculate derived values
  const calculations = useMemo(() => {
    const purchasePrice = parseFloat(values.purchasePrice) || 0;
    const monthlyRent = parseFloat(values.monthlyRent) || 0;
    const cashDown = parseFloat(values.cashDown) || 0;
    const initialLoan = parseFloat(values.initialLoan) || 0;
    const refinanceLoan = parseFloat(values.refinance.refinanceLoan) || null;

    // Determine active loan amount (refinance takes precedence)
    const loanAmount = refinanceLoan || initialLoan;

    // Calculate BRRRR metrics
    const rehabBudget = calculateRehabBudget(initialLoan, cashDown, purchasePrice);
    const cashPulledOut = calculateCashPulledOut(refinanceLoan, initialLoan);
    const netCashInvested = calculateNetCashInvested(cashDown, cashPulledOut);

    // Calculate expenses (annual values divided by 12)
    const annualPropertyTax = parseFloat(values.expenses.propertyTax) || 0;
    const propertyTax = annualPropertyTax / 12;

    const annualInsurance = parseFloat(values.expenses.insurance) || 0;
    const insurance = annualInsurance / 12;

    const hoa = parseFloat(values.expenses.hoa) || 0;

    const managementPercent = parseFloat(values.expenses.managementPercent) || 0;
    const management = monthlyRent * (managementPercent / 100);

    const maintenancePercent = parseFloat(values.expenses.maintenancePercent) || 0;
    const maintenance = (purchasePrice * (maintenancePercent / 100)) / 12;

    const vacancyPercent = parseFloat(values.expenses.vacancyPercent) || 0;
    const vacancy = monthlyRent * (vacancyPercent / 100);

    const monthlyExpenses = propertyTax + insurance + hoa + management + maintenance + vacancy;

    // Calculate mortgage payment
    const interestRate = parseFloat(values.financing.interestRate) || 0;
    const loanTerm = parseInt(values.financing.loanTerm) || 30;
    const mortgagePayment = calculateMortgagePayment(loanAmount, interestRate, loanTerm);

    // Calculate cash flow
    const monthlyCashFlow = calculateMonthlyCashFlow(monthlyRent, monthlyExpenses, mortgagePayment);
    const annualCashFlow = calculateAnnualCashFlow(monthlyCashFlow);

    // Calculate ROI metrics (use netCashInvested if refinanced, otherwise cashDown)
    const totalCashInvested = refinanceLoan ? netCashInvested : cashDown;
    const cashOnCashReturn = calculateCashOnCashReturn(annualCashFlow, totalCashInvested);

    const annualIncome = monthlyRent * 12;
    const annualExpenses = monthlyExpenses * 12;
    const noi = annualIncome - annualExpenses;
    const capRate = calculateCapRate(annualIncome, annualExpenses, purchasePrice);

    // Calculate financing details
    const totalInterest = calculateTotalInterest(mortgagePayment, loanAmount, loanTerm);
    const totalPaid = mortgagePayment * loanTerm * 12;

    return {
      monthlyIncome: monthlyRent,
      monthlyExpenses,
      mortgagePayment,
      monthlyCashFlow,
      annualCashFlow,
      totalCashInvested,
      cashOnCashReturn,
      noi,
      capRate,
      loanAmount,
      totalInterest,
      totalPaid,
      purchasePrice,
      cashDown,
      initialLoan,
      rehabBudget,
      cashPulledOut,
      netCashInvested
    };
  }, [values]);

  const validateForm = () => {
    const newErrors = {};

    if (!values.address || values.address.trim().length < 3) {
      newErrors.address = 'Address is required';
    }

    if (!values.purchasePrice || values.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }

    if (!values.cashDown || values.cashDown <= 0) {
      newErrors.cashDown = 'Cash down is required and must be greater than 0';
    }

    if (!values.initialLoan || values.initialLoan <= 0) {
      newErrors.initialLoan = 'Initial loan is required and must be greater than 0';
    }

    if (!values.monthlyRent || values.monthlyRent <= 0) {
      newErrors.monthlyRent = 'Monthly rent must be greater than 0';
    }

    if (values.financing.interestRate < 0.1 || values.financing.interestRate > 20) {
      newErrors.interestRate = 'Interest rate must be between 0.1% and 20%';
    }

    if (values.financing.loanTerm < 1 || values.financing.loanTerm > 50) {
      newErrors.loanTerm = 'Loan term must be between 1 and 50 years';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user) {
      alert('You must be logged in to save properties.');
      return;
    }

    if (!validateForm()) return;

    setSaving(true);
    try {
      const monthlyRent = parseFloat(values.monthlyRent) || 0;
      const purchasePrice = parseFloat(values.purchasePrice) || 0;
      const cashDown = parseFloat(values.cashDown) || 0;
      const initialLoan = parseFloat(values.initialLoan) || 0;
      const managementPercent = parseFloat(values.expenses.managementPercent) || 0;
      const maintenancePercent = parseFloat(values.expenses.maintenancePercent) || 0;
      const vacancyPercent = parseFloat(values.expenses.vacancyPercent) || 0;

      const propertyData = {
        ...values,
        userId: user.uid,
        purchasePrice: purchasePrice,
        cashDown: cashDown,
        initialLoan: initialLoan,
        monthlyRent: monthlyRent,
        expenses: {
          propertyTax: parseFloat(values.expenses.propertyTax) || 0,
          insurance: parseFloat(values.expenses.insurance) || 0,
          hoa: parseFloat(values.expenses.hoa) || 0,
          management: (monthlyRent * managementPercent) / 100,
          managementPercent: managementPercent,
          maintenance: (purchasePrice * maintenancePercent) / 100 / 12,
          maintenancePercent: maintenancePercent,
          vacancy: (monthlyRent * vacancyPercent) / 100,
          vacancyPercent: vacancyPercent
        },
        financing: {
          interestRate: parseFloat(values.financing.interestRate),
          loanTerm: parseInt(values.financing.loanTerm)
        },
        refinance: {
          refinanceLoan: parseFloat(values.refinance.refinanceLoan) || null
        },
        updatedAt: serverTimestamp()
      };

      if (propertyId) {
        // Update existing property
        await updateDoc(doc(db, 'properties', propertyId), propertyData);
      } else {
        // Create new property
        propertyData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'properties'), propertyData);
      }

      navigate('/properties');
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Failed to save property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Deal Analyzer</h1>
          <p className="text-base-content/70 mt-2">
            Analyze your rental property investment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Column */}
          <div>
            <PropertyForm
              values={values}
              onChange={setValues}
              errors={errors}
            />
          </div>

          {/* Results Column */}
          <div>
            <AnalysisResults calculations={calculations} />

            {/* Save Button */}
            <div className="mt-6">
              <button
                className="btn btn-primary w-full"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner"></span>
                ) : propertyId ? (
                  'Update Property'
                ) : (
                  'Save Property'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
