import fs from 'fs/promises'

export const fileDelete = async (file) => {
    if (!file) return;
    try {
        await fs.unlink(file)
        console.log(`File deleted successfully`)
    } catch (error) {
        console.log('Error while deleting the file:', error.message);
    }
}