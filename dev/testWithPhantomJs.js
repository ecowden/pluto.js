/*
 * Original source:
 * http://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&ved=0CFMQFjAA&url=http%3A%2F%2Fblog.danmerino.com%2Fcontinuos-integration-ci-for-javascript-jasmine-and-teamcity%2F&ei=5BwGUI6kLoec8gS98aH1Bw&usg=AFQjCNECxWuvPOLLzzYezUm97NNzLYX_GQ
 */
console.log('Loading a web page');
var page = require("webpage").create();

if (phantom.args.length !== 2) {
    console.log("Usage: \"phantomjs testWithPhantom.js testPagePath screenshotFile\"");
}

var url = phantom.args[0];
var screenshotFile = phantom.args[1];
/*
 * Ugly but effective translation of Windows paths to something PhantomJS finds acceptable.  Necessary since
 * my build box is windows and passes in paths accordingly.  Should not interfere with Unix builds.
 */
function escapePathForWindows(path) {
    return path.replace("C:", "localhost").replace("\\", "/");
}
url = escapePathForWindows(url);
screenshotFile = escapePathForWindows(screenshotFile);

console.log("Test URL: " + url);
phantom.viewportSize = {width: 800, height: 600};

function finish() {
    page.render(screenshotFile);
    phantom.exit();
}
//This is required because PhantomJS sandboxes the website and it does not show up the console messages form that page by default
page.onConsoleMessage = function (msg) {
    console.log(msg);

    if (msg && msg.indexOf("##jasmine.reportRunnerResults") !== -1) {
        finish();
    }
};
//Open the website

page.open(url, function (status) {
    //Page is loaded!
    if (status !== 'success') {
        console.log('Unable to load the address!');
    } else {
        //Using a delay to make sure the JavaScript is executed in the browser
        window.setTimeout(function () {
            finish();
        }, 2000);
    }
});