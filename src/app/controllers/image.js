const { Hono } = require('hono');
const { getRouterName, showRoutes } = require('hono/dev');
const debug = require('debug')('nodejs-api-image-processing:controllers->image');
const qs = require('qs');
const { Readable } = require('stream');
const sharp = require('sharp');
const controller = new Hono();
const whiteBackground = [255, 255, 255];

const getFileName = (url) => {
  const urlObject = new URL(url);
  const urlParts = urlObject.pathname.split('/');
  let name = urlParts[urlParts.length - 1];
  if (!name && urlParts.length > 1) {
    name = urlParts[urlParts.length - 2];
  }
  return name;
};

function convertParamsValueStringToNumber(param) {
  if (Array.isArray(param)) {
    return param.map(value => convertParamsValueStringToNumber(value));
  }

  if (param !== null && typeof param === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(param)) {
      result[key] = convertParamsValueStringToNumber(value);
    }
    return result;
  }

  const intValue = parseInt(param, 10);
  if (!isNaN(intValue) && intValue.toString() === param) {
    return intValue;
  }

  const floatValue = parseFloat(param);
  if (!isNaN(floatValue) && floatValue.toString() === param) {
    return floatValue;
  }

  return param;
}

const modifyRotation = (rotation) => {
  if (!rotation)
    return 0;

  if (Array.isArray(rotation)) {
    let [angle, options] = rotation;
    let bg = options && (options.bg || options.background);
    if (!bg)
      bg = whiteBackground; // white background instead of black

    return [angle, { background: bg }];
  } else if (rotation && typeof rotation === 'object') {
    let { angle, bg, background } = rotation;
    bg = bg || background;
    return [angle, { background: bg }];
  } else {
    return [rotation, { background: whiteBackground }];
  }
};

// Apply image transformations based on query string parameters
// example: /images?format=jpg&sharpen%5Bsigma%5D=0.5&sharpen%5Bx1%5D=0.8
// { "format": "jpg", "sharpen": { "sigma": 0.5, "x1": 0.8 } }
const applyImageTransformations = (transformMethods, transformer) => {
  if (transformMethods.rotate)
    transformMethods.rotate = modifyRotation(transformMethods.rotate);

  // Loops through the image transformation methods and applies them to sharp
  for (let [method, options] of Object.entries(transformMethods)) {
    if (sharp.prototype[method]) {
      debug('processImage: applying', method, options);

      options = convertParamsValueStringToNumber(options);
      try {
        if (Array.isArray(options))
          transformer[method](...options);
        else
          transformer[method](options);
      } catch (error) {
        debug('processImage: Error applying method', method, error);
      }
    } else
      debug('processImage: method not found', method);
  }
};

// refer to: https://sharp.pixelplumbing.com/api-operation
async function processImage(url, transformMethods) {

  // Download the image from the URL
  let response_body, response_headers;
  try {
    const response = await fetch(url);
    response_body = response.body;
    response_headers = response.headers;
  } catch (error) {
    debug('Error fetching image', error);
    throw error;
  }

  return new Promise((resolve, reject) => {
    try {
      const readableStream = Readable.fromWeb(response_body);

      let imageFormat = response_headers.get('content-type') || 'image/jpeg';

      // Inits sharp
      const transformer = sharp();

      // Applies image transformations
      if (transformMethods.toFormat) {
        if (Array.isArray(transformMethods.toFormat))
          imageFormat = `image/${transformMethods.toFormat[0]}`;
        else
          imageFormat = `image/${transformMethods.toFormat}`;
      }

      applyImageTransformations(transformMethods, transformer);

      const handleEnd = () => {
        debug('End of image input stream');

        transformer.toBuffer({ resolveWithObject: true })
          .then(({ data, info }) => {
            debug('Image processed information', info);

            // Return response with transformed stream
            resolve(new Response(data, {
              headers: {
                'Content-Type': imageFormat,
                'Content-Disposition': `inline; filename="${getFileName(url)}"`,
                'Content-Length': info.size,
              },
            }));
          })
          .catch((error) => {
            debug('Error converting to buffer', error);
            reject(error);
          });
      };

      readableStream.on('error', (error) => {
        console.log('Error piping image input stream', error);
        reject(error);
      }).on('end', handleEnd).pipe(transformer);
    } catch (error) {
      debug('Error processing image', error);
      reject(error);
    }
  });
}

controller.use('/', async (context) => {
  try {
    const queryParams = qs.parse(context.req.url.split('?').pop());
    // debug('queryParams', queryParams);

    let { url, u, format, bg, background, ...transformMethods } = queryParams || {};
    const bodyParams = await context.req.json().catch(() => ({}));
    // debug('bodyParams', bodyParams);

    url = url || u;
    if (bodyParams.url) {
      url = bodyParams.url;
      delete bodyParams.url;
    }
    if (bodyParams.u) {
      url = bodyParams.u;
      delete bodyParams.u;
    }

    if (!url)
      return context.json({ error: 'URL is required' }, 400);

    // check if url is a valid URL
    try {
      new URL(url);
    } catch /*(error)*/ {
      return context.json({ error: 'Invalid URL' }, 400);
    }

    if (bodyParams.format) {
      format = bodyParams.format;
      delete bodyParams.format;
    }
    if (bodyParams.bg) {
      bg = bodyParams.bg;
      delete bodyParams.bg;
    }
    if (bodyParams.background) {
      background = bodyParams.background;
      delete bodyParams.background;
    }

    if (Object.keys(bodyParams).length > 0)
      transformMethods = bodyParams;

    // debug({ url, transformMethods });

    if (format)
      transformMethods.toFormat = format;

    bg = bg || background;
    if (bg && !transformMethods.flatten) {
      const toFormat = (transformMethods.toFormat || transformMethods.format || '').toLowerCase();

      if (toFormat === 'jpeg' || toFormat === 'jpg')
        transformMethods.flatten = { background: whiteBackground }; // white background instead of black
    }

    return await processImage(url, transformMethods);
  } catch (error) {
    debug('Error processing image', error);
    return context.json({ error: error.message }, 500);
  }
});


debug(getRouterName(controller));
showRoutes(controller, {
  verbose: true,
});

module.exports = controller;
