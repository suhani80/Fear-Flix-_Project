
import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./App.css";

gsap.registerPlugin(ScrollTrigger);

const API_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

const OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_TOKEN}`,
  },
};
function onlyReleased(list) {
  const today = new Date();
  return list.filter(
    (m) => m.release_date && new Date(m.release_date) <= today
  );
}

function App() {
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [heading, setHeading] = useState("Popular Horror Movies");
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (!showIntro) return;
    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          setShowIntro(false);
        },
      });

      tl.from(".intro-letter", {
        opacity: 0,
        y: 60,
        scale: 0.6,
        filter: "blur(12px)",
        duration: 0.6,
        stagger: 0.12,
        ease: "power3.out",
      })
        .to(".intro-line", { scaleX: 1, duration: 0.6, ease: "power2.out" }, "-=0.2")
        .to(".intro-logo", {
          textShadow: "0 0 40px rgba(255,40,40,0.9), 0 0 90px rgba(200,0,0,0.7)",
          duration: 0.5,
        })
        .to(".intro-logo", {
          scale: 14,
          opacity: 0,
          duration: 0.9,
          ease: "power3.in",
          delay: 0.25,
        })
        .to(".intro-line", { opacity: 0, duration: 0.2 }, "<")
        .to(".intro", { opacity: 0, duration: 0.4 }, "-=0.3");
    });

    return () => {
      ctx.revert();
      document.body.style.overflow = "";
    };
  }, [showIntro]);

  async function loadMovies(url, title) {
    if (!API_TOKEN) {
      setError("API token missing. Check your .env file.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(url, OPTIONS);
      const data = await response.json();

      if (!response.ok) throw new Error("Failed to fetch movies");

      const released = onlyReleased(data.results || []);

      if (released.length > 0) {
        setMovies(released);
        setHeading(title);
      } else {
        setError("No movies found.");
        setMovies([]);
      }
    } catch {
      setError("Unable to load movies. Check internet.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }

  function loadPopularHorror() {
    loadMovies(
      "https://api.themoviedb.org/3/discover/movie?with_genres=27&sort_by=popularity.desc&include_adult=false&language=en-US&page=1",
      "Popular Horror Movies"
    );
  }

  function searchMovies(query) {
    loadMovies(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        query
      )}&include_adult=false&language=en-US&page=1`,
      `Results for "${query}"`
    );
  }

  useEffect(() => {
    loadPopularHorror();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
    
      gsap.from(".navbar", {
        y: -35,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 3.3,
      });

      gsap.from(".hero .tagline, .hero h2, .search-box", {
        y: 35,
        opacity: 0,
        duration: 0.9,
        stagger: 0.18,
        ease: "power3.out",
        delay: 3.5,
      });

      gsap.from(".movies-section .tagline, .movies-section h2", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".movies-section",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from("footer", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: "footer",
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (loading || movies.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".movie-card",
        { y: 60, opacity: 0, scale: 0.94 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".movie-grid",
            start: "top 85%",
            toggleActions: "play none none reset",
          },
        }
      );
    });

    return () => ctx.revert();
  }, [movies, loading]);

  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) {
      loadPopularHorror();
      return;
    }
    searchMovies(search);
  }

  return (
    <div className="app">
      {showIntro && (
        <div className="intro">
          <h1 className="intro-logo">
            {"FEAR".split("").map((c, i) => (
              <span className="intro-letter" key={"f" + i}>
                {c}
              </span>
            ))}
            {"FLIX".split("").map((c, i) => (
              <span className="intro-letter red" key={"x" + i}>
                {c}
              </span>
            ))}
            <span className="intro-letter red">.</span>
          </h1>
          <div className="intro-line" />
        </div>
      )}

      <nav className="navbar">
        <a href="#home" className="logo">
          Fear<span>Flix</span>
          <i>.</i>
        </a>

        <div className="nav-links">
          <a href="#home" className="nav-link active">
            Home
          </a>
          <a href="#movies" className="nav-link">
            Movies
          </a>
          <a href="#about" className="nav-link">
            About
          </a>
        </div>

        <a href="#movies" className="nav-cta">
          Explore <span>↗</span>
        </a>
      </nav>

      <section className="hero" id="home">
        <p className="tagline">WHERE NIGHTMARES BEGIN</p>

        <h2>
          Discover Your Next
          <br />
          <span>Nightmare.</span>
        </h2>

        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for a movie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </section>

      <section className="movies-section" id="movies">
        <p className="tagline">YOUR COLLECTION</p>
        <h2>{heading}</h2>

        {loading && <p className="status">Loading movies...</p>}

        {!loading && error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <div className="movie-grid">
            {movies.map((movie) => (
              <article className="movie-card" key={movie.id}>
                {movie.poster_path ? (
                  <img
                    className="movie-poster"
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                  />
                ) : (
                  <div className="poster-placeholder">No poster</div>
                )}

                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p>Release: {movie.release_date?.split("-")[0] || "N/A"}</p>
                  <p className="movie-type">
                    ⭐{" "}
                    {movie.vote_average > 0
                      ? movie.vote_average.toFixed(1)
                      : "Not rated"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer id="about">
        <h2>FearFlix</h2>
        <p>Discover. Explore. Enjoy Cinema.</p>
      </footer>
    </div>
  );
}

export default App;