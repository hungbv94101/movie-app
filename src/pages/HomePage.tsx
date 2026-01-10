import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Title, 
  Group, 
  SimpleGrid, 
  Text, 
  Space,
  Center,
  Button
} from '@mantine/core';
import { IconLogin } from '@tabler/icons-react';
import { 
  MovieCard, 
  SearchBar, 
  LoadingSpinner, 
  ErrorMessage, 
  Pagination,
  AuthModal,
  ForgotPasswordModal,
  ChangePasswordModal
} from '../components';
import { useMovieStore, useAuthStore } from '../store';
import type { Movie } from '../types';

export function HomePage() {
  const navigate = useNavigate();
  const [authModalOpened, setAuthModalOpened] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [forgotPasswordOpened, setForgotPasswordOpened] = useState(false);
  
  const { user, logout, needsPasswordChange } = useAuthStore();
  const {
    movies,
    searchResults,
    isLoading,
    error,
    searchQuery,
    hasSearched,
    currentPage,
    totalPages,
    fetchMovies,
    searchMovies,
    clearSearch,
    loadFavoritesFromStorage,
  } = useMovieStore();

  // Load favorites and initial data on component mount
  useEffect(() => {
    loadFavoritesFromStorage();
    if (!hasSearched && movies.length === 0) {
      fetchMovies(1);
    }
  }, [loadFavoritesFromStorage, fetchMovies, hasSearched, movies.length]);

  const displayMovies = hasSearched ? searchResults : movies;
  
  const handleSearch = (query: string) => {
    if (query.trim()) {
      searchMovies(query, 1);
    } else {
      // Clear search and return to default movies list
      clearSearch();
    }
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  const handlePageChange = (page: number) => {
    if (hasSearched && searchQuery) {
      searchMovies(searchQuery, page);
    } else {
      fetchMovies(page);
    }
  };

  const handleMovieClick = (movie: Movie) => {
    // Check if user is logged in for detail view
    if (!user) {
      setAuthMode('login');
      setAuthModalOpened(true);
      return;
    }

    // If it's a movie from database (has id), navigate to detail page
    if (movie.id) {
      navigate(`/movies/${movie.id}`);
    } 
    // If it's a search result (has imdbID but no id), navigate to external detail
    else if (movie.imdbID) {
      navigate(`/movies/detail/${movie.imdbID}`);
    }
  };

  const handleFavoriteClick = (movieId: string) => {
    // Check if user is logged in for favorites
    if (!user) {
      setAuthMode('login');
      setAuthModalOpened(true);
      return;
    }

    // Handle favorite toggle logic here (will be implemented in MovieCard)
  };

  const handleRetry = () => {
    if (hasSearched && searchQuery) {
      searchMovies(searchQuery, currentPage);
    } else {
      fetchMovies(currentPage);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#b3d9ff' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e9ecef',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Container size="xl" py="md">
          <Group justify="space-between">
            <Title order={1} size="h2" c="dark">
              🎬 Movie
            </Title>
            
            {/* Auth buttons */}
            <Group>
              {user ? (
                <Group gap="md">
                  <Text size="sm" c="dimmed">Welcome, {user.name}</Text>
                  <Button 
                    variant="outline" 
                    color="red"
                    size="sm"
                    onClick={() => {
                      logout();
                      clearSearch();
                    }}
                  >
                    Logout
                  </Button>
                </Group>
              ) : (
                <Button 
                  leftSection={<IconLogin size={16} />}
                  variant="filled"
                  size="sm"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthModalOpened(true);
                  }}
                >
                  Login
                </Button>
              )}
            </Group>
          </Group>
        </Container>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, backgroundColor: '#b3d9ff', minHeight: '100vh' }}>
        <Container size="xl" py="lg">
          {/* Search Section */}
          <div style={{ marginBottom: '2rem' }}>
            <Container size="md">
              <SearchBar
                onSearch={handleSearch}
                onClear={handleClearSearch}
                value={searchQuery}
                placeholder="Search movies: titles, actors, directors, genres..."
              />
            </Container>
          </div>

          {/* Results Info */}
          {hasSearched && (
            <Group justify="space-between" mb="lg">
              <Text size="lg" fw={500}>
                Search Results for: "{searchQuery}"
              </Text>
              <Text size="sm" c="dimmed">
                {searchResults.length} movies found
              </Text>
            </Group>
          )}

          {!hasSearched && (
            <Group justify="space-between" mb="lg">
              <Title order={2} size="h3">
                Popular Movies
              </Title>
              <Text size="sm" c="dimmed">
                {movies.length} movies
              </Text>
            </Group>
          )}

          {/* Loading State */}
          {isLoading && (
            <LoadingSpinner 
              message={hasSearched ? 'Searching movies...' : 'Loading movies...'}
            />
          )}

          {/* Error State */}
          {error && !isLoading && (
            <ErrorMessage 
              message={error}
              onRetry={handleRetry}
            />
          )}

          {/* Movies Grid */}
          {!isLoading && !error && displayMovies.length > 0 && (
            <div>
            <SimpleGrid
              cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
              spacing="lg"
              verticalSpacing="lg"
            >
                {displayMovies.map((movie) => (
                  <MovieCard
                    key={movie.id || movie.imdbID || `movie-${Math.random()}`}
                    movie={movie}
                    onMovieClick={handleMovieClick}
                    onFavoriteClick={handleFavoriteClick}
                    showAuthModal={() => {
                      setAuthMode('login');
                      setAuthModalOpened(true);
                    }}
                  />
                ))}
              </SimpleGrid>

              {/* Pagination */}
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && displayMovies.length === 0 && hasSearched && (
            <Center style={{ minHeight: 200 }}>
              <div style={{ textAlign: 'center' }}>
                <Text size="lg" mb="md">
                  No movies found for "{searchQuery}"
                </Text>
                <Text size="sm" c="dimmed">
                  Try searching with different keywords
                </Text>
              </div>
            </Center>
          )}

          {/* No Movies at all */}
          {!isLoading && !error && movies.length === 0 && !hasSearched && (
            <Center style={{ minHeight: 200 }}>
              <div style={{ textAlign: 'center' }}>
                <Text size="lg" mb="md">
                  No movies available
                </Text>
                <Text size="sm" c="dimmed">
                  Please check your API connection
                </Text>
              </div>
            </Center>
          )}
        </Container>
      </main>
      
      {/* Footer */}
      <footer style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderTop: 'none',
        marginTop: 'auto',
        color: 'white'
      }}>
        <Container size="xl" py="xl">
          <div style={{ textAlign: 'center' }}>
            <Text size="lg" fw={600} mb="sm" style={{ color: 'white' }}>
              🎬 Movie
            </Text>
            <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              © 2026 Movie. Built with React & Laravel
            </Text>
          </div>
        </Container>
      </footer>
      
      {/* Auth Modal */}
      <AuthModal
        opened={authModalOpened}
        onClose={() => setAuthModalOpened(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onShowForgotPassword={() => setForgotPasswordOpened(true)}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        opened={forgotPasswordOpened}
        onClose={() => setForgotPasswordOpened(false)}
      />

      {/* Change Password Modal - Shows when user logged in with temporary password */}
      <ChangePasswordModal 
        opened={needsPasswordChange}
        onClose={() => {}}
        forced={true}
        onSuccess={() => {
          // After successful password change, user can continue using the app
          console.log('Password changed successfully, user can now use the app');
        }}
      />
    </div>
  );
}