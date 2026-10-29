const SkillBadge = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-medium leading-none text-primary ${className}`}
  >
    {children}
  </span>
);

export default SkillBadge;
