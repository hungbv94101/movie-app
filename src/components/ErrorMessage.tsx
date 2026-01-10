import { Alert, Button, Center } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <Center style={{ minHeight: 200 }}>
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error"
        color="red"
        style={{ maxWidth: 400 }}
      >
        {message}
        {onRetry && (
          <Button
            variant="light"
            color="red"
            size="sm"
            leftSection={<IconRefresh size={16} />}
            onClick={onRetry}
            mt="md"
          >
            Try Again
          </Button>
        )}
      </Alert>
    </Center>
  );
}