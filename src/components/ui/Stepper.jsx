import "../../styles/pages/register.css";

export const Stepper = ({ currentStep }) => {
    const steps = ["Cuenta", "Datos"];

    return (
        <div className="stepper">
            {steps.map((label, index) => {
                const stepNumber = index + 1;

                return (
                    <div
                        key={label}
                        className={`stepper-item ${
                            currentStep === stepNumber
                                ? "active"
                                : currentStep > stepNumber
                                    ? "completed"
                                    : ""
                        }`}
                    >
                        <div className="stepper-circle">{stepNumber}</div>
                        <span>{label}</span>
                        {index < steps.length - 1 && <div className="stepper-line" />}
                    </div>
                );
            })}
        </div>
    );
};
