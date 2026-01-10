import { Center, Loader, Text } from '@mantine/core';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'md' 
}: LoadingSpinnerProps) {
  return (
    <Center style={{ minHeight: 200, flexDirection: 'column', gap: 16 }}>
      <Loader size={size} />
      <Text c="dimmed">{message}</Text>
    </Center>
  );
}