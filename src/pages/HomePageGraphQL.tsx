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
  Button,
  Select,
  TextInput
} from '@mantine/core';
import { IconLogin, IconX, IconArchive, IconTrash, IconUser } from '@tabler/icons-react';
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
import { ActionIcon } from '@mantine/core';
import { useMovieGraphQLStore, useAuthStore } from '../store';
import type { Movie } from '../types';

export function HomePageGraphQL() {
  const navigate = useNavigate();
  const [authModalOpened, setAuthModalOpened] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [forgotPasswordOpened, setForgotPasswordOpened] = useState(false);
  // Always show filters - removed showFilters state
  
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
    filters,
    favoriteIds,
    fetchMovies,
    searchMovies,
    clearSearch,
    setFilters,
    resetFilters,
    toggleFavorite,
    isFavorited,
    loadFavoritesFromStorage,
  } = useMovieGraphQLStore();

  // Local state for favorites UI
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteSearch, setFavoriteSearch] = useState('');

  // Load favorites from localStorage on mount
  useEffect(() => {
    loadFavoritesFromStorage();
  }, [loadFavoritesFromStorage]);

  // Load favorites and initial data on component mount
  useEffect(() => {
    if (!hasSearched && movies.length === 0) {
      fetchMovies(1);
    }
  }, [fetchMovies, hasSearched, movies.length]);

  // Redirect to /change-password page if needsPasswordChange is true after login
  useEffect(() => {
    if (needsPasswordChange) {
      navigate('/change-password');
    }
  }, [needsPasswordChange, navigate]);

  const displayMovies = hasSearched ? searchResults : movies;

  // Lấy danh sách phim đã lưu từ all movies (ưu tiên movies, nếu rỗng thì lấy searchResults)
  const allMovies = movies.length > 0 ? movies : searchResults;
  const favoriteMovies = allMovies.filter(m => m.imdbID && isFavorited(m.imdbID));
  const filteredFavoriteMovies = favoriteSearch.trim()
    ? favoriteMovies.filter(m =>
        m.title?.toLowerCase().includes(favoriteSearch.trim().toLowerCase())
      )
    : favoriteMovies;
  
  const handleSearch = (query: string) => {
    // Always call searchMovies - it handles empty queries properly
    searchMovies(query, 1);
  };

  const handleClearSearch = () => {
    // Call searchMovies with empty query to trigger "show all movies" logic
    searchMovies('', 1);
    resetFilters();
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

  const handleFavoriteClick = (imdbID: string) => {
    if (!user) {
      setAuthMode('login');
      setAuthModalOpened(true);
      return;
    }

    // Toggle favorite using imdbID
    toggleFavorite(imdbID);
  };

  const handleRetry = () => {
    if (hasSearched && searchQuery) {
      searchMovies(searchQuery, currentPage);
    } else {
      fetchMovies(currentPage);
    }
  };

  const handleFilterChange = (filterType: keyof typeof filters, value: string | null) => {
    setFilters({ [filterType]: value || undefined });
    
    // Re-run search or fetch with new filters
    if (hasSearched && searchQuery) {
      searchMovies(searchQuery, 1);
    } else {
      fetchMovies(1);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
      {/* Header */}
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
              
              {user && (
                <Group gap="xs">
                  <Button 
                    variant="light" 
                    size="md"
                    onClick={() => navigate('/')}
                    style={{ fontWeight: 500 }}
                  >
                    Home
                  </Button>
                  <Button 
                    variant="subtle" 
                    size="md"
                    leftSection={<IconUser size={18} />}
                    onClick={() => navigate('/profile')}
                    style={{ fontWeight: 500 }}
                  >
                    Profile
                  </Button>
                </Group>
              )}
            </Group>
            
            <Group>
              {user ? (
                <Group gap="sm">
                  <Text size="sm" fw={500} c="dimmed">
                    {user.name}
                  </Text>
                  <Button variant="light" color="red" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </Group>
              ) : (
                <Button 
                  leftSection={<IconLogin size={16} />}
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
      </div>

      {/* Main Content */}
      <Container size="xl" py="lg">
        <div style={{ marginBottom: '2rem' }}>          
          {/* Combined Search & Filters Section */}
          <Container size="xl">
            <Group justify="space-between" align="end" mb="md">
              {/* Filters on the left */}
              <Group gap="md">
                <Select
                  placeholder="Filter by Genre"
                  value={filters.genre || ''}
                  onChange={(value) => handleFilterChange('genre', value)}
                  data={[
                    { value: '', label: 'All Genres' },
                    { value: 'Action', label: 'Action' },
                    { value: 'Comedy', label: 'Comedy' },
                    { value: 'Drama', label: 'Drama' },
                    { value: 'Horror', label: 'Horror' },
                    { value: 'Romance', label: 'Romance' },
                    { value: 'Sci-Fi', label: 'Sci-Fi' },
                    { value: 'Thriller', label: 'Thriller' },
                  ]}
                  clearable
                  w={150}
                />
                
                <TextInput
                  placeholder="Year (e.g., 2023)"
                  value={filters.year || ''}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  w={120}
                />
                
                <Select
                  placeholder="Rating"
                  value={filters.rating || ''}
                  onChange={(value) => handleFilterChange('rating', value)}
                  data={[
                    { value: '', label: 'All Ratings' },
                    { value: 'G', label: 'G' },
                    { value: 'PG', label: 'PG' },
                    { value: 'PG-13', label: 'PG-13' },
                    { value: 'R', label: 'R' },
                    { value: 'NC-17', label: 'NC-17' },
                  ]}
                  clearable
                  w={120}
                />
                
                <Select
                  placeholder="Sort By"
                  value={filters.sortBy}
                  onChange={(value) => handleFilterChange('sortBy', value || 'created_at')}
                  data={[
                    { value: 'relevance', label: 'Relevance' },
                    { value: 'title', label: 'Title' },
                    { value: 'year', label: 'Year' },
                    { value: 'rating', label: 'Rating' },
                    { value: 'favorites', label: 'Popularity' },
                    { value: 'created_at', label: 'Date Added' },
                  ]}
                  w={120}
                />
                
                <Select
                  placeholder="Order"
                  value={filters.sortOrder}
                  onChange={(value) => handleFilterChange('sortOrder', value || 'desc')}
                  data={[
                    { value: 'asc', label: 'Ascending' },
                    { value: 'desc', label: 'Descending' },
                  ]}
                  w={120}
                />

                {/* Show Saved Movies button filter */}
                <Button
                  variant={showFavorites ? 'filled' : 'outline'}
                  color={showFavorites ? 'blue' : 'gray'}
                  onClick={() => setShowFavorites(v => !v)}
                  style={{backgroundColor: "white", color: "black" }}
                >
                  {showFavorites ? 'Show All Movies' : 'Show Saved Movies'}
                </Button>
              </Group>

              {/* Search on the right */}
              <Group gap="sm">
                <SearchBar
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                  value={searchQuery}
                  placeholder="Search movies: titles, actors, directors, genres..."
                />
                {(filters.genre || filters.year || filters.rating) && (
                  <Button
                    variant="subtle"
                    color="red"
                    leftSection={<IconX size={16} />}
                    onClick={resetFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </Group>
            </Group>
          </Container>
        </div>

        {/* Results Info */}
        {hasSearched && (
          <Group justify="space-between" mb="lg">
            <Text size="lg" fw={500}>
              Search Results for: "{searchQuery}" {filters.genre && `| Genre: ${filters.genre}`}
            </Text>
            <Text size="sm" c="dimmed">
              {searchResults.length} movies found
            </Text>
          </Group>
        )}

        {!hasSearched && (
          <Group justify="space-between" mb="lg">
            <Title order={2} size="h3">
              Popular Movies {filters.genre && `(${filters.genre})`}
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

        {/* Movies Grid hoặc Favorites Grid */}
        {!isLoading && !error && (
          <div>
            <SimpleGrid
              cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
              spacing="lg"
              verticalSpacing="lg"
            >
              {(showFavorites ? filteredFavoriteMovies : displayMovies).map((movie) => {
                const isFavorite = movie.imdbID && isFavorited(movie.imdbID);
                return (
                  <div key={movie.id || movie.imdbID || `movie-${Math.random()}`} style={{ position: 'relative' }}>
                    <MovieCard
                      movie={movie}
                      onMovieClick={handleMovieClick}
                      onFavoriteClick={handleFavoriteClick}
                      showAuthModal={() => {
                        setAuthMode('login');
                        setAuthModalOpened(true);
                      }}
                    />
                    {/* Favorite Icon: Only show if user is logged in and movie has imdbID */}
                    {user && movie.imdbID && (
                      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
                        <ActionIcon
                          variant={isFavorite ? 'filled' : 'filled'}
                          color={isFavorite ? 'green' : 'blue'}
                          size="lg"
                          onClick={() => movie.imdbID && toggleFavorite(movie.imdbID)}
                          aria-label={isFavorite ? 'Remove from favorites' : 'Save as favorite'}
                        >
                          {isFavorite ? <IconTrash size={22} /> : <IconArchive size={22} />}
                        </ActionIcon>
                      </div>
                    )}
                  </div>
                );
              })}
            </SimpleGrid>

            {/* Pagination chỉ cho chế độ xem tất cả phim */}
            {!showFavorites && (
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && (
          <>
            {showFavorites ? (
              filteredFavoriteMovies.length === 0 && (
                <Center style={{ minHeight: 200 }}>
                  <div style={{ textAlign: 'center' }}>
                    <Text size="lg" mb="md">
                      No saved movies found
                    </Text>
                    <Text size="sm" c="dimmed">
                      Save a movie or try a different keyword
                    </Text>
                  </div>
                </Center>
              )
            ) : (
              (displayMovies.length === 0 && hasSearched) ? (
                <Center style={{ minHeight: 200 }}>
                  <div style={{ textAlign: 'center' }}>
                    <Text size="lg" mb="md">
                      No movies found for "{searchQuery}"
                    </Text>
                    <Text size="sm" c="dimmed">
                      Try searching with different keywords or adjust your filters
                    </Text>
                  </div>
                </Center>
              ) : (
                (movies.length === 0 && !hasSearched) && (
                  <Center style={{ minHeight: 200 }}>
                    <div style={{ textAlign: 'center' }}>
                      <Text size="lg" mb="md">
                        No movies available
                      </Text>
                      <Text size="sm" c="dimmed">
                        Search for movies to get started
                      </Text>
                    </div>
                  </Center>
                )
              )
            )}
          </>
        )}
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

      <Space h="xl" />

      {/* Auth Modal */}
      <AuthModal
        opened={authModalOpened}
        onClose={() => setAuthModalOpened(false)}
        mode={authMode}
        onModeChange={(newMode) => setAuthMode(newMode)}
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