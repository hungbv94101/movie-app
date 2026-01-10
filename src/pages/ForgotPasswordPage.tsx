import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Title, 
  TextInput, 
  Button, 
  Stack, 
  Alert,
  Text,
  Anchor
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useAuthStore } from '../store/authStore';

export function ForgotPasswordPage() {
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

  return (
    <Container size="xs" py="xl">
      <Paper shadow="xs" p="xl" radius="md">
        <Stack gap="lg">
          <div style={{ textAlign: 'center' }}>
            <Title order={2}>Reset Password</Title>
            <Text size="sm" c="dimmed" mt="xs">
              Enter your email address and we'll send you a link to reset your password
            </Text>
          </div>

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

              <TextInput
                label="Email"
                placeholder="Enter your email address"
                type="email"
                required
                {...form.getInputProps('email')}
              />

              <Button 
                type="submit" 
                loading={isLoading}
                fullWidth
                disabled={success}
              >
                {success ? 'Email Sent' : 'Send Reset Link'}
              </Button>

              <Text size="sm" ta="center" c="dimmed">
                Remember your password?{' '}
                <Anchor
                  component={Link}
                  to="/login"
                  fw={500}
                >
                  Back to login
                </Anchor>
              </Text>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}