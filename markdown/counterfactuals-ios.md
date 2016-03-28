# Counterfactuals

## TL;DR
This change adds support for counterfactual experiments:

- Query experiment conditions.
- Register experiment tracking properties.
- Sync treatment records over HTTP.

## Detailed Changes
### Informant
The module `DUOCounterfactualTracking.swift` defines an `Informant` class that exposes two methods:

- `getConditionAndTreat(experimentName)`: Returns a string condition for the experiment. If the user is treated for the first time, a non-blocking request is sent over HTTP to update treatment records in the backend.
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

## Testing
### Debug View
The developer can inspect the status of the user in each experiment by accessing the test settings view:

![Experiments](https://idh1729.github.io/images/ios-counterfactuals-screens.png)

### Manual QA

- Launch the app when logged in.
- Use the debug view to treat user in an experiment.
    - Verify that records were updated in the backend using the [Duolingo API](https://www.duolingo.com/api/1/experiments/references).
- Sign out, and start a trial account.
- Use the debug view to verify that previous records were scraped, as this is a new (trial) user.
- Use the debug view to treat the trial user in an experiment.
    - Kill app, relaunch, and verify that records are up-to-date using the debug view.
- Sign out, and sign back in with an existing account.
- Use the debug view to verify the trial user's records were scraped, and the current user's records were loaded.
- Use the debug view to treat the user in an experiment they are ineligible for.
    - Verify that their records were not updated, as the user is ineligible.
- Sign out, start a trial account, and use the debug view to treat the trial user in an experiment.
- Proceed to create a profile for the trial user.
    - Use the debug view to verify that the trial user's records persisted across creating a profile.
- Insert a `getConditionAndTreat` call when the user enters the Store.
    - Use the debug view the verify that the user's records were updated.
    - Use the [Duolingo API](https://www.duolingo.com/api/1/experiments/references) to verify that the user's records were updated in the backend.
    - Use the debugger to verify that the correct tracking properties are registered.
- Repeat the same process using a different context in the `getConditionAndTreat`.
    - Verify that the different contexts are bundled together in the debug view, [Duolingo API](https://www.duolingo.com/api/1/experiments/references), and tracking properties.
- Go offline and use the debug menu to treat the user.
- Go online, sync the user model (you can do this by completing a session).
    - Verify that the offline treatment is reported to the backend.
    - Verify that the offline treatment was not overwritten during the user model sync.




