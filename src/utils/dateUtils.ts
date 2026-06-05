export const formatDateTime = (isoDateString: string | Date | undefined | null): string => {
  if (!isoDateString) return "-";
  try {
    const d = new Date(isoDateString);
    if (isNaN(d.getTime())) return "-";

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = String(hours).padStart(2, '0');

    return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
  } catch (error) {
    return "-";
  }
};

export const formatDateOnly = (isoDateString: string | Date | undefined | null): string => {
  if (!isoDateString) return "-";
  try {
    const d = new Date(isoDateString);
    if (isNaN(d.getTime())) return "-";

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    return "-";
  }
};
