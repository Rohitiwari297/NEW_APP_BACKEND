import app from './src/app.js'
import config from './src/config/config.js'

const port = config.PORT || 7878;
//start the server
console.log(port);
app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}`)
})