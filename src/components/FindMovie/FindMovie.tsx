import React, {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
} from 'react';
import './FindMovie.scss';
import { getMovie } from '../../api';
import { MovieCard } from '../MovieCard';
import { Movie } from '../../types/Movie';
import { MovieData } from '../../types/MovieData';
import { ResponseError } from '../../types/ReponseError';
import cs from 'classnames';

interface Props {
  movies: Movie[];
  setMovies: Dispatch<SetStateAction<Movie[]>>;
}

export const FindMovie: React.FC<Props> = ({ setMovies, movies }) => {
  const [query, setQuery] = useState('');
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onTitleHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setError(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    getMovie(query).then((data: MovieData | ResponseError) => {
      if ('Error' in data) {
        setError(true);
        setIsLoading(false);

        return;
      }

      setMovie({
        title: data.Title,
        imdbId: data.imdbID,
        description: data.Plot,
        imgUrl: data.Poster,
        imdbUrl: `https://www.imdb.com/title/${data.imdbID}`,
      });

      setIsLoading(false);
    });
  };

  const onAddMovie = () => {
    const isDuplicateMovie = movies.find(
      checkMovie => checkMovie.title === movie?.title,
    );

    if (movie && !isDuplicateMovie) {
      setMovies([...movies, movie]);
    }

    setMovie(null);
    setQuery('');
  };

  return (
    <>
      <form className="find-movie" onSubmit={handleSubmit}>
        <div className="field">
          <label className="label" htmlFor="movie-title">
            Movie title
          </label>

          <div className="control">
            <input
              data-cy="titleField"
              type="text"
              id="movie-title"
              placeholder="Enter a title to search"
              value={query}
              className={cs('input', {
                'is-danger': error,
              })}
              onChange={onTitleHandler}
            />
          </div>

          {error && (
            <p className="help is-danger" data-cy="errorMessage">
              Can&apos;t find a movie with such a title
            </p>
          )}
        </div>

        <div className="field is-grouped">
          <div className="control">
            <button
              data-cy="searchButton"
              type="submit"
              className={cs('button is-light', {
                'is-loading': isLoading,
              })}
              disabled={!query}
            >
              Find a movie
            </button>
          </div>

          {movie && (
            <div className="control">
              <button
                data-cy="addButton"
                type="button"
                className="button is-primary"
                onClick={onAddMovie}
              >
                Add to the list
              </button>
            </div>
          )}
        </div>
      </form>

      {movie && (
        <div className="container" data-cy="previewContainer">
          <h2 className="title">Preview</h2>
          <MovieCard movie={movie} />
        </div>
      )}
    </>
  );
};
