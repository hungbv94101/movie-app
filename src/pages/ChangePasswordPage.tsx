import { Container, Paper, Title, Stack, PasswordInput, Button, Alert, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';

export function ChangePasswordPage() {
  const { changePassword, isLoading, error, clearError } = useAuthStore();
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      newPasswordConfirmation: '',
    },
    validate: {
      currentPassword: (value) => (!value.trim() ? 'Current password is required' : null),
      newPassword: (value) => (value.length >= 8 ? null : 'Password must be at least 8 characters'),
      newPasswordConfirmation: (value, values) =>
        value !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    clearError();
    setSuccess(false);
    const isSuccess = await changePassword(
      values.currentPassword,
      values.newPassword,
      values.newPasswordConfirmation
    );
    if (isSuccess) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1200);
    }
  };

  return (
    <Container size="xs" py="xl">
      <Paper p="xl" withBorder>
        <Title order={3} ta="center" mb="md">Change Your Password</Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {success && (
              <Alert icon={<IconCheck size={16} />} color="green">
                Password changed successfully! Redirecting to home...
              </Alert>
            )}
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red">
                {error}
              </Alert>
            )}
            <Text size="sm" color="dimmed">
              You are required to change your password before continuing.
            </Text>
            <PasswordInput
              label="Current Password"
              placeholder="Enter your temporary password"
              required
              {...form.getInputProps('currentPassword')}
            />
            <PasswordInput
              label="New Password"
              placeholder="Enter your new password"
              required
              {...form.getInputProps('newPassword')}
            />
            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm your new password"
              required
              {...form.getInputProps('newPasswordConfirmation')}
            />
            <Button type="submit" loading={isLoading} fullWidth>
              Change Password
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
