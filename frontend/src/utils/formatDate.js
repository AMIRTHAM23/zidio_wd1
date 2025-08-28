import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export function formatDate(dateString) {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return `Today at ${format(date, 'HH:mm')}`;
  }
  
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'HH:mm')}`;
  }
  
  // If within the last 7 days, show relative time
  const daysDiff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  
  // Otherwise show full date
  return format(date, 'MMM dd, yyyy');
}