# WebView Cookie issue

## Server

Replace `host` and `port` variables inside `index.js` then run:

```bash
npm start
```

A web server will be created with following endpoints:

- / - webpage to demonstrate that the same js code works in browser environment
- /auth - api to get cookie
- /image.png - resource that requires cookie

## Client

Replace `host` and `port` variables inside `App.js` then run:

```bash
npm start
```

Inside `App.js` switch between `html` and `uri` WebView props to see that when you render the same code with `html` prop cookie management doesn't work.