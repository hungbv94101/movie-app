import { Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './services/apolloClient';
import { HomePageGraphQL, MovieDetailPage } from './pages';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import './App.css';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <Routes>
        <Route path="/" element={<HomePageGraphQL />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/movies/detail/:imdbID" element={<MovieDetailPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Routes>
    </ApolloProvider>
  );
}

export default App;
