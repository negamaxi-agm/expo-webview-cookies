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
        </head>
        <body>${content}</body>
    </html>
`

const indexTemplate = createTemplate(`
    <textarea id="textarea">
    </textarea>
    <img id="img" style="height: 100px;" />
    <script>
    const textareaElement = document.getElementById("textarea");
    const imgElement = document.getElementById("img")
    
    imgElement.addEventListener("error", (event) => {
        textareaElement.value = textareaElement.value + " | " + "image load failed";
    })

    fetch("${authPathName}").then(response => {
        if (response.ok) {
            textareaElement.value = "authenticated";
            imgElement.src = "${imagePathName}";
        } else {
            textareaElement.value = "authentication failed with response status: " + response.status;
        }
    }).catch(error => {
        textareaElement.value = "failed to connect with server";
    });
    </script>
`)

const appendResWithCORSHeaders = (res) => {
    res.setHeader("Access-Control-Allow-Origin", `*`);
}

const appendResWithAuthHeaders = (res) => {
    // Cookie lifetime is set to 1min
    const expiresInSeconds = 60;
    const expiresDate = new Date(Date.now() + expiresInSeconds * 1000);
    const expiresDateText = expiresDate.toUTCString();

    res.setHeader("Set-Cookie", `${cookieSample}; Path=/; Expires=${expiresDateText}; Max-Age=${expiresInSeconds}`);
}


const requestListener = function (req, res) {
    const { headers, url } = req;

    console.log(url, headers);

    appendResWithCORSHeaders(res);

    if (url === rootPathName) {
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(indexTemplate);
    }

    if (url === authPathName) {
        appendResWithAuthHeaders(res);

        res.writeHead(202);
        res.end();
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
            res.writeHead(401)
            res.end();
        }
    }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});