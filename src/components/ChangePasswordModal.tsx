import { Modal, PasswordInput, Button, Stack, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useAuthStore } from '../store/authStore';

interface ChangePasswordModalProps {
  opened: boolean;
  onClose: () => void;
  forced?: boolean; // When true, user cannot close modal
  onSuccess?: () => void; // Called after successful password change
}

export function ChangePasswordModal({ opened, onClose, forced = false, onSuccess }: ChangePasswordModalProps) {
  const { changePassword, isLoading, error, clearError } = useAuthStore();
  const [success, setSuccess] = useState(false);

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
      form.reset();
      setTimeout(() => {
        setSuccess(false);
        onClose();
        onSuccess?.();
      }, 1500);
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
      onClose={forced ? () => {} : handleClose} 
      title={forced ? "Password Change Required" : "Change Password"}
      centered
      size="sm"
      closeOnClickOutside={!forced}
      closeOnEscape={!forced}
      withCloseButton={!forced}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {success && (
            <Alert 
              icon={<IconCheck size="1rem" />} 
              title="Password changed!" 
              color="green"
            >
              Your password has been updated successfully.
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
            label="Current Password"
            placeholder="Enter current password"
            required
            {...form.getInputProps('currentPassword')}
          />

          <PasswordInput
            label="New Password"
            placeholder="Enter new password (min 8 characters)"
            required
            {...form.getInputProps('newPassword')}
          />

          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm new password"
            required
            {...form.getInputProps('newPasswordConfirmation')}
          />

          <Button 
            type="submit" 
            loading={isLoading}
            fullWidth
            disabled={success}
          >
            {success ? 'Password Changed' : 'Change Password'}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}