<template>
  <div id="wrapper">
    <h1>Sketch to Art</h1>
    
    <div class="container">
      <!-- Drawing Section -->
      <div class="section">
        <h3>Start Drawing</h3>
        
        <div class="canvas-wrapper">
          <drawing-board ref="canvas" :enabled="!userContent"></drawing-board>
        </div>
        
        <!-- First Row: Clear and Upload -->
        <div class="button-row">
          <button class="btn btn-clear" @click="clearCanvas">
            Clear Canvas
          </button>
          <label for="imageUpload" class="btn btn-upload">
            Choose Image
          </label>
          <input 
            type="file" 
            id="imageUpload" 
            @change="contentUpload"
            accept=".png,.jpg,.jpeg"
          >
        </div>
        
        <!-- Second Row: Generate -->
        <div class="button-row">
          <button class="btn btn-submit" @click="submitDrawing">
            Generate Art
          </button>
        </div>
      </div>

      <!-- Result Section -->
      <div class="section">
        <h3>Result</h3>
        
        <div class="result-container">
          <div class="hint" v-if="!resultSrc">
            Your result will be shown here.
          </div>
          <img v-if="resultSrc" :src="resultSrc" alt="Generated art">
        </div>
        
        <div v-if="resultSrc" class="result-actions">
          <button class="btn btn-gallery" @click="uploadToGallery">
            Save to Gallery (Beta)
          </button>
          <div class="hint">Right click to save image</div>
        </div>
      </div>
    </div>

    <!-- Loading Modal -->
    <div class="overlay" v-if="showWaitModal">
      <div class="spinner">
        <div class="spinner-circle"></div>
      </div>
      <div class="loading-text">{{ modalContent }}</div>
    </div>
  </div>
</template>

<script>
import DrawingBoard from "./DrawingBoard.vue";
import axios from "axios";

// Simplified axios setup
const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === "development" 
    ? "http://localhost:5001" 
    : "https://dip.imfing.com/pix"
});

export default {
  name: "SketchToArt",
  
  components: {
    DrawingBoard
  },

  data() {
    return {
      sessionId: "",
      userContent: false,
      resultSrc: "",
      showWaitModal: false,
      modalContent: "Processing your art..."
    };
  },

  mounted() {
    // Generate session ID
    this.sessionId = "_" + Math.random().toString(36).substr(2, 9);
    
    // Test server connection
    this.testConnection();
  },

  methods: {
    testConnection() {
      apiClient.get("/").catch(error => {
        console.warn("Server connection failed:", error.message);
        // Could show user notification here
      });
    },

    clearCanvas() {
      this.$refs.canvas.clearCanvas();
      this.userContent = false;
      this.resultSrc = "";
    },

    async submitDrawing() {
      try {
        // Get canvas data
        const canvas = document.querySelector("#canvas");
        const context = canvas.getContext("2d");
        
        // Set white background
        const w = canvas.width;
        const h = canvas.height;
        const originalOperation = context.globalCompositeOperation;
        context.globalCompositeOperation = "destination-over";
        context.fillStyle = "white";
        context.fillRect(0, 0, w, h);
        context.globalCompositeOperation = originalOperation;

        const imageData = canvas.toDataURL("image/png");
        
        // Show loading
        this.showWaitModal = true;
        this.modalContent = "Creating your art...";

        // Prepare form data
        const formData = new FormData();
        formData.append("id", this.sessionId);
        formData.append("image", imageData);

        // Submit to server
        const response = await apiClient.post("/pix-translate-data", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        this.resultSrc = response.data;
        
      } catch (error) {
        console.error("Submission failed:", error);
        this.modalContent = "Something went wrong. Please try again.";
        setTimeout(() => this.showWaitModal = false, 2000);
      } finally {
        if (this.resultSrc) {
          this.showWaitModal = false;
        }
      }
    },

    async uploadToGallery() {
      if (!confirm("Save your work to public gallery?")) return;

      try {
        this.showWaitModal = true;
        this.modalContent = "Saving to gallery...";

        const formData = new FormData();
        formData.append("id", this.sessionId);

        await apiClient.post("/submit-to-gallery", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        alert("Successfully saved to gallery!");
        
      } catch (error) {
        console.error("Gallery upload failed:", error);
        alert("Failed to save to gallery. Please try again.");
      } finally {
        this.showWaitModal = false;
      }
    },

    contentUpload(event) {
      const files = event.target.files;
      if (!files.length) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const canvas = document.querySelector("#canvas");
        const ctx = canvas.getContext("2d");
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Load and draw image
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = e.target.result;
      };
      
      reader.readAsDataURL(files[0]);
      event.target.value = "";
      this.userContent = true;
    },
  }
};
</script>

<style scoped>
/* Base Styles */
#wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

#wrapper h1 {
  text-align: center;
  margin: 1rem 0 2rem;
  color: #2c3e50;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
}

#wrapper h3 {
  margin: 0 0 1rem;
  color: #34495e;
  font-size: clamp(1rem, 3vw, 1.25rem);
}

/* Layout */
.container {
  display: flex;
  gap: 3rem;
  align-items: flex-start;
}

.section {
  flex: 1;
  min-width: 300px;
}

/* Canvas */
.canvas-wrapper {
  width: 100%;
  max-height: 400px;
  padding: 1rem;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  background: #f8f9fa;
  margin-bottom: 1.5rem;
}

/* Button Rows */
.button-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.button-row:last-child {
  margin-bottom: 0;
}

/* File Input */
input[type="file"] {
  display: none;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 120px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
}

.btn-clear {
  background: #FF6B6B;
  color: white;
}

.btn-clear:hover {
  background: #c0392b;
}

.btn-upload {
  background: #4ECDC4;
  color: white;
}

.btn-upload:hover {
  background: #3b9993;
}

.btn-submit {
  background: #6C5CE7;
  color: white;
  width: 100%;
}

.btn-submit:hover {
  background: #564ab6;
}

.btn-gallery {
  background: #FFD93D;
  color: white;
  width: 100%;
  margin-bottom: 0.5rem;
}

.btn-gallery:hover {
  background: #b3982a;
}

/* Result Section */
.result-container {
  width: 100%;
  min-height: 300px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  overflow: hidden;
}

.result-container img {
  max-width: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.hint {
  color: #95a5a6;
  font-size: 0.9rem;
  text-align: center;
  font-style: italic;
}

.result-actions {
  text-align: center;
}

/* Loading Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(44, 62, 80, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  width: 60px;
  height: 60px;
  margin-bottom: 1rem;
}

.spinner-circle {
  width: 100%;
  height: 100%;
  border: 4px solid #ecf0f1;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #ecf0f1;
  font-size: 1.1rem;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  #wrapper {
    padding: 0.5rem;
  }
  
  .container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .section {
    min-width: unset;
  }
  
  .canvas-wrapper {
    max-height: 300px;
    padding: 0.5rem;
  }
  
  .button-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn {
    flex: none;
    min-width: unset;
  }
  
  .result-container {
    min-height: 250px;
  }
}

@media (max-width: 480px) {
  .canvas-wrapper {
    max-height: 250px;
  }
  
  .result-container {
    min-height: 200px;
  }
  
  .btn {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .btn,
  .upload-btn,
  .spinner-circle {
    transition: none;
    animation: none;
  }
}
</style>