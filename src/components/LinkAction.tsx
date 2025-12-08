export default function LinkAction({ children = "Ver" }: { children?: React.ReactNode }) {
  return (
    <button className="group inline-flex items-center text-xs cursor-pointer   font-semibold text-[#0ae98a] hover:text-white transition-colors">
      {children}
      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
const ChevronRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);