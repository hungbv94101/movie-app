import React from 'react';
import { Modal, TextInput, Button, Stack, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useAuthStore } from '../store/authStore';

interface UpdateProfileModalProps {
  opened: boolean;
  onClose: () => void;
}

export function UpdateProfileModal({ opened, onClose }: UpdateProfileModalProps) {
  const { user, updateProfile, isLoading, error, clearError } = useAuthStore();
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
    validate: {
      name: (value) => (!value.trim() ? 'Name is required' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  // Update form when user changes
  React.useEffect(() => {
    if (user) {
      form.setValues({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleSubmit = async (values: typeof form.values) => {
    clearError();
    setSuccess(false);

    // Only send changed fields
    const changes: { name?: string; email?: string } = {};
    if (values.name !== user?.name) {
      changes.name = values.name;
    }
    if (values.email !== user?.email) {
      changes.email = values.email;
    }

    if (Object.keys(changes).length === 0) {
      setSuccess(true);
      setTimeout(() => handleClose(), 1500);
      return;
    }

    const isSuccess = await updateProfile(changes);
    
    if (isSuccess) {
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    clearError();
    if (user) {
      form.setValues({
        name: user.name,
        email: user.email,
      });
    }
    onClose();
  };

  return (
    <Modal 
      opened={opened} 
      onClose={handleClose} 
      title="Update Profile"
      size="sm"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {success && (
            <Alert 
              icon={<IconCheck size="1rem" />} 
              title="Profile updated!" 
              color="green"
            >
              Your profile has been updated successfully.
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
            label="Name"
            placeholder="Enter your name"
            required
            {...form.getInputProps('name')}
          />

          <TextInput
            label="Email"
            placeholder="Enter your email"
            required
            {...form.getInputProps('email')}
          />

          <Button 
            type="submit" 
            loading={isLoading}
            fullWidth
            disabled={success}
          >
            {success ? 'Profile Updated' : 'Update Profile'}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}