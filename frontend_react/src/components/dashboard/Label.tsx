type varProps = {
  selectedVar: string;
  gVar: any;
};

function Label({ selectedVar, gVar }: varProps) {
  const value = gVar[selectedVar];

  // Funciones que manejan los distintos tipos de valor
  const formatValue = {
    boolean: (val: boolean) => (val ? "true" : "false"),
    number: (val: number) => val,
    array: (val: any[]) => (val.length > 0 ? val[val.length - 1] : 0),
    default: (val: any) => val,
  };

  // Determinamos el tipo de valor y aplicamos la función correspondiente
  const displayValue =
    typeof value === "boolean"
      ? formatValue.boolean(value)
      : typeof value === "number"
        ? formatValue.number(value)
        : Array.isArray(value)
          ? formatValue.array(value)
          : formatValue.default(value);

  return (
    <div className="flex items-center space-x-4 p-4 bg-white shadow-lg rounded-lg w-auto min-w-max">
      <span className="font-semibold text-lg text-gray-800">{selectedVar}:</span>
      <span className="text-lg text-gray-600">{displayValue}</span>
    </div>
  );
}

export default Label;
