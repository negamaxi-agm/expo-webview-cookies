const http = require("http");
const fs = require('fs');

const host = '0.0.0.0';
const port = 8000;
const cookieSample = 'key=value';

const rootPathName = '/';
const authPathName = '/auth';
const imagePathName = '/image.png';

const createTemplate = (content) => `
    <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                html {
                    background: white;
                }
                body {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    justify-content: center;
                }
            </style>
        </head>
        <body>${content}</body>
    </html>
`

const unauthenticatedIndexTemplate = createTemplate(`
    <form action="${authPathName}" method="POST">
        <input type="submit" value="authenticate" />
    </form>
    <a href="${imagePathName}">view image</a>
`)

const authenticatedIndexTemplate = createTemplate(`
    <h1>Authenticated</h1>
    <a href="${imagePathName}">view image</a>
`)

const appendResWithCORSHeaders = (res) => {
    res.setHeader("Access-Control-Allow-Origin", `*`);
}

const appendResWithAuthHeaders = (res) => {
    // Cookie lifetime is set to 1min
    const expiresInSeconds = 60;
    const expiresDate = new Date(Date.now() + 1000 * expiresInSeconds);
    const expiresDateText = expiresDate.toUTCString();

    res.setHeader("Set-Cookie", `${cookieSample}; Path=/; Expires=${expiresDateText}; Max-Age=${expiresInSeconds}`);
}


const requestListener = function (req, res) {
    const { headers, url } = req;

    console.log(url, headers);

    appendResWithCORSHeaders(res);

    if (url === rootPathName) {
        res.setHeader("Content-Type", "text/html");
        res.setHeader('Cache-Control', 'no-store');

        res.writeHead(200);

        if (headers.cookie === cookieSample) {
            res.end(authenticatedIndexTemplate);
        } else {
            res.end(unauthenticatedIndexTemplate);
        }
    }

    if (url === authPathName) {
        appendResWithAuthHeaders(res);

        res.setHeader('Content-type','application/json');
        res.writeHead(202);
        res.end('{ authenticated: true }');
    }

    if (url === imagePathName) {
        if (headers.cookie === cookieSample) {
            fs.readFile('./image.png', function (err, content) {
                if (err) {
                    res.writeHead(404, {'Content-type':'text/html'})
                    res.end("Not found");
                } else {
                    res.writeHead(200,{'Content-type':'image/png'});
                    res.end(content);
                }
            });
        } else {
            res.writeHead(401, {'Content-type':'text/html'})
            res.end("<h1>Unauthorized</h1>");    
        }
    }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});