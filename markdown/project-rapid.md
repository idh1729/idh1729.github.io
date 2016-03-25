# Rapid Content Deployment

* Author(s): [Itai Hass](https://github.com/idh1729)
* Reviewer(s): [Severin Hacker](https://github.com/severinhacker)

## Introduction
Currently, client changes as small as isolated views and alerts take place in the client code base, and reach users through app releases. This proposal seeks to allow pushing simple content directly to users, bypassing the app release process.

## Motivation
As our client code bases grow and more developers make contributions, the process to add features to the next release becomes longer. This process helps keep the code base healthy, allowing new features to be added efficiently, and the code base to be rearchitected safely.

However, different architectures and release cycles across clients make it hard to synchronize content distribution. Even minute changes to paragraph phrasing lie at the helm of each client's release cycle. By implementing a generalized view on each client, we can dynamically distribute content over the network. Once data is made available, such a view would render the received content, which remains in control by the host. Doing so allows deploying, modifying and shutting down content distribution both manually and programatically, without writing client changes that become shelved until the next app release.

This proposal seeks to implement such a view as a *web view*, which supports a wide gamut of functionality and allows greater code reuse across clients.

## Proposed Solution
Establish a web view on each client that can be displayed at any point in the control flow. To determine content, location, and other conditions that govern this view, introduce a `"rapid"` field to the user model, containing

- Routes to web content
- Client-specific metadata (e.g. Android XML layouts)
- Content metadata (e.g. when content should be displayed)

Developers will use an internal dashboardboard to manage these entries, allowing virtually total control over content distribution.

## Detailed Design
### Content model
The state of `Content` instances will govern the `"rapid"` field on the user model. A `Content` class has the following fields:

| Field | Type | Description |
|:-----:|:----:| ----------- |
|*name*|*string*| A unique name for the content.|
|*url*|*string*| A path such as `https://rapid.duolingo.com/nps` to a live web view.|
|*placement*|*string*| A unique placement tag, e.g. `"show_home"`, `"session_end"`. Clients position content in the user flow accordingly.

When a `Content` is created, it is placed within a `ContentGroup`. (`Content` instances said to be variants of one another should share a `ContentGroup`.) An AB test is programatically initialized with one condition for each group item, and another `"no_show"` condition. The backend will populating the `"rapid"` field according to a standard condition lookup, which will be repeated by the client to tighten the condition groups.

By means of its associated AB test, a `ContentGroup` attains state:

| Value |  Description |
|:-----:| ----------- |
|`SHUT_DOWN`| Content reaches no-one |
|`RUNNING`| Content reach randomly selected subpopulation accoring to a distribution across variants.|
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
        'placement': 'show_home',
    },
    {
        'name': 'flashcards_alert',
        'url': 'https://rapid.duolingo.com/flashcards_alert',
        'placement': 'session_end',
    },
]
```

### Client model
This proposal outlines implementation on Android. Currently, no specification is made for iOS or Windows.

#### Android WebViews






