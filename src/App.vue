<template>
  <div id="app">
    <header>
      <div class="nav-container">
        <div class="logo">
          <img src="./assets/logohorizontal.png" alt="Doodle-Art" class="logo-img">
        </div>
        <nav class="nav-links">
          <router-link to="/"
                       class="route">Demo</router-link>
          <router-link to="/gallery"
                       class="route">Gallery</router-link>
          <router-link to="/about"
                       class="route">About</router-link>
        </nav>
      </div>
    </header>

    <router-view/>

    <!-- github corner -->
    <a href="https://github.com/sandipkatel/Doodle-Art"
       target="_blank"
       class="github-corner"
       aria-label="View source on Github">
      <svg width="60"
           height="60"
           viewBox="0 0 250 250"
           style="fill:#667eea; color:#fff; position: absolute; top: 0; border: 0; right: 0;"
           aria-hidden="true">
        <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
        <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
              fill="currentColor"
              style="transform-origin: 130px 106px;"
              class="octo-arm"></path>
        <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
              fill="currentColor"
              class="octo-body"></path>
      </svg>
    </a>

    <div class="spacer"></div>
    <footer>
      <div class="footer-content">
        <p>Made with ❤️ by the Doodle-Art Team</p>
        <div class="team-credits">
          <span>Sandip Katel</span> • 
          <span>Yujal Shrestha</span> • 
          <span>Sharad Pokharel</span>
        </div>
        <p class="copyright">© 2024 Doodle-Art. Released under MIT License.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "App"
};
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 16px;
  text-align: center;
  color: #2c3e50;
  
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.spacer {
  flex: 1;
}

header {
  background: white;
  color: #000;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 70px;
  width: auto;
  position: absolute;
  transition: transform 0.3s ease;
}

.logo-img:hover {
  transform: scale(1.05);
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.route {
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  transition: all 0.3s ease;
  position: relative;
}

.route:hover {
  color: #6C5CE7;
  background: #ffd83d9c;
  transform: translateY(-1px);
}

.route.router-link-active:not([to="/"]) {
  color: #6C5CE7;
  background: #ffd83d9c;
  font-weight: 600;
}

body {
  margin: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.github-corner:hover .octo-arm {
  animation: octocat-wave 560ms ease-in-out;
}

@keyframes octocat-wave {
  0%,
  100% {
    transform: rotate(0);
  }
  20%,
  60% {
    transform: rotate(-25deg);
  }
  40%,
  80% {
    transform: rotate(10deg);
  }
}

footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  padding: 2rem 0;
  margin-top: 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-content p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.team-credits {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.team-credits span {
  font-weight: 500;
}

.copyright {
  font-size: 0.8rem !important;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 1rem !important;
}

@media only screen and (max-width: 800px) {
  .github-corner:hover .octo-arm {
    animation: none;
  }
  .github-corner .octo-arm {
    animation: octocat-wave 560ms ease-in-out;
  }
  
  .nav-container {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .logo-img {
    height: 35px;
  }
  
  .footer-content {
    padding: 0 1rem;
  }
}

@media only screen and (max-width: 600px) {
  .nav-links {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .route {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}
</style>