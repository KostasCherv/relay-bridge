import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

interface StatusIconProps {
  status: string;
}

export const StatusIcon = ({ status }: StatusIconProps) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon style={{ color: 'green' }} />;
    case 'failed':
      return <ErrorIcon style={{ color: 'red' }} />;
    case 'pending':
    default:
      return <HourglassEmptyIcon style={{ color: 'orange' }} />;
  }
};
