function Logo() {
  return (
    <div className="flex items-center justify-center">
      <img 
        src="https://static.wikia.nocookie.net/dofus/images/2/28/Ilyzaelle.png" 
        alt="Logo Ilyzaelle" 
        className="w-[150px] h-auto"  // Ajusta el tamaño con Tailwind
      />
      {/* <span className="ml-4 text-xl font-semibold">Ilyzaelle</span> */}
    </div>
  );
}

export default Logo;
