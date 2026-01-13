import { Card, Text, Badge, Group, ActionIcon, Tooltip } from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import type { Movie } from '../types';
import { useAuthStore } from '../store';
import { favoritesApi } from '../services/favoritesApi';
import { SafeImage } from './SafeImage';

interface MovieCardProps {
  movie: Movie;
  onMovieClick?: (movie: Movie) => void;
  onFavoriteClick?: (movieId: string) => void;
  showAuthModal?: () => void;
}

export function MovieCard({ movie, onMovieClick, onFavoriteClick, showAuthModal }: MovieCardProps) {
  // Comprehensive validation of essential movie data to prevent render errors
  if (!movie || 
      !movie.title || 
      !movie.year || 
      typeof movie.title !== 'string' ||
      movie.title === 'N/A' || 
      movie.year === 'N/A' || 
      movie.title.trim() === '' || 
      movie.year.toString().trim() === '' ||
      movie.year === null ||
      movie.year === undefined) {
    console.warn('Invalid movie data filtered out:', movie);
    return null;
  }

  const { user } = useAuthStore();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(movie?.favorited_by_count || 0);
  
  // Validate essential movie data
  const movieTitle = movie?.title || 'Unknown Title';
  const movieYear = movie?.year || 'Unknown Year';
  const movieId = movie?.id || movie?.imdbID || 'unknown';
  const posterUrl = movie?.poster;
  const hasValidPoster = posterUrl && posterUrl !== 'N/A' && posterUrl.trim() !== '';

  // Don't render card if critical data is missing
  if (!movie || !movieTitle || movieTitle === 'N/A' || !movieYear || movieYear === 'N/A') {
    return null;
  }

  // Load initial favorite status when user is logged in
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (!user || !movie.id || movieId === 'unknown') return;
      
      try {
        const response = await favoritesApi.check(Number(movie.id));
        if (response.success) {
          setIsFavorited(response.is_favorited || false);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    loadFavoriteStatus();
  }, [user, movie.id, movieId]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if user is logged in
    if (!user) {
      showAuthModal?.();
      return;
    }

    // Must have a valid movie ID for favorites
    if (!movie.id || movieId === 'unknown') {
      return;
    }

    // Optimistic update
    const wasAlreadyFavorited = isFavorited;
    const newFavoriteState = !wasAlreadyFavorited;
    const newCount = wasAlreadyFavorited ? favoriteCount - 1 : favoriteCount + 1;
    
    setIsFavorited(newFavoriteState);
    setFavoriteCount(newCount);
    setIsLoading(true);

    try {
      const response = await favoritesApi.toggle(Number(movie.id));
      if (response.success) {
        // Update with actual server response
        setIsFavorited(response.is_favorited || false);
        // Server should return updated count, if available
        if (response.movie_favorite_count !== undefined) {
          setFavoriteCount(response.movie_favorite_count);
        }
        onFavoriteClick?.(movie.imdbID || String(movieId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update on error
      setIsFavorited(wasAlreadyFavorited);
      setFavoriteCount(favoriteCount);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    onMovieClick?.(movie);
  };

  return (
    <Card 
      shadow="sm" 
      padding="lg" 
      radius="md" 
      withBorder
      className="movie-card fade-in"
      style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', minHeight: '500px' }}
      onClick={handleCardClick}
    >
      <Card.Section>
        <div style={{ height: '300px', overflow: 'hidden' }}>
          <SafeImage
            src={movie.poster && 
                 movie.poster !== 'N/A' && 
                 movie.poster.trim() !== '' 
                 ? movie.poster : undefined}
            height={300}
            width="100%"
            alt={`${movie.title} poster`}
            fallbackSrc="/placeholder-poster.svg"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
      </Card.Section>

      {/* Title and Favorites - with spacing from poster */}
      <div style={{ padding: '12px 0 8px 0', borderBottom: '1px solid #f0f0f0', marginBottom: '12px' }}>
        <Group justify="space-between" align="flex-start">
          <Text fw={500} size="md" lineClamp={2} style={{ flex: 1, marginRight: '8px', minHeight: '40px' }}>
            {movie.title}
          </Text>
          
          <Group gap={4} align="center" style={{ flexShrink: 0 }}>
            <Text size="xs" c="dimmed" fw={600}>
              {favoriteCount}
            </Text>
            <Tooltip label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
              <ActionIcon
                variant="light"
                color={isFavorited ? 'red' : 'gray'}
                onClick={handleFavoriteClick}
                loading={isLoading}
                disabled={!user || !movie.id}
                size="sm"
              >
                {isFavorited ? <IconHeartFilled size={14} /> : <IconHeart size={14} />}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </div>

      {/* Movie Info Badges */}
      <Group gap="xs" mb="sm">
        {movie.year && (
          <Badge color="blue" variant="light" size="sm">
            {movie.year}
          </Badge>
        )}
        {movie.imdbRating && movie.imdbRating !== 'N/A' && (
          <Badge color="yellow" variant="light" size="sm">
            ⭐ {movie.imdbRating}
          </Badge>
        )}
        {movie.rated && movie.rated !== 'N/A' && (
          <Badge color="green" variant="light" size="sm">
            {movie.rated}
          </Badge>
        )}
      </Group>

      {/* Plot */}
      <Text size="sm" c="dimmed" lineClamp={3} mb="sm" style={{ flex: 1 }}>
        {movie.plot && movie.plot !== 'N/A' ? movie.plot : 'Click to see full details'}
      </Text>

      {/* Genres */}
      {movie.genre && movie.genre !== 'N/A' && (
        <Group gap="xs" mt="auto">
          {movie.genre.split(', ').slice(0, 3).map((genre) => (
            <Badge key={genre} size="xs" variant="outline" color="gray">
              {genre}
            </Badge>
          ))}
        </Group>
      )}
    </Card>
  );
}