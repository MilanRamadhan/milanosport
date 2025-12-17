import React from "react";
import "./StepIndicator.css";

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: "Pilih Lapangan" },
    { number: 2, label: "Jadwal & Durasi" },
    { number: 3, label: "Data Pemesan" },
    { number: 4, label: "Pembayaran" },
  ];

  return (
    <div className="step-indicator">
      <div className="step-indicator-container">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className={`step-item ${currentStep >= step.number ? "active" : ""} ${currentStep > step.number ? "completed" : ""}`}>
              <div className="step-circle">
                {currentStep > step.number ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
            {index < steps.length - 1 && <div className={`step-line ${currentStep > step.number ? "completed" : ""}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
