import { Modal, TextInput, Button, Stack, Alert, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useAuthStore } from '../store/authStore';

interface ForgotPasswordModalProps {
  opened: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ opened, onClose }: ForgotPasswordModalProps) {
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    clearError();
    setSuccess(false);

    const isSuccess = await forgotPassword(values.email);
    
    if (isSuccess) {
      setSuccess(true);
      form.reset();
    }
  };

  const handleClose = () => {
    setSuccess(false);
    clearError();
    form.reset();
    onClose();
  };

  return (
    <Modal 
      opened={opened} 
      onClose={handleClose} 
      title="Reset Password"
      centered
      size="sm"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {success && (
            <Alert 
              icon={<IconCheck size="1rem" />} 
              title="Email sent!" 
              color="green"
            >
              Please check your email for password reset instructions.
            </Alert>
          )}

          {error && (
            <Alert 
              icon={<IconAlertCircle size="1rem" />} 
              title="Error" 
              color="red"
            >
              {error}
            </Alert>
          )}

          {!success && (
            <>
              <Text size="sm" color="dimmed">
                Enter your email address and we'll send you a link to reset your password.
              </Text>

              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                {...form.getInputProps('email')}
              />

              <Button 
                type="submit" 
                loading={isLoading}
                fullWidth
              >
                Send Reset Link
              </Button>
            </>
          )}
        </Stack>
      </form>
    </Modal>
  );
}