import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  Button, 
  Stack, 
  Group, 
  Badge,
  Tabs,
  TextInput,
  PasswordInput,
  Alert
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { 
  IconUser, 
  IconMail, 
  IconKey, 
  IconLogout,
  IconMailCheck,
  IconMailX,
  IconLock,
  IconCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import { useAuthStore } from '../store/authStore';

export function ProfilePage() {
  const { user, updateProfile, changePassword, logout, resendVerification, isLoading, error, clearError } = useAuthStore();
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('profile');

  // Profile form
  const profileForm = useForm({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
    validate: {
      name: (value) => (!value.trim() ? 'Name is required' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  // Password form
  const passwordForm = useForm({
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

  const handleProfileSubmit = async (values: typeof profileForm.values) => {
    clearError();
    setSuccess(null);

    // Only send changed fields
    const changes: { name?: string; email?: string } = {};
    if (values.name !== user?.name) {
      changes.name = values.name;
    }
    if (values.email !== user?.email) {
      changes.email = values.email;
    }

    if (Object.keys(changes).length === 0) {
      setSuccess('No changes to save');
      return;
    }

    const isSuccess = await updateProfile(changes);
    if (isSuccess) {
      setSuccess('Profile updated successfully');
    }
  };

  const handlePasswordSubmit = async (values: typeof passwordForm.values) => {
    clearError();
    setSuccess(null);

    const isSuccess = await changePassword(
      values.currentPassword,
      values.newPassword,
      values.newPasswordConfirmation
    );

    if (isSuccess) {
      passwordForm.reset();
      setSuccess('Password changed successfully');
    }
  };

  const handleResendVerification = async () => {
    await resendVerification();
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  const handleResendVerification = async () => {
    await resendVerification();
  };

  const isEmailVerified = !!user.email_verified_at;

  return (
    <Container size="sm" py="xl">
      <Paper shadow="xs" p="xl" radius="md">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between">
            <Title order={2}>My Profile</Title>
            <Button 
              variant="light" 
              color="red" 
              leftSection={<IconLogout size={16} />}
              onClick={logout}
            >
              Sign Out
            </Button>
          </Group>

          <Divider />

          {/* Profile Info */}
          <Stack gap="md">
            <Group>
              <Avatar size="lg" radius="md">
                <IconUser size={32} />
              </Avatar>
              <div>
                <Text fw={600} size="lg">{user.name}</Text>
                <Group gap="xs">
                  <Text size="sm" c="dimmed">{user.email}</Text>
                  {isEmailVerified ? (
                    <Badge color="green" size="sm" leftSection={<IconMailCheck size={12} />}>
                      Verified
                    </Badge>
                  ) : (
                    <Badge color="red" size="sm" leftSection={<IconMailX size={12} />}>
                      Not Verified
                    </Badge>
                  )}
                </Group>
              </div>
            </Group>

            {!isEmailVerified && (
              <Paper p="sm" bg="yellow.0" radius="sm">
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>Email not verified</Text>
                    <Text size="xs" c="dimmed">Please verify your email to access all features</Text>
                  </div>
                  <Button 
                    size="xs" 
                    variant="light" 
                    loading={isLoading}
                    onClick={handleResendVerification}
                  >
                    Resend
                  </Button>
                </Group>
              </Paper>
            )}
          </Stack>

          <Divider />

          {/* Account Actions */}
          <Stack gap="md">
            <Title order={4}>Account Settings</Title>
            
            <Group grow>
              <Button 
                variant="light" 
                leftSection={<IconUser size={16} />}
                onClick={() => setUpdateProfileOpened(true)}
              >
                Edit Profile
              </Button>
              
              <Button 
                variant="light" 
                leftSection={<IconKey size={16} />}
                onClick={() => setChangePasswordOpened(true)}
              >
                Change Password
              </Button>
            </Group>
          </Stack>

          <Divider />

          {/* Account Info */}
          <Stack gap="xs">
            <Title order={4}>Account Information</Title>
            <Text size="sm" c="dimmed">
              Member since: {new Date(user.created_at).toLocaleDateString()}
            </Text>
            <Text size="sm" c="dimmed">
              Last updated: {new Date(user.updated_at).toLocaleDateString()}
            </Text>
          </Stack>
        </Stack>
      </Paper>

      {/* Modals */}
      <UpdateProfileModal 
        opened={updateProfileOpened}
        onClose={() => setUpdateProfileOpened(false)}
      />
      
      <ChangePasswordModal 
        opened={changePasswordOpened}
        onClose={() => setChangePasswordOpened(false)}
      />
    </Container>
  );
}