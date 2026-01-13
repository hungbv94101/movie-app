import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Group,
  Image,
  Text,
  Badge,
  Button,
  ActionIcon,
  Grid,
  Card,
  Title,
  Stack,
  Divider,
  Tooltip,
  Flex
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconHeart, 
  IconHeartFilled,
  IconStar,
  IconCalendar,
  IconClock,
  IconUsers,
  IconTrophy,
  IconUser,
  IconLogout,
  IconLogin
} from '@tabler/icons-react';
import { LoadingSpinner, ErrorMessage } from '../components';
import { useMovieGraphQLStore, useAuthStore } from '../store';

export function MovieDetailPage() {
  const { id, imdbID } = useParams<{ id?: string; imdbID?: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    currentMovie,
    isLoading,
    error,
    fetchMovieById,
    toggleFavorite,
    isFavorited,
  } = useMovieGraphQLStore();

  useEffect(() => {
    const movieId = id || imdbID;
    if (movieId) {
      fetchMovieById(movieId);
    }
  }, [id, imdbID, fetchMovieById]);

  if (isLoading) {
    return <LoadingSpinner message="Loading movie details..." />;
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <ErrorMessage 
          message={error}
          onRetry={() => id && fetchMovieById(id)}
        />
      </Container>
    );
  }
  
  if (!currentMovie) {
    return (
      <Container size="xl" py="xl">
        <ErrorMessage message="Movie not found" />
      </Container>
    );
  }

  const isFavorite = currentMovie?.imdbID ? isFavorited(currentMovie.imdbID) : false;

  const handleBack = () => {
    navigate('/');
  };

  const handleFavoriteClick = () => {
    if (currentMovie?.imdbID) {
      toggleFavorite(currentMovie.imdbID);
    }
  };

  const getInfoItems = () => [
    { icon: IconCalendar, label: 'Year', value: currentMovie.year },
    { icon: IconClock, label: 'Runtime', value: currentMovie.runtime },
    { icon: IconUsers, label: 'Rated', value: currentMovie.rated },
    { icon: IconTrophy, label: 'Awards', value: currentMovie.awards },
  ].filter(item => item.value && item.value !== 'N/A');

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
              
              {user && (
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
                  onClick={() => navigate('/')}
                >
                  Login
                </Button>
              )}
            </Group>
          </Group>
        </Container>
      </div>

      {/* Main Content */}
      <Container size="xl" py="xl">
        {/* Back Button */}
        <Group justify="flex-start" mb="xl">
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            Back to Movies
          </Button>
        </Group>

      <Grid>
        {/* Movie Poster */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card padding="lg" radius="md" withBorder shadow="md" style={{ background: 'white' }}>
            <Image
              src={currentMovie.poster !== 'N/A' ? currentMovie.poster : undefined}
              alt={currentMovie.title}
              fallbackSrc="/placeholder-poster-large.svg"
              radius="md"
            />
          </Card>
        </Grid.Col>

        {/* Movie Details */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card padding="xl" radius="md" withBorder shadow="md" style={{ background: 'white' }}>
            <Stack gap="lg">
              {/* Title and Rating */}
              <div>
                <Title order={1} size="h2" mb="xs" c="dark">
                  {currentMovie.title}
                </Title>
                {currentMovie.imdb_rating !== 'N/A' && (
                  <Group gap="xs" mb="md">
                    <IconStar size={24} color="gold" fill="gold" />
                    <Text size="xl" fw={700} c="dark">
                      {currentMovie.imdb_rating}/10
                    </Text>
                    <Text size="md" c="dimmed" fw={500}>
                      ({currentMovie.imdb_votes} votes)
                    </Text>
                  </Group>
                )}

                {/* Badges */}
                <Flex gap="xs" wrap="wrap" mb="md">
                  {currentMovie.genre !== 'N/A' && currentMovie.genre &&
                    currentMovie.genre.split(', ').map((genre) => (
                      <Badge key={genre} variant="filled" color="blue" size="lg">
                        {genre}
                      </Badge>
                    ))
                  }
                </Flex>
              </div>

              {/* Plot */}
              {currentMovie.plot !== 'N/A' && (
                <div>
                  <Title order={3} size="h4" mb="xs" c="dark">
                    Plot
                  </Title>
                  <Text size="md" style={{ lineHeight: 1.8 }} c="dark" fw={400}>
                    {currentMovie.plot}
                  </Text>
                </div>
              )}

              <Divider />

              {/* Movie Info */}
              <div>
                <Title order={3} size="h4" mb="md" c="dark">
                  Movie Information
                </Title>
                <Grid>
                  {getInfoItems().map((item, index) => (
                    <Grid.Col key={index} span={{ base: 12, sm: 6 }}>
                      <Group gap="xs">
                        <item.icon size={20} color="#228be6" />
                        <Text size="sm" fw={600} c="gray.7">
                          {item.label}:
                        </Text>
                        <Text size="sm" fw={500} c="dark">{item.value}</Text>
                      </Group>
                    </Grid.Col>
                  ))}
                </Grid>
              </div>

              <Divider />

            {/* Cast & Crew */}
            <Grid>
              {currentMovie.director !== 'N/A' && (
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <div>
                    <Text size="sm" fw={600} c="gray.7" mb="xs">
                      Director
                    </Text>
                    <Text size="md" fw={500} c="dark">{currentMovie.director}</Text>
                  </div>
                </Grid.Col>
              )}

              {currentMovie.writer !== 'N/A' && (
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <div>
                    <Text size="sm" fw={600} c="gray.7" mb="xs">
                      Writer
                    </Text>
                    <Text size="md" fw={500} c="dark">{currentMovie.writer}</Text>
                  </div>
                </Grid.Col>
              )}

              {currentMovie.actors !== 'N/A' && (
                <Grid.Col span={12}>
                  <div>
                    <Text size="sm" fw={600} c="gray.7" mb="xs">
                      Cast
                    </Text>
                    <Text size="md" fw={500} c="dark">{currentMovie.actors}</Text>
                  </div>
                </Grid.Col>
              )}
            </Grid>

            {/* Additional Info */}
            {(currentMovie.language !== 'N/A' || currentMovie.country !== 'N/A') && (
              <>
                <Divider />
                <Grid>
                  {currentMovie.language !== 'N/A' && (
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <div>
                        <Text size="sm" fw={600} c="gray.7" mb="xs">
                          Language
                        </Text>
                        <Text size="md" fw={500} c="dark">{currentMovie.language}</Text>
                      </div>
                    </Grid.Col>
                  )}

                  {currentMovie.country !== 'N/A' && (
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <div>
                        <Text size="sm" fw={600} c="gray.7" mb="xs">
                          Country
                        </Text>
                        <Text size="md" fw={500} c="dark">{currentMovie.country}</Text>
                      </div>
                    </Grid.Col>
                  )}
                </Grid>
              </>
            )}

            {/* Ratings */}
            {currentMovie.ratings && currentMovie.ratings.length > 0 && (
              <>
                <Divider />
                <div>
                  <Title order={3} size="h4" mb="md" c="dark">
                    Ratings
                  </Title>
                  <Grid>
                    {currentMovie.ratings.map((rating, index) => (
                      <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
                        <Card padding="md" radius="md" withBorder shadow="sm" style={{ background: '#f8f9fa' }}>
                          <Text size="sm" fw={600} mb="xs" c="gray.7">
                            {rating.Source}
                          </Text>
                          <Text size="xl" fw={700} c="blue">
                            {rating.Value}
                          </Text>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                </div>
              </>
            )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
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