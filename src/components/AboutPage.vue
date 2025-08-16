<template>
  <div>
    <div>
      <h1>
        About Doodle-Art
      </h1>
    </div>
    <div class="content markdown-body">
      <div class="hero-section">
        <h2>Transform Your Sketches into Beautiful Artwork</h2>
        <p>
          Doodle-Art is an innovative project that leverages modern AI technology to transform your casual sketches into stunning paintings and artwork. Using state-of-the-art machine learning techniques, we bridge the gap between simple doodles and professional-quality art.
        </p>
      </div>

      <div class="how-it-works">
        <h2>How It Works</h2>
        <p>
          Our AI-powered pipeline consists of two main steps that work together to create beautiful results:
        </p>

        <h3>1. Sketch Reconstruction</h3>
        <p>
          We use <strong>Conditional Adversarial Networks</strong> (also known as pix2pix) to reconstruct and generate realistic images from your sketches. This technology can intelligently interpret your drawings and create detailed, realistic representations.
        </p>

        <h3>2. Arbitrary Style Transfer</h3>
        <p>
          Building on the success of applications like Prisma, we go a step further by implementing <strong>Universal Style Transfer via Feature Transforms</strong>. This allows you to apply any artistic style to your reconstructed image, not just pre-defined ones. You can use any reference image as a style guide to create truly unique artwork.
        </p>
      </div>

      <div class="technology">
        <h2>Technology Stack</h2>
        <div class="tech-grid">
          <div class="tech-item">
            <h4>Backend</h4>
            <ul>
              <li>Python & Flask</li>
              <li>TensorFlow & Keras</li>
              <li>Computer Vision & Deep Learning</li>
            </ul>
          </div>
          <div class="tech-item">
            <h4>Frontend</h4>
            <ul>
              <li>Vue.js</li>
              <li>Node.js</li>
              <li>Modern Web Technologies</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="authors">
        <h2>Meet the Team</h2>
        <p>
          Doodle-Art was created by a talented team of developers and AI enthusiasts:
        </p>
        <div class="author-list">
          <span class="author">Sandip Katel</span>
          <span class="author">Yujal Shrestha</span>
          <span class="author">Sharad Pokharel</span>
        </div>
      </div>

      <div class="license">
        <h2>Open Source</h2>
        <p>
          This project is open source and available under the MIT License. We believe in making AI technology accessible to everyone and encourage contributions from the community.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AboutPage",

  data() {
    return {};
  }
};
</script>

<style scoped>
@import './../assets/github-markdown.css';

.content {
  max-width: 740px;
  margin: 0 auto;
  padding: 0rem 1rem;
  text-align: left;
}

.hero-section {
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  text-align: center;
}

.hero-section h2 {
  margin-top: 0;
  font-size: 1.8rem;
}

.how-it-works, .technology, .authors, .license {
  margin-bottom: 2rem;
}

.tech-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
}

.tech-item {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.tech-item h4 {
  margin-top: 0;
  color: #333;
}

.tech-item ul {
  margin: 0;
  padding-left: 1.2rem;
}

.tech-item li {
  margin-bottom: 0.5rem;
}

.author-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.author {
  background: #e9ecef;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  color: #495057;
}

h2 {
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
}

h3 {
  color: #555;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .tech-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .hero-section {
    padding: 1.5rem;
  }
  
  .hero-section h2 {
    font-size: 1.5rem;
  }
  
  .author-list {
    justify-content: center;
  }
}
</style>