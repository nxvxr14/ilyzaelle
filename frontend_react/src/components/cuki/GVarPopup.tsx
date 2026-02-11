type GVarPopupProps = {
  gVarData: Record<string, unknown> | null;
  onClose: () => void;
  onInsert: (varName: string) => void;
};

const getVarType = (value: unknown): string => {
  if (Array.isArray(value)) return "array";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string") return "string";
  if (value === null || value === undefined) return "null";
  return typeof value;
};

const getVarTypeSpanish = (type: string): string => {
  switch (type) {
    case "number": return "numerica";
    case "boolean": return "booleana";
    case "array": return "arreglo";
    case "string": return "texto";
    default: return type;
  }
};

const getTypeColor = (type: string): string => {
  switch (type) {
    case "number":
      return "text-blue-400";
    case "boolean":
      return "text-yellow-400";
    case "array":
      return "text-green-400";
    case "string":
      return "text-orange-400";
    default:
      return "text-gray-400";
  }
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return `[${value.length} items]`;
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return `"${value}"`;
  return String(value);
};

const GVarPopup = ({ gVarData, onClose, onInsert }: GVarPopupProps) => {
  const entries = gVarData
    ? Object.entries(gVarData).filter(([key]) => !key.endsWith("_time"))
    : [];

  return (
    <div className="absolute bottom-full left-0 mb-2 w-72 max-h-64 bg-[#1a1625] border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
          Variables Globales
        </span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors text-lg leading-none cursor-pointer"
        >
          &times;
        </button>
      </div>

      {/* Variables list */}
      <div className="overflow-y-auto max-h-52">
        {entries.length === 0 ? (
          <div className="px-3 py-4 text-center text-gray-500 text-xs">
            {gVarData === null
              ? "Conectando al servidor..."
              : "No hay variables globales"}
          </div>
        ) : (
          entries.map(([key, value]) => {
            const type = getVarType(value);
            const typeEs = getVarTypeSpanish(type);
            return (
              <button
                key={key}
                onClick={() => onInsert(`variable ${typeEs} ${key}`)}
                className="w-full text-left px-3 py-2 hover:bg-[#2a2435] transition-colors cursor-pointer border-b border-gray-800 last:border-b-0"
                title={`Insertar "variable ${typeEs} ${key}" en el prompt`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-white font-mono truncate">
                    {key}
                  </span>
                  <span
                    className={`text-xs font-mono shrink-0 ${getTypeColor(type)}`}
                  >
                    {type}
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                  {formatValue(value)}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GVarPopup;
