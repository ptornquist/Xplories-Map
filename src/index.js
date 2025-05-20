"use strict";
exports.__esModule = true;
var react_1 = require("react");
var client_1 = require("react-dom/client");
var App_1 = require("./App");
var rootElement = document.getElementById("root");
var root = client_1["default"].createRoot(rootElement);
root.render(<react_1["default"].StrictMode>
    <App_1["default"] />
  </react_1["default"].StrictMode>);
