# Counterfactuals

## TL;DR
This change adds support for counterfactual experiments:

- Query experiment conditions.
- Register experiment tracking properties.
- Sync treatment records over HTTP.

## Testing
### Debug View
The developer can inspect the status of the user in each experiment by accessing the debug menu Counterfactuals item. This view shows the reference for each experiment, and allows the developer to manually treat the user in any of them.

### Manual QA

The following steps were following using the debug build and `googleNowearableDebug` variant.

- Launch the app when logged out.
- Log in.
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
    - Log out and back in, and verify again.
- Query an AB condition using the `AB.java` API (rather than using `getConditionAndTreat` directly).
    - Use the debug view the verify that the user's records were updated.
    - Use the [Duolingo API](https://www.duolingo.com/api/1/experiments/references) to verify that the user's records were updated in the backend.
    - Use the debugger to verify that the correct tracking properties are registered.




