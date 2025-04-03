const jdenticon = require("jdenticon")

const generateRandomUserProfilePicture = (value) => {
    const size = 200

    const png = jdenticon.toPng(value, size)

    return {
        buffer: png,
        mimetype: 'image/png'
    }
}

module.exports = generateRandomUserProfilePicture