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
  Alert,
  Avatar,
  Divider,
  Box
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, useEffect } from 'react';
import { 
  IconUser, 
  IconMail, 
  IconKey, 
  IconLogout,
  IconMailCheck,
  IconMailX,
  IconLock,
  IconCheck,
  IconAlertCircle,
  IconArrowLeft
} from '@tabler/icons-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, updateProfile, changePassword, logout, resendVerification, isLoading, error, clearError } = useAuthStore();
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('profile');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

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
      newPassword: (value) => {
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must contain at least one special character';
        return null;
      },
      newPasswordConfirmation: (value, values) =>
        value !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      profileForm.setValues({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

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
      setTimeout(() => setSuccess(null), 3000);
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
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleResendVerification = async () => {
    clearError();
    setSuccess(null);
    const isSuccess = await resendVerification();
    if (isSuccess) {
      setSuccess('Verification email sent successfully');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  if (!user) {
    return null;
  }

  const isEmailVerified = !!user.email_verified_at;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
      {/* Header - Same as HomePage */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Container size="xl" py="md">
          <Group justify="space-between" align="center">
            <Group align="center" gap="xl">
              <Title 
                order={1} 
                size="h2" 
                style={{ color: '#2c3e50', cursor: 'pointer' }}
                onClick={() => navigate('/')}
              >
                🎬 Movie
              </Title>
              
              <Group gap="xs">
                <Button 
                  variant="subtle" 
                  size="md"
                  onClick={() => navigate('/')}
                  style={{ fontWeight: 500 }}
                >
                  Home
                </Button>
                <Button 
                  variant="light" 
                  size="md"
                  leftSection={<IconUser size={18} />}
                  style={{ fontWeight: 500 }}
                >
                  Profile
                </Button>
              </Group>
            </Group>
            
            <Group gap="sm">
              <Text size="sm" fw={500} c="dimmed">
                {user.name}
              </Text>
              <Button variant="light" color="red" size="sm" onClick={logout}>
                Logout
              </Button>
            </Group>
          </Group>
        </Container>
      </div>

      {/* Main Content */}
      <Container size="md" py="xl">
        <Stack gap="lg">
          {/* Profile Summary */}
          <Group>
            <Avatar size="lg" radius="md" color="blue">
              <IconUser size={32} />
            </Avatar>
            <Box style={{ flex: 1 }}>
              <Text fw={600} size="lg" c="white">{user.name}</Text>
              <Group gap="xs">
                <Text size="sm" c="gray.3">{user.email}</Text>
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
            </Box>
          </Group>

          {/* Email Verification Alert */}
          {!isEmailVerified && (
            <Alert 
              icon={<IconAlertCircle size={16} />}
              title="Email not verified" 
              color="yellow"
            >
              <Group justify="space-between">
                <Text size="sm">Please verify your email to access all features</Text>
                <Button 
                  size="xs" 
                  variant="light" 
                  loading={isLoading}
                  onClick={handleResendVerification}
                >
                  Resend Email
                </Button>
              </Group>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert icon={<IconCheck size={16} />} title="Success" color="green">
              {success}
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
              {error}
            </Alert>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onChange={setActiveTab} defaultValue="profile">
            <Tabs.List>
              <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>
                Profile Information
              </Tabs.Tab>
              <Tabs.Tab value="password" leftSection={<IconKey size={16} />}>
                Change Password
              </Tabs.Tab>
            </Tabs.List>

            {/* Profile Tab */}
            <Tabs.Panel value="profile" pt="lg">
              <Paper shadow="sm" p="lg" radius="md" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
                <form onSubmit={profileForm.onSubmit(handleProfileSubmit)}>
                  <Stack gap="md">
                    <TextInput
                      label="Full Name"
                      placeholder="Enter your name"
                      leftSection={<IconUser size={16} />}
                      {...profileForm.getInputProps('name')}
                    />

                    <TextInput
                      label="Email Address"
                      placeholder="Enter your email"
                      leftSection={<IconMail size={16} />}
                      type="email"
                      {...profileForm.getInputProps('email')}
                    />

                    <Text size="sm" c="dimmed">
                      Member since: {new Date(user.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Text>

                    <Button 
                      type="submit" 
                      loading={isLoading}
                      leftSection={<IconCheck size={16} />}
                      fullWidth
                    >
                      Update Profile
                    </Button>
                  </Stack>
                </form>
              </Paper>
            </Tabs.Panel>

            {/* Password Tab */}
            <Tabs.Panel value="password" pt="lg">
              <Paper shadow="sm" p="lg" radius="md" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
                <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
                  <Stack gap="md">
                    <PasswordInput
                      label="Current Password"
                      placeholder="Enter current password"
                      leftSection={<IconLock size={16} />}
                      {...passwordForm.getInputProps('currentPassword')}
                    />

                    <PasswordInput
                      label="New Password"
                      placeholder="Enter new password"
                      leftSection={<IconKey size={16} />}
                      description="Must be at least 8 characters with uppercase, lowercase, and special character"
                      {...passwordForm.getInputProps('newPassword')}
                    />

                    <PasswordInput
                      label="Confirm New Password"
                      placeholder="Re-enter new password"
                      leftSection={<IconKey size={16} />}
                      {...passwordForm.getInputProps('newPasswordConfirmation')}
                    />

                    <Button 
                      type="submit" 
                      loading={isLoading}
                      leftSection={<IconCheck size={16} />}
                      fullWidth
                    >
                      Change Password
                    </Button>
                  </Stack>
                </form>
              </Paper>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>

      {/* Footer */}
      <div style={{
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        color: 'white',
        padding: '3rem 0',
        marginTop: '3rem'
      }}>
        <Container size="xl">
          <Group justify="space-between" align="center">
            <div>
              <Title order={3} size="h4" mb="sm" style={{ color: 'white' }}>
                🎬 Movie
              </Title>
              <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Discover amazing movies with advanced search and filtering
              </Text>
            </div>
            
            <div>
              <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Built with React, TypeScript, Mantine UI & Laravel
              </Text>
            </div>
          </Group>
        </Container>
      </div>
    </div>
  );
}