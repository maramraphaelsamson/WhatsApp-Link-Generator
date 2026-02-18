
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
};

export const generateWhatsAppUrl = (phone: string, message?: string): string => {
  const cleanPhone = formatPhoneNumber(phone);
  let url = `https://wa.me/${cleanPhone}`;
  
  if (message && message.trim()) {
    const encodedMessage = encodeURIComponent(message.trim());
    url += `?text=${encodedMessage}`;
  }
  
  return url;
};

export const isValidPhone = (phone: string): boolean => {
  const clean = formatPhoneNumber(phone);
  return clean.length >= 7 && clean.length <= 15;
};
