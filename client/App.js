import { WebView } from "react-native-webview";

const host = '192.168.100.82';
const port = 8000;

const serverURL = `http://${host}:${port}`;

const authURL = `${serverURL}/auth`; 
const imageURL = `${serverURL}/image.png`; 

export default function App() {

  const html = `
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
    <body>
      <textarea id="textarea">
      </textarea>
      <img id="img" style="height: 100px;" />
      <script>
        const textareaElement = document.getElementById("textarea");
        const imgElement = document.getElementById("img")
        
        imgElement.addEventListener("error", (event) => {
          textareaElement.value = textareaElement.value + " | " + "image load failed";
        })

        fetch("${authURL}").then(response => {
          if (response.ok) {
            textareaElement.value = "authenticated";
            imgElement.src = "${imageURL}";
          } else {
            textareaElement.value = "authentication failed with response status: " + response.status;
          }
        }).catch(error => {
            textareaElement.value = "failed to connect with server";
        });
      </script>
    </body>
  </html>
  `;

  return (
    <WebView
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: "black",
      }}
      source={{
        html, // Cookie management doesn't work
        // uri: serverURL // Cookie management works
      }}
    />
  );
}
