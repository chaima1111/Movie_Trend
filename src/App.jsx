import { useEffect, useState } from "react"
import Search from "./components/Search"
import Spinner from "./components/Spinner"
import MovieCard from "./components/MovieCard"
import { useDebounce } from "react-use" 
import { getTrendingMovies, updateSearchCount } from "./appwrite"
const API_BASE_URL = 'https://api.themoviedb.org/3'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}
const App = () => {
  const [serachTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState("")
  const [movieList , setMovieList] = useState([])
  const [isLoading , setIsLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [trendingMovies,setTrendingMovies] = useState([])
  useDebounce(()=> setDebouncedSearchTerm(serachTerm) , 500,[serachTerm])
  useEffect(() => {
    fetchMovies(debouncedSearchTerm)
  },[debouncedSearchTerm])
  useEffect(() => {
    loadTrendingMovies();
 },[])
  const fetchMovies = async (query = "") => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`

        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc `
      const response = await fetch(endpoint, API_OPTIONS)
    
      if (!response.ok) {
        throw new Error('Failed to fetch movies')
      }
      const data = await response.json()

      if (data.Response == 'False') {
        setErrorMessage(data.Error || 'failed to fetch movies')
        setMovieList([])
        return
      }
      
      setMovieList(data.results || [])

      if (query && data.results.length > 0) {
        await updateSearchCount(query,data.results[0])
      }
      updateSearchCount()
    } catch (error) {
      console.error(`error fetchig ${error}`)
      setErrorMessage('Error fetching movie please try again later')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await  getTrendingMovies()
      setTrendingMovies(movies)
    } catch(error) {
      console.log(`Error fetching trending ${error}`)

    }
  }
  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <header>
            <img src="/hero.png" alt="Hero header" />
          <h1> Find  <span className="text-gradient">Movies</span>  You will Enjoy with</h1>
          <Search searchTerm={serachTerm} setSearchTerm={ setSearchTerm} />
          </header>

          {trendingMovies.length > 0 && (
            <section className="trending">
              <h2>Trending Movies</h2>
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="all-movies">
            <h2>All Movies</h2>

            {isLoading ? (
              <Spinner />
            ): errorMessage ? (
                <p className="text-red-500">{ errorMessage}</p>
              ) : (
                  <ul>
                    {movieList.map((movie) => (
                      <MovieCard key={ movie.id} movie={movie} />
                    ))}

                  </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  
  )
}

export default App