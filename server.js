import app from './src/app.js'
import config from './src/config/config.js'

const port = config.PORT || 5000;

console.log(port);
app.listen(port, () => {
    console.log(`Server in running on:http//:localhost:${port}`)
})

