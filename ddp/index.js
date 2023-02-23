const playBtn = document.getElementById('playbtn')
const canvas = document.getElementById('badapple')
const messageElem = document.getElementById('messageText')
const warnElem = document.getElementById('warnText')
const volumeElem = document.getElementById('volumeText')

const ctx = canvas.getContext('2d')
let currentOffset = 0
var lastPixelData = {}

var audio
var resJson
var lyricsJson
var intervalId
var lagCount = 0

// padding-x: 3rem
const padX = 2 * 3 * 16
const width = Math.min((window.innerWidth > 0 ? window.innerWidth : screen.width) - padX, 640)
const multip = width / 640

onload = async function () {
    try {
        audio = new Audio('audio.ogg')
        volumeElem.innerText = (audio.volume * 100).toString() + "%"
        let res = await axios.get('./frames.gz', {
            onDownloadProgress: (progressEvent) => {
                messageElem.innerText = `Loading... ${Math.floor((progressEvent.loaded / progressEvent.total) * 100)}%`
            },
            responseType: 'arraybuffer',
        })
        let resBuf = res.data

        resJson = JSON.parse(new TextDecoder().decode(pako.ungzip(resBuf)))
        // Clear memory
        resBuf = null
        res = await fetch('./lyrics.json')
        lyricsJson = await res.json()

        messageElem.innerText = 'Loaded.'
        playBtn.style.display = 'block'
        canvas.style.display = 'block'

        canvas.width = width
        canvas.height = 480 * multip
    } catch {
        messageElem.innerText = 'Load failed!'
    }
}

function changeVolume(value) {
    audio.volume = Number(value) / 100
    volumeElem.innerText = (audio.volume * 100).toString() + "%"
}

async function startDraw() {
    if (currentOffset >= 100) {
        messageElem.innerHTML = "See Bad Apple version <a href='..'>here</a>!"
    }

    // Clear and redraw background
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    let currFrame = resJson[currentOffset]
    for (let i = 0; i < currFrame.length; i++) {
        // [x, y, w, h, alpha]
        let curr = currFrame[i]

        let alpha = curr[4]
        let w = curr[2] + 1
        let h = curr[3] + 1
        let x = curr[0] - w / 2
        let y = curr[1] - h / 2

        let value = 255 * alpha
        ctx.fillStyle = `rgb(${value}, ${value}, ${value})`
        ctx.fillRect(x * multip, y * multip, w * multip, h * multip)
    }
}

function start() {
    playBtn.remove()
    audio.play()

    intervalId = setInterval(async () => {
        await startDraw()
        let expectedOffset = Math.floor(audio.currentTime / (1 / 25))
        if (currentOffset > expectedOffset) {
            // We are way too quick! let's just wait until we match the offset :)
            return
        }

        let deltaOffset = Math.abs(currentOffset - expectedOffset)
        if (deltaOffset > 20) {
            lagCount += 1
            currentOffset = expectedOffset
            warnElem.style.display = 'block'
        } else if (deltaOffset > 10) {
            currentOffset = expectedOffset
        } else {
            currentOffset += 1
        }

        if (lyricsJson.length > 0 && currentOffset >= lyricsJson[0][0]) {
            messageElem.innerText = lyricsJson[0][1]
            lyricsJson.splice(0, 1)
        }
    }, 1000 / 25)
}
