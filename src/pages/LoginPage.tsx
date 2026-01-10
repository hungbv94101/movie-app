import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Title, 
  TextInput, 
  PasswordInput,
  Button, 
  Stack, 
  Alert,
  Text,
  Anchor
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (!value.trim() ? 'Password is required' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    clearError();

    const success = await login(values.email, values.password);
    
    if (success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <Container size="xs" py="xl">
      <Paper shadow="xs" p="xl" radius="md">
        <Stack gap="lg">
          <div style={{ textAlign: 'center' }}>
            <Title order={2}>Welcome Back</Title>
            <Text size="sm" c="dimmed" mt="xs">
              Sign in to your account
            </Text>
          </div>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {error && (
                <Alert 
                  icon={<IconAlertCircle size="1rem" />} 
                  title="Login Failed" 
                  color="red"
                >
                  {error}
                </Alert>
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

              <Button 
                type="submit" 
                loading={isLoading}
                fullWidth
              >
                Sign In
              </Button>

              <Text size="sm" ta="center">
                <Anchor
                  component={Link}
                  to="/forgot-password"
                  size="sm"
                >
                  Forgot your password?
                </Anchor>
              </Text>

              <Text size="sm" ta="center" c="dimmed">
                Don't have an account?{' '}
                <Anchor
                  component={Link}
                  to="/register"
                  fw={500}
                >
                  Create account
                </Anchor>
              </Text>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}