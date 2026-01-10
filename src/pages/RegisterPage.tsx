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

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    },
    validate: {
      name: (value) => (!value.trim() ? 'Name is required' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 8 ? null : 'Password must be at least 8 characters'),
      passwordConfirmation: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    clearError();

    const success = await register(
      values.name,
      values.email,
      values.password,
      values.passwordConfirmation
    );
    
    if (success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <Container size="xs" py="xl">
      <Paper shadow="xs" p="xl" radius="md">
        <Stack gap="lg">
          <div style={{ textAlign: 'center' }}>
            <Title order={2}>Create Account</Title>
            <Text size="sm" c="dimmed" mt="xs">
              Join us today
            </Text>
          </div>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {error && (
                <Alert 
                  icon={<IconAlertCircle size="1rem" />} 
                  title="Registration Failed" 
                  color="red"
                >
                  {error}
                </Alert>
              )}

              <TextInput
                label="Name"
                placeholder="Enter your name"
                required
                {...form.getInputProps('name')}
              />

              <TextInput
                label="Email"
                placeholder="Enter your email"
                type="email"
                required
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter password (min 8 characters)"
                required
                {...form.getInputProps('password')}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                required
                {...form.getInputProps('passwordConfirmation')}
              />

              <Button 
                type="submit" 
                loading={isLoading}
                fullWidth
              >
                Create Account
              </Button>

              <Text size="sm" ta="center" c="dimmed">
                Already have an account?{' '}
                <Anchor
                  component={Link}
                  to="/login"
                  fw={500}
                >
                  Sign in
                </Anchor>
              </Text>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}