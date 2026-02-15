import '../../styles/components/buttons.css';

export const Button = ({ children, variant = 'primary', ...props }) => {
    return (
        <button className={`btn btn-${variant}`} {...props}>
            {children}
        </button>
    );
};
