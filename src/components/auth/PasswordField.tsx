import { useState, type InputHTMLAttributes } from 'react';
import { Icon } from '../ui/Icon';
import { TextField } from './TextField';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  label?: string;
  error?: string;
}

export function PasswordField({ label = 'Contraseña', error, ...inputProps }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      label={label}
      error={error}
      type={visible ? 'text' : 'password'}
      placeholder="••••••••"
      {...inputProps}
      trailing={
        <button
          type="button"
          className="field__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
        >
          <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
        </button>
      }
    />
  );
}
