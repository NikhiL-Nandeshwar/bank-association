// Constants
import { FORM_STYLES } from '@/constants/ui.constants';

type FormErrorProps = {
  message?: string;
};

export default function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return <p className={FORM_STYLES.error}>{message}</p>;
}
