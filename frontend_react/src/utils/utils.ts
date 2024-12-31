// cada vez que se crea una carpeta toca regisrarla en tsonfig.json para tener el alias

export default function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const formatter = new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return formatter.format(date);
}
