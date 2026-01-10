import { Modal, TextInput, PasswordInput, Button, Stack, Alert, Anchor, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuthStore } from '../store/authStore';

interface AuthModalProps {
  opened: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
  onShowForgotPassword?: () => void; // Add callback for forgot password
}

export function AuthModal({ opened, onClose, mode, onModeChange, onShowForgotPassword }: AuthModalProps) {
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 8 ? null : 'Password must be at least 8 characters'),
      passwordConfirmation: (value, values) =>
        mode === 'register' && value !== values.password ? 'Passwords do not match' : null,
      name: (value) => (mode === 'register' && !value.trim() ? 'Name is required' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setSubmitError(null);
    clearError();

    let success = false;

    if (mode === 'login') {
      success = await login(values.email, values.password);
    } else {
      success = await register(
        values.name,
        values.email,
        values.password,
        values.passwordConfirmation
      );
    }

    if (success) {
      onClose();
      form.reset();
    }
  };

  const handleModeChange = (newMode: 'login' | 'register') => {
    form.reset();
    setSubmitError(null);
    clearError();
    onModeChange(newMode);
  };

  const handleClose = () => {
    form.reset();
    setSubmitError(null);
    clearError();
    onClose();
  };

  const handleForgotPassword = () => {
    handleClose(); // Close current modal first
    onShowForgotPassword?.(); // Show forgot password modal
  };

  return (
    <Modal 
      opened={opened} 
      onClose={handleClose} 
      title={mode === 'login' ? 'Login' : 'Register'}
      centered
      size="sm"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {(error || submitError) && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {error || submitError}
            </Alert>
          )}

          {mode === 'register' && (
            <TextInput
              label="Name"
              placeholder="Enter your name"
              required
              {...form.getInputProps('name')}
            />
          )}

          <TextInput
            label="Email"
            placeholder="Enter your email"
            type="email"
            required
            {...form.getInputProps('email')}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            required
            {...form.getInputProps('password')}
          />

          {mode === 'register' && (
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              required
              {...form.getInputProps('passwordConfirmation')}
            />
          )}

          <Button 
            type="submit" 
            loading={isLoading}
            fullWidth
          >
            {mode === 'login' ? 'Login' : 'Register'}
          </Button>

          {mode === 'login' && (
            <Text size="sm" ta="center">
              <Anchor
                component="button"
                type="button"
                onClick={handleForgotPassword}
                size="sm"
              >
                Forgot your password?
              </Anchor>
            </Text>
          )}

          <div style={{ textAlign: 'center' }}>
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <Anchor
                  component="button"
                  type="button"
                  onClick={() => handleModeChange('register')}
                >
                  Register here
                </Anchor>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Anchor
                  component="button"
                  type="button"
                  onClick={() => handleModeChange('login')}
                >
                  Login here
                </Anchor>
              </>
            )}
          </div>
        </Stack>
      </form>
    </Modal>
  );
}