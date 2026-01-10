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
  IconTrophy
} from '@tabler/icons-react';
import { LoadingSpinner, ErrorMessage } from '../components';
import { useMovieStore } from '../store';

export function MovieDetailPage() {
  const { id, imdbID } = useParams<{ id?: string; imdbID?: string }>();
  const navigate = useNavigate();
  const {
    currentMovie,
    favoriteIds,
    isLoading,
    error,
    fetchMovieById,
    toggleFavorite,
  } = useMovieStore();

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

  const isFavorite = currentMovie?.id ? favoriteIds.includes(currentMovie.id) : false;

  const handleBack = () => {
    navigate('/');
  };

  const handleFavoriteClick = () => {
    if (currentMovie?.id) {
      toggleFavorite(currentMovie.id);
    }
  };

  const getInfoItems = () => [
    { icon: IconCalendar, label: 'Year', value: currentMovie.year },
    { icon: IconClock, label: 'Runtime', value: currentMovie.runtime },
    { icon: IconUsers, label: 'Rated', value: currentMovie.rated },
    { icon: IconTrophy, label: 'Awards', value: currentMovie.awards },
  ].filter(item => item.value && item.value !== 'N/A');

  return (
    <Container size="xl" py="xl">
      {/* Back Button and Favorite */}
      <Group justify="space-between" mb="xl">
        <Button
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          onClick={handleBack}
        >
          Back to Movies
        </Button>
        
        <Tooltip label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
          <ActionIcon
            size="lg"
            variant="light"
            color={isFavorite ? 'red' : 'gray'}
            onClick={handleFavoriteClick}
          >
            {isFavorite ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
          </ActionIcon>
        </Tooltip>
        {currentMovie.imdb_rating !== 'N/A' && (
          <Group gap="xs" ml="md">
            <IconStar size={20} color="gold" fill="gold" />
            <Text size="lg" fw={500}>
              {currentMovie.imdb_rating}/10
            </Text>
            <Text size="sm" c="dimmed">
              ({currentMovie.imdb_votes} votes)
            </Text>
          </Group>
        )}
      </Group>

      <Grid>
        {/* Movie Poster */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card padding="lg" radius="md" withBorder>
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
          <Stack gap="lg">
            {/* Title and Rating */}
            <div>
              <Title order={1} size="h2" mb="xs">
                {currentMovie.title}
              </Title>
              {currentMovie.imdb_rating !== 'N/A' && (
                <Group gap="xs" mb="md">
                  <IconStar size={20} color="gold" fill="gold" />
                  <Text size="lg" fw={500}>
                    {currentMovie.imdb_rating}/10
                  </Text>
                  <Text size="sm" c="dimmed">
                    ({currentMovie.imdb_votes} votes)
                  </Text>
                </Group>
              )}

              {/* Badges */}
              <Flex gap="xs" wrap="wrap" mb="md">
                {currentMovie.genre !== 'N/A' && currentMovie.genre &&
                  currentMovie.genre.split(', ').map((genre) => (
                    <Badge key={genre} variant="light" color="blue">
                      {genre}
                    </Badge>
                  ))
                }
              </Flex>
            </div>

            {/* Plot */}
            {currentMovie.plot !== 'N/A' && (
              <div>
                <Title order={3} size="h4" mb="xs">
                  Plot
                </Title>
                <Text size="md" style={{ lineHeight: 1.6 }}>
                  {currentMovie.plot}
                </Text>
              </div>
            )}

            <Divider />

            {/* Movie Info */}
            <div>
              <Title order={3} size="h4" mb="md">
                Movie Information
              </Title>
              <Grid>
                {getInfoItems().map((item, index) => (
                  <Grid.Col key={index} span={{ base: 12, sm: 6 }}>
                    <Group gap="xs">
                      <item.icon size={16} color="gray" />
                      <Text size="sm" fw={500} c="dimmed">
                        {item.label}:
                      </Text>
                      <Text size="sm">{item.value}</Text>
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
                    <Text size="sm" fw={500} c="dimmed" mb="xs">
                      Director
                    </Text>
                    <Text size="md">{currentMovie.director}</Text>
                  </div>
                </Grid.Col>
              )}

              {currentMovie.writer !== 'N/A' && (
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <div>
                    <Text size="sm" fw={500} c="dimmed" mb="xs">
                      Writer
                    </Text>
                    <Text size="md">{currentMovie.writer}</Text>
                  </div>
                </Grid.Col>
              )}

              {currentMovie.actors !== 'N/A' && (
                <Grid.Col span={12}>
                  <div>
                    <Text size="sm" fw={500} c="dimmed" mb="xs">
                      Cast
                    </Text>
                    <Text size="md">{currentMovie.actors}</Text>
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
                        <Text size="sm" fw={500} c="dimmed" mb="xs">
                          Language
                        </Text>
                        <Text size="md">{currentMovie.language}</Text>
                      </div>
                    </Grid.Col>
                  )}

                  {currentMovie.country !== 'N/A' && (
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <div>
                        <Text size="sm" fw={500} c="dimmed" mb="xs">
                          Country
                        </Text>
                        <Text size="md">{currentMovie.country}</Text>
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
                  <Title order={3} size="h4" mb="md">
                    Ratings
                  </Title>
                  <Grid>
                    {currentMovie.ratings.map((rating, index) => (
                      <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
                        <Card padding="sm" radius="sm" withBorder>
                          <Text size="sm" fw={500} mb="xs">
                            {rating.Source}
                          </Text>
                          <Text size="lg" fw={700} color="blue">
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
        </Grid.Col>
      </Grid>
    </Container>
  );
}