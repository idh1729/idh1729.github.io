# Rapid Content Deployment

* Author(s): [Itai Hass](https://github.com/idh1729)
* Reviewer(s): [Severin Hacker](https://github.com/severinhacker)

## Introduction
Currently, client changes large and small take place in the client code base, and reach users through app releases. The goal of this proposal is to be able to test new (simple) features and run rich campaigns without an app update.


## Motivation
As our client code bases grow and more developers make contributions, the process to add features to the next release becomes longer. This process helps keep the code base healthy, allowing new features to be added efficiently, and the code base to be re-architected ed safely. But isolated adjunct views, such as alerts of a released product or invitations to try out a feature, remain bound to the app release cycle, restricting control of distribution and slowing down content iteration.

Further, different architectures and release cycles across clients make it hard to synchronize content distribution across clients. Even minute changes to paragraph phrasing lie at the helm of each release cycle. By implementing generalized views on each client, we can distribute content dynamically over the network. Once data is made available, such a view renders the received content, which remains in control by the host. Doing so allows setting in motion, modifying and shutting down content distribution both manually and programatically, without writing client changes that become shelved until the next app release.

This proposal seeks to implement such a view as a *web view*, which supports a wide gamut of functionality and allows greater code reuse across clients.

## Proposed Solution
Establish a web view on each client that can be displayed at any point in the control flow. To determine content, location, and other conditions that govern this view, introduce a `"rapid"` field to the user model, containing

- Routes to web content
- Client-specific metadata (e.g. Android XML layouts)
- Content metadata (e.g. when content should be displayed)

Developers will use an internal dashboard to manage these entries, providing comprehensive control over content distribution.

## Detailed Design
### Content model
The state of `Content` instances will govern a `"rapid"` field on the user model. A `Content` class has the following fields:

| Field | Type | Description |
|:-----:|:----:| ----------- |
|*name*|*string*| A unique name for the content.|
|*url*|*string*| A path such as `https://rapid.duolingo.com/nps` to a live web view.|
|*placement*|*string*| A unique placement tag, e.g. `"show_home"`, `"session_end"`, according to which clients position content.|

When a `Content` is created, it is placed within a `ContentGroup`. (`Content` instances said to be variants of one another should share a `ContentGroup`.) An AB test is programatically initialized with one condition for each group item, and another `"no_show"` condition. The backend will populate the `"rapid"` field according to a standard condition lookup, which will be repeated by the client to tighten the condition groups.

By means of its associated AB test, a `ContentGroup` attains state:

| Value |  Description |
|:-----:| ----------- |
|`SHUT_DOWN`| Content reaches no-one |
|`RUNNING`| Content reach randomly selected subpopulation according to a distribution across variants.|
|`LAUNCHED`| A single variant reaches everyone and no behavioral tracking is performed.|

#### Population targeting
The developer will target a user subpopulation by attaching a criterion to the associated AB test when initializing a `ContentGroup`.

#### User model field
A field `"rapid"` will be added to the user model. A JSON value will represent `Content` fields, as in this example:

```python
[
    {
        'name': 'nps',
        'url': 'https://rapid.duolingo.com/nps',
        'placement': 'show_home'
    }, {
        'name': 'flashcards_alert',
        'url': 'https://rapid.duolingo.com/flashcards_alert',
        'placement': 'session_end'
    }
]
```

### Implementation
This proposal outlines implementation on Android. Currently, no specification is made for iOS or Windows.

In Android, the `WebView` class displays web pages. Its WebKit engine renders full-fledged sites, and the `@JavascriptInterface` decorator exposes Java methods to Javascript.

A `WebView` instance will be placed in an activity `RapidActivity`. A `RapidManager` will read the `"rapid"` field on the user model, and will start `RapidActivity` with the appropriate arguments. If 

Spawning a `WebView` is simple.
```java
WebView webView = new WebView(this);
webView.getSettings().setJavaScriptEnabled(true);
webView.addJavascriptInterface(new WebAppInterface(this), "Android");
webView.loadUrl("https://rapid.duolingo.com/nps.html");
```

Just as easily, we can expose Java methods to Javascript.
```java
/** Show a toast from the web page */
@JavascriptInterface
public void submitNPS(Integer score, String message) {
    Toast.makeText(mContext, message, Toast.LENGTH_SHORT).show();
}

/** Kill the web view */
@JavascriptInterface
public void finish() {
    RapidActivity.this.closeRapidActivity();
}
```

Exposed methods are made available through a global object.
```javascript
function submitNPS(score) {
    Android.submitNPS(score, "Goodbye");
}
```

#### Interface
When a user is done interacting with a web view, Javascript invokes the `Android.finish(data)`, where `data` contains useful informant for the client to transition back to the previous view.

```javascript
var data = {
    events: [{
        name: 'nps_score',
        properties: {promoter: true}
    }],
}

Android.finish(data);
```

In the above example, `data` contains a list of events that the client should include in behavioral tracking. This and other clean up logic is executed by the `RapidManager`.

### Infrastructure
This section, outlining the use of a DynamoDB table to store created `Content`, will be included soon...
