let main = document.querySelector('main')
main.style.display = 'none'
const elements = main.children

let content = document.createElement('pre')
document.body.appendChild(content)

let hiddenElement = document.createElement('pre')
hiddenElement.style.opacity = 0
document.body.appendChild(hiddenElement)

//// VARIABLES ////

let fontSize
let screenWidth
let charsWide

let newContent
let visibleContent
let hiddenContent

let time = 0
let fpsInterval = 100
let then = Date.now(); 
let startTime = then;
let elapsed 

let typeTime = 0
let typeInterval = 10
let typeThen = Date.now(); 
let startType = then; 
let typeElapsed

let currentScroll
let scrollTop
let linesScrolled
let charsScrolled
let realCharsScrolled = 0

let lineHeight

//// FUNCTONS ////

const adjustFont = () => {
    screenWidth = window.innerWidth

    if (screenWidth < 550) {
        fontSize = 12
    } else if (screenWidth >= 550 && screenWidth <= 2000) {
        fontSize = 16
    } else {
        fontSize = Math.floor(screenWidth / 100)
    }

    charsWide = Math.floor(screenWidth / (fontSize * 0.6)) - 1 - 7
    lineHeight = fontSize * 1.2
    document.body.style.fontSize = fontSize + 'px'
}

const fixStrLen = (str, length) => {
    if (str.length < length) {
        return str + ' '.repeat(length - str.length);
    } else if (str.length > length) {
        return str.substring(0, length);
    }
    return str;
}

const heading = (input, level) => {
    input = input.toLowerCase();
    let final = '';

    switch (level) {
        case 'H1':
            input = (input+' ').match(new RegExp(`.{1,${Math.floor(charsWide/8)}} `, 'g')) || [];

            for (let k=0; k<input.length; k++) {
                let string = input[k].trim().split('')

                for (let j = 1; j < 9; j++) {
                    final += ''.padStart(Math.floor((charsWide-string.length*8)/2), '#')
                    for (let i = 0; i < string.length; i++) {
                        final += fixStrLen(h1[string[i]].split('\n')[j], 8);
                    }
                    final += ''.padStart(Math.floor((charsWide-string.length*8)/2), '#')
                    final += '\n';
                }

            }
            
            break;
        case 'H2':
            input = (input+' ').match(new RegExp(`.{1,${Math.floor(charsWide/6)}} `, 'g')) || [];

            for (let k=0; k<input.length; k++) {
                let string = input[k].trim().split('')

                for (let j = 1; j < 5; j++) {
                    for (let i = 0; i < string.length; i++) {
                        final += fixStrLen(h2[string[i]].split('\n')[j], 6);
                    }
                    final += '\n';
                }
                final += '\n'
            }

            break;
        case 'H3':
            input = (input+' ').match(new RegExp(`.{1,${Math.floor(charsWide/4)}} `, 'g')) || [];

            for (let k=0; k<input.length; k++) {
                let string = input[k].trim().split('')

                for (let j = 1; j < 4; j++) {
                    for (let i = 0; i < string.length; i++) {
                        final += fixStrLen(h3[string[i]].split('\n')[j], 4);
                    }
                    final += '\n';
                }
                final += '\n'
            }
            break;
    }

    return final;
}

const processElements = async (timestamp) => {
    newContent = ''

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const text = element.textContent;

        var newElement = '';

        switch (element.tagName) {
            case 'H1':
            case 'H2':
            case 'H3':
                newElement = heading(text, element.tagName);
                break;
            case 'H4':
            case 'H5':
            case 'H6':
                newElement = text.toUpperCase();
                break;
            case 'ASCII-IMAGE':
                newElement = await asciiImage(text.trim(), charsWide, 1);
                break;
            case 'ASCII-VIDEO':
                try {
                    newElement = await asciiVideo(text.trim(), timestamp, charsWide);
                } catch (error) {
                    console.error('Error loading video: ', error)
                    newElement = 'Error loading video.';
                }
                break;
            default:
                newElement = text.toLowerCase();
                break;
        }

        newContent += newElement + '\n';
    }
}

const processString = async (charsWide) => {
    const processedContent = newContent.split('\n').map(function (line, index) {
        return `${String(index).padStart(4, ' ')} | ` + line.padEnd(charsWide, ' ');
    }).join('\n');

    scrollTop = (window.scrollY || document.documentElement.scrollTop) + 0.95 * window.innerHeight;
    linesScrolled = Math.floor(scrollTop / lineHeight);
    charsScrolled = Math.floor(linesScrolled * (charsWide + 7));

    const difference = (charsScrolled - realCharsScrolled);
    if (difference < 0) {
        realCharsScrolled += difference * 0.1;
    } else {
        realCharsScrolled += difference * 0.01;
    }

    realCharsScrolled = Math.floor(Math.min(realCharsScrolled, processedContent.length));

    let lastVisibleIndex = realCharsScrolled;
    while (lastVisibleIndex > 0 && processedContent[lastVisibleIndex - 1] === ' ') {
        lastVisibleIndex--;
    }

    visibleContent = processedContent.slice(0, lastVisibleIndex) + '█';
    hiddenContent = processedContent.slice(lastVisibleIndex);

    content.textContent = visibleContent;
    hiddenElement.textContent = hiddenContent;
};

const update = async () => {
    requestAnimationFrame(update); 

    now = Date.now(); 
    elapsed = now - then; 
    typeElapsed = now - typeThen; 

    if (elapsed > fpsInterval) { 
        then = now - (elapsed % fpsInterval); 
        await processElements(time);
        time++;
    }

    if (typeElapsed > typeInterval) { 
        typeThen = now - (typeElapsed % typeInterval)
        await processString(charsWide);
    }
};


//// EVENT LISTENERS ////

window.addEventListener('resize', adjustFont)

//// INITIAL FUNCTION CALLS ////

adjustFont()
processElements(0)
update()