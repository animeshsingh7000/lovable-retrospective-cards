
interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          <img 
            src="/lovable-uploads/7025ee19-4a34-44a5-9da0-5bf521e07f77.png" 
            alt="RDSolutions Logo" 
            className="h-8 w-auto"
          />
          <div className="border-l border-gray-300 pl-4">
            <h1 className="text-2xl font-semibold text-rd-secondary-dark">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
