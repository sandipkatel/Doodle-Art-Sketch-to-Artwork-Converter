<p align="center">
  <img src="https://user-images.githubusercontent.com/5097752/41201696-1c1fe926-6cef-11e8-8972-b22e89dba68c.jpg" width="300px" alt="">
</p>

# Doodle-Art:

<!-- * [Introduction](#introduction)
* [Theories](#theories) -->
  <!-- + [Sketch Reconstruction](#sketch-reconstruction)
  + [Style Transfer](#style-transfer)
* [Manual Installation](#manual-installation)
  + [Backend](#backend)
  + [Frontend](#frontend)
* [Authors](#authors)
* [License](#license) -->


<!-- ## Introduction

This project can transform your casual sketch to beautiful painting/artwork using modern AI technology.

### Screenshots

<p align="center">
  <img src="https://user-images.githubusercontent.com/5097752/41201770-a6b9f35a-6cf0-11e8-8711-916f769c1c9d.jpg" alt="">
</p> -->

## Theories

<!-- To achieve the goal, there are mainly two steps in the pipeline: -->
To achieve the goal, we have simple idea:

- Reconstruct and generate *real* image from the sketch
<!-- - Arbitary style transfer to beautify the result with given result -->

### Sketch Reconstruction

The principle behind this is called **Conditional Adversarial Networks**, known as [pix2pix](https://phillipi.github.io/pix2pix/), which is able to translate the image based on the given image.

![](https://user-images.githubusercontent.com/5097752/41201879-ca11fd6e-6cf2-11e8-91c3-f0cf0f1ac50d.jpg)

<!-- ### Style Transfer

It became known to us with the appearance of [Prisma](https://prisma-ai.com/) app. Typically, we generate an individual model for each pre-defined style. Here, we want to go further by using any new picture as the style. So, we adopted the method, [**Universal Style Transfer via Feature Transforms**](https://arxiv.org/abs/1705.08086) proposed in NIPS2017, which enables us to perform arbitary style transfer.
<p align="center">
  <img src="https://user-images.githubusercontent.com/5097752/41201821-f40a5cb6-6cf1-11e8-917f-779f4055ffc5.jpg" width="400px" alt="">
</p> -->

## Development

### Backend

The server side is powered by Python and Flask.
Navigate to the `server` directory and all the files concerning the service and neural networks are there. The two main files:

- `app_pix.py` for pix2pix translation
<!-- - `app_stylize.py` for arbitrary style transfer -->

#### Prerequisites

Install requirements using pip command below:

```bash
pip install -r server/requirements.txt
```

#### Run

```bash
# Simply run in bash
sh run.sh
```

And you could see the output indicating the port it's listening (5001 and 5002). Go to `http://localhost:5001` and you should see the returned information.

### Frontend

You should install:

- [Node.js](https://nodejs.org)
- [Yarn](https://yarnpkg.com)

```
# Clone the repo
git clone git@github.com:sandipkatel/Doodle-Art.git
cd Doodle-Art

# Install dependencies
yarn  # or npm install

# Run
yarn dev  # or npm run dev
```

Open your browser at and enter `http://localhost:8080`, you will see everything there.

## Authors

Sandip Katel, Yujal Shrestha, Sharad Pokharel

## License

Released under the [MIT License](https://opensource.org/licenses/MIT).
