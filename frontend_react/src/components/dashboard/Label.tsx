type varProps = {
    selectedVar: string;
    gVar: any;
  };
  
  function Label({ selectedVar, gVar }: varProps) {
    return (
      <div className="flex items-center space-x-4 p-4 bg-white shadow-lg rounded-lg w-auto min-w-max">
        <span className="font-semibold text-lg text-gray-800">{selectedVar}:</span>
        <span className="text-lg text-gray-600">{gVar[selectedVar]}</span>
      </div>
    );
  }
  
  export default Label;
  