export default function InputField({ type, placeholder, value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full p-3 mb-4 bg-mkhe-input text-mkhe-text border border-mkhe-border rounded outline-none focus:border-mkhe-primary transition-colors placeholder:text-mkhe-text/50"
    />
  );
}
