const characterShades = ' ,,x"}/d"\\{&*9F#';

const GrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;

const getAvgShade = (data, sourceWidth, x, y, width, height) => {
    let totalShade = 0;
    let pixelCount = 0;

    for (let sy = 0; sy < height; sy++) {
        for (let sx = 0; sx < width; sx++) {
            const pixelX = x + sx;
            const pixelY = y + sy;

            if (pixelX < sourceWidth && pixelY < data.length / 4 / sourceWidth) {
                const index = (pixelY * sourceWidth + pixelX) * 4;
                const shade = GrayScale(data[index], data[index + 1], data[index + 2]);
                totalShade += shade;
                pixelCount++;
            }
        }
    }

    return pixelCount > 0 ? totalShade / pixelCount : 0;
};

const findChar = (totalAvg, avg1, avg2, avg3, avg4) => {
    const charAvg = (avg1 + avg2 + avg3 + avg4) / 4;
    const threshold = (totalAvg + charAvg * 5) / 6;
    const index = parseInt([avg1, avg2, avg3, avg4].map(v => v >= threshold ? '1' : '0').join(''), 2);
    return characterShades[index];
};

const getSegShades = (data, sourceWidth, sourceHeight, charsWide) => {
    const segWidth = Math.ceil(sourceWidth / (charsWide * 2));
    const segHeight = segWidth * 2;

    let segments = [];
    let totalAvg = 0;
    let pixelCount = 0;

    for (let segmentY = 0; segmentY < sourceHeight; segmentY += segHeight) {
        let segmentRow = [];

        for (let segmentX = 0; segmentX < sourceWidth; segmentX += segWidth) {
            let segmentShade = getAvgShade(data, sourceWidth, segmentX, segmentY, Math.min(segWidth, sourceWidth - segmentX), Math.min(segHeight, sourceHeight - segmentY));
            segmentRow.push(segmentShade);
            totalAvg += segmentShade;
            pixelCount++;
        }

        segments.push(segmentRow);
    }

    totalAvg /= pixelCount;

    return [segments, totalAvg];
};

const segToAscii = (segments, charsWide, totalAvg, charsScreen) => {
    let final = '';

    for (let row = 0; row < segments.length - 1; row += 2) {
        let characterRow = ' '.padStart(Math.floor((charsScreen - segments[row].length / 2) / 2), ' ');
        for (let topLeftSeg = 0; topLeftSeg < segments[row].length - 1; topLeftSeg += 2) {
            characterRow += findChar(totalAvg, segments[row][topLeftSeg], segments[row][topLeftSeg + 1], segments[row + 1][topLeftSeg], segments[row + 1][topLeftSeg + 1]);
        }
        characterRow += ' '.padEnd(Math.floor((charsScreen - segments[row].length / 2) / 2), ' ')
        final += characterRow + '\n';
    }

    return final;
};

const imageCache = {};

const getData = async (url) => {
    if (imageCache[url]) {
        return imageCache[url];
    } else {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;

            img.onload = async () => {
                const { width: sourceWidth, height: sourceHeight } = img;

                const canvas = document.createElement('canvas');
                canvas.width = sourceWidth;
                canvas.height = sourceHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const data = ctx.getImageData(0, 0, sourceWidth, sourceHeight).data;

                imageCache[url] = { data, sourceWidth, sourceHeight };

                resolve(imageCache[url]);
            };
            img.onerror = () => {
                reject(new Error('Image failed to load'));
            };
        });
    }
};

const asciiImage = async (url, charsWide, sizeMultiplier) => {
    const { data, sourceWidth, sourceHeight } = await getData(url); 

    const [segments, totalAvg] = getSegShades(data, sourceWidth, sourceHeight, Math.floor(charsWide * sizeMultiplier));
    const asciiArt = segToAscii(segments, Math.floor(charsWide * sizeMultiplier), totalAvg, charsWide);

    return asciiArt;
};

const asciiVideo = async (url, timestamp, charsWide) => {
    url = url.split(' ');

    timestamp = String(timestamp % (url[1]) + 1).padStart(4, '0');

    let sizeMultiplier = url[2] ? url[2] : 1; 

    const newUrl = `${url[0]}/${timestamp}.jpg`;
    return await asciiImage(newUrl, charsWide, sizeMultiplier);
};
