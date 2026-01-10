import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Title, 
  PasswordInput, 
  Button, 
  Stack, 
  Alert,
  Text
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useAuthStore } from '../store/authStore';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const form = useForm({
    initialValues: {
      password: '',
      passwordConfirmation: '',
    },
    validate: {
      password: (value) => (value.length >= 8 ? null : 'Password must be at least 8 characters'),
      passwordConfirmation: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null,
    },
  });

  useEffect(() => {
    // Clear any existing errors when component mounts
    clearError();
  }, [clearError]);

  useEffect(() => {
    // Redirect to home if missing token or email
    if (!token || !email) {
      navigate('/', { replace: true });
    }
  }, [token, email, navigate]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!token || !email) return;

    clearError();
    setSuccess(false);

    const isSuccess = await resetPassword(
      token,
      email,
      values.password,
      values.passwordConfirmation
    );
    
    if (isSuccess) {
      setSuccess(true);
      form.reset();
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    }
  };

  if (!token || !email) {
    return null; // Will redirect via useEffect
  }

  return (
    <Container size="xs" py="xl">
      <Paper shadow="xs" p="xl" radius="md">
        <Stack gap="lg">
          <div style={{ textAlign: 'center' }}>
            <Title order={2}>Reset Your Password</Title>
            <Text size="sm" c="dimmed" mt="xs">
              Enter your new password below
            </Text>
          </div>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {success && (
                <Alert 
                  icon={<IconCheck size="1rem" />} 
                  title="Password reset successful!" 
                  color="green"
                >
                  Your password has been updated. Redirecting to login...
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

              <PasswordInput
                label="New Password"
                placeholder="Enter new password (min 8 characters)"
                required
                {...form.getInputProps('password')}
              />

              <PasswordInput
                label="Confirm New Password"
                placeholder="Confirm new password"
                required
                {...form.getInputProps('passwordConfirmation')}
              />

              <Button 
                type="submit" 
                loading={isLoading}
                fullWidth
                disabled={success}
              >
                {success ? 'Password Reset!' : 'Reset Password'}
              </Button>

              <Text size="sm" ta="center" c="dimmed">
                Remember your password?{' '}
                <Button 
                  variant="subtle" 
                  size="compact-sm"
                  onClick={() => navigate('/login')}
                >
                  Back to login
                </Button>
              </Text>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}