# Imposters v4
## Description
Imposters is a progressive web app that displays music posters based on certain music buildings in Amsterdam from a certain period of time. For example you can look up posters connected to the Paradiso from the seventies.

![Demo](https://github.com/hackshackshacks/performance-matters-server-side/blob/master/readme_images/demo.png?raw=true)



## Getting started
This project uses Node.js and NPM. Make sure you download node from https://nodejs.org if you haven't already.

### Step 1
Clone the repository by running:
```
git clone git@github.com:hackshackshacks/performance-matters-server-side.git
```

### Step 2
Install the NPM packages by running:
```
npm install
```

### Step 3
To start the server run:
```
npm start
```

### Step 4
Navigate to http://localhost:8001/ to preview the application. If you ran into any issues try repeating the above steps.

## Performance
Throughout the process of making this app more performant I performed Google Lighthouse audits (https://developers.google.com/web/tools/lighthouse/). Because of slight inconsistency in results I have done 5 audits every time and used the most 'average' result.

### v2 - Single page web app (SWA)
Imposters v2 was the starting point of performance improvements. I rebuilt the app to be a server side application instead of a completely client side SWA. The goal was to reduce loading time.

Starting point (v2):
![v2](https://github.com/hackshackshacks/performance-matters-server-side/blob/master/readme_images/audit_old.png?raw=true)

Most recent audit (v4):
![v4](https://github.com/hackshackshacks/performance-matters-server-side/blob/master/readme_images/audit_new.png?raw=true)

As you can see the move to server side didn't really speed up the application, actually, it slowed down a little. The main benefit is being able to scratch client side Javascript as a necessity to use the website.

### v3 - Server side
After the move to server side I did another performance audit. 

![v3](https://github.com/hackshackshacks/performance-matters-server-side/blob/master/readme_images/audit_middle.png?raw=true)

As you can see the performance of the app dropped significantly. This was the starting point for my performance upgrades.

## Minifying
I started by minifying JS and CSS assets. I did this by adding the uglify-js and uglify-css packages. Using the following npm script the files are minified on build.
```
"uglify": "browserify assets/js/main.js | uglifyjs > assets/js/bundle.js && uglifycss assets/css/main.css > assets/css/min.css"
```

The CSS minification was done to replace the gulp build that was already in place. For this reason it didn't result in a performance gain.

The JS minification however resulted in the following:

### Before
![pre-minify](https://github.com/hackshackshacks/performance-matters-server-side/blob/master/readme_images/preminify-js.png?raw=true)
### After
![after-minify](https://github.com/hackshackshacks/performance-matters-server-side/blob/master/readme_images/after-minify-js.png?raw=true)

## Gzip
By compressing the text using Gzip I was able to reduce file sizes by over 75%. 

![pre-gzip](https://github.com/hackshackshacks/performance-matters-server-side/blob/master/readme_images/pretext-compress.png?raw=true)

![gzip](https://github.com/hackshackshacks/performance-matters-server-side/blob/master/readme_images/gzip.png?raw=true)

## Async stylesheets
By loading my CSS asynchronously I was able to prevent render blocking from happening. This resulted in a much quicker initial paint.

### Before
![Before](https://github.com/hackshackshacks/performance-matters-server-side/blob/master/readme_images/audit_middle.png?raw=true)

### After
![After](https://github.com/hackshackshacks/performance-matters-server-side/blob/master/readme_images/audit_new.png?raw=true)

## Critical CSS
Using async stylesheets results in html loading before any CSS in most cases. This means you see unstyled content for a split second (or a pretty long time on a slow connection). To prevent this from happening I added the most critical CSS to the HTML document head.

## Conclusion
These optimisations have proven to be significant in the performance of this app. The implimentation cost is minimal and it results in significantly faster loading. 

## Work in progress
This project is far from finished and all contributions are very much welcome. I have made a list of the things I would still like to see incorporated in the app.

* More buildings and posters
* A rewritten slider to replace Flickity.js and JQuery
* Add modern file types to images
