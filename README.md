# Time-o-meter

Time-o-meter is a sleek, web-based GPS speedometer and pace tracker designed for runners, cyclists, and drivers. It features dynamic SVG gauges, a premium dark-mode aesthetic, and leverages modern browser APIs to provide real-time speed metrics without needing an app store installation.

Feel free to visit [time-o-meter](https://sahariprasad.github.io/time-o-meter) to try it out!

## Behind the Scenes: Vibe Coding

I was inspired to create this by [this video of Rory Sutherland](https://www.youtube.com/watch?v=Bc9jFbxrkMk&t=897s) that I came across while doomscrolling on YouTube. I wanted to see how **"vibe coding"** felt in practice. While the UI/UX, design choices, and overall aesthetic vision are entirely my own, the underlying code was generated using Gemini inside the Antigravity IDE. 

## Features

- **Real-Time GPS Tracking**: Uses the device's hardware GPS to accurately measure current speed.
- **Dual Metrics**: View your speed (km/h or mph) and pace (min/km or min/mi) simultaneously on dynamic, animated SVG gauges.
- **Smart Wake Lock**: Automatically prevents your device screen from turning off while you're actively tracking.
- **Preview Mode**: Includes a built-in interactive slider to test gauge animations and behaviors without needing to physically move.
- **No Dependencies**: Built entirely with vanilla HTML, CSS, and JavaScript. Lightweight and incredibly fast.

## Technologies Used

- **Frontend Core**: HTML5, Vanilla CSS3 (Custom Properties, Flexbox), Vanilla JavaScript (ES6+).
- **Web APIs**: 
  - `Geolocation API` (`watchPosition`) for continuous location tracking.
  - `Wake Lock API` to manage screen power state.
  - `HTMLDialogElement` for native modal popups.
- **Design**: Inline SVG manipulation for smooth, responsive gauge animations.

## How to Run Locally

Since this project has zero external dependencies or build steps, running it is incredibly simple:

1. Clone this repository:
   ```bash
   git clone https://github.com/sahariprasad/time-o-meter.git
   ```
2. Navigate into the directory:
   ```bash
   cd time-o-meter
   ```
3. Open `index.html` in your favorite modern web browser.
   *(Note: For the Geolocation API to work properly on mobile devices, you may need to serve the file over HTTPS using a tool like GitHub Pages or a local dev server).*

## Usage

1. Open the app on your mobile device.
2. Tap the **Settings** icon (gear in the top left).
3. Select your preferred units (**km/h** or **mph**).
4. Tap **START GPS** and grant location permissions when prompted by your browser.
5. Start moving!

To test the animations while sitting at your desk, open settings and switch to **Slider Preview** mode.

## Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/sahariprasad/time-o-meter/issues).