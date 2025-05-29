export const getBorderColor = (goalType: string): string => {
  switch (goalType) {
    case 'Overarching':
      return '#1565C0';
    case 'Longterm':
      return '#2E7D32';
    case 'Moderate':
      return '#E65100';
    case 'Micro':
      return '#6A1B9A';
    case 'Day':
      return '#00838F';
    default:
      return '#424242';
  }
}; 