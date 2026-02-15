import '../../styles/components/input.css';

export const Input = ({ label, ...props }) => (
    <div className="input-group">
        <label>{label}</label>
        <input {...props} />
    </div>
);
