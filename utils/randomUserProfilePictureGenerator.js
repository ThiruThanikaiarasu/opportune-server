const jdenticon = require("jdenticon")
const sharp = require("sharp")

const generateRandomUserProfilePicture = async (value) => {
    const size = 200

    let svg = jdenticon.toSvg(value, size)

    svg = svg.replace(
        /<svg[^>]+>/,
        match => `${match}<rect width="${size}" height="${size}" fill="white"/>`
    )

    const pngBuffer = await sharp(Buffer.from(svg))
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .png()
        .toBuffer()

        console.log(pngBuffer)

    return {
        buffer: pngBuffer,
        mimetype: 'image/png'
    }
}

module.exports = generateRandomUserProfilePicture