# Counterfactuals

## TL;DR
This change adds support for counterfactual experiments:

- Query experiment conditions.
- Register experiment tracking properties.
- Sync treatment records over HTTP.

## Detailed Changes
### Informant
The module `DUOCounterfactualTracking.swift` defines an `Informant` class that exposes two methods:

- `getConditionAndTrack(experimentName)`: Returns a string condition for the experiment. If the user is treated for the first time, a non-blocking request is sent over HTTP to update treatment records in the backend.
- `getTrackingProperties()`: Returns a map of experiment tracking properties that can be registered as super properties.

### Web Manager
The `DUOWebManager` module is extended to support two calls:

- `treatInContext(experimentName, context)`: Sends a POST request to update treatment records of a single experiment in an optional context.
- `batchTreatInContext(recordUpdateList)`: Compiles a collection of outstanding updates to the treatment records into one POST request sent to the backend.

### Account Manager
The `DUOAccountManager` module exposes the single method required by a developer writing code that uses an experiment:

- `getConditionAndTreat:(NSString *)experimentName inContext:(NSString *)context`: Returns the experiment condition assigned to the user, provided that an experiment was created using the [Experiment Dashboard](https://metrics.duolingo.com/counterfactuals). If any information about the experiment is missing, this method returns `"control"`.

### Implementation
![Implementation](https://idh1729.github.io/images/ios-counterfactuals-implementation.svg)

## How to Test


