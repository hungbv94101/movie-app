import { TextInput, ActionIcon } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  value?: string;
}

export function SearchBar({ 
  onSearch, 
  onClear, 
  placeholder = 'Search movies...', 
  value = '' 
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(value);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery.trim());
  };

  const handleClear = () => {
    setSearchQuery('');
    onClear?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <TextInput
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        leftSection={<IconSearch size={16} />}
        rightSection={
          searchQuery && (
            <ActionIcon
              variant="transparent"
              color="gray"
              onClick={handleClear}
            >
              <IconX size={16} />
            </ActionIcon>
          )
        }
        size="md"
        radius="md"
        style={{ maxWidth: 400, width: '100%' }}
      />
    </form>
  );
}