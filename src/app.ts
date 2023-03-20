import createError from "http-errors"
import express from "express"
import cors from "cors"
import path from "path"
import cookieParser from "cookie-parser"
import logger from "morgan"
import http from "http"

import conversationRouter from "./routes/conversation"
import liveChatRouter from "./routes/live-chat"
import audioRouter from "./routes/audio"

const app = express()

app.use(logger("dev"))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

app.use("/robots.txt", function (req, res, next) {
    res.type("text/plain")
    res.send("User-agent: *\nDisallow: /")
})

app.use("/conversation", conversationRouter)
app.use("/live", liveChatRouter)
app.use("/audio", audioRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get("env") === "development" ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render("error")
})

var port = normalizePort(process.env.PORT || "4000")
app.set("port", port)

/**
 * Create HTTP server.
 */
var server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port)
server.on("error", onError)

console.log(`**** Server now up and running on port ${port} ****\n`)

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== "listen") {
        throw error
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges")
            process.exit(1)
            break
        case "EADDRINUSE":
            console.error(bind + " is already in use")
            process.exit(1)
            break
        default:
            throw error
    }
}

function normalizePort(val) {
    var port = parseInt(val, 10)

    if (isNaN(port)) {
        // named pipe
        return val
    }

    if (port >= 0) {
        // port number
        return port
    }

    return false
}
