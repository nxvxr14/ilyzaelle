function Logo() {
  return (
    <div className="flex items-center justify-center">
      <img 
        src="https://i.ibb.co/3mhw4Sjt/ilyzaelle.png" 
        alt="Logo Ilyzaelle" 
        className="m-5 w-[500px] h-auto"  // Ajusta el tamaño con Tailwind
      />
      {/* <span className="ml-4 text-xl font-semibold">Ilyzaelle</span> */}
    </div>
  );
}

export default Logo;
