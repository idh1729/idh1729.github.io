# A/A testing

- Author: [Itai Hass](https://github.com/idh1729)
- Reviewer: [Chris Denter](https://github.com/dennda)
- Status: Not implemented

## TL;DR
This change adds an A/A counterfactuals test to LA. This test will be queried on *show home*, and will not affect users. It serves as a sanity check for the soundness of the counterfactuals implementation.

## Detailed Changes

### Initialization
We will create a test `ios_26_no_op` from the [counterfactuals dashboard](https://metrics.duolingo.com/counterfactuals).

###
In `DUOAnalytics`, a call to get a condition for `ios_26_no_op` will be added to the block in which *show home* is tracked.

```diff
 - (void)trackShowHomeIfReady
{
    DUOUserModel *userModel = [DUOAccountManager instance].user;
    if (self.shouldTrackShowHome && (![[DUOWebManager instance] internetIsReachableForceCheck:YES] || self.updatedUserModelSinceShowHome) && userModel.username) {
        _shouldTrackShowHome = NO;
        self.updatedUserModelSinceShowHome = NO;
        [self trackEvent:@"show home"];
+       [[DUOAccountManager instance] getConditionAndTreat:@"ios_26_no_op" inContext:@"show home"];
    }
}
```

## Testing
- Trigger *show home* on a testing device or simulation, and verify that behavoir is tracked to Mixpanel.
- Verify the above works for an existing user, trial account, and newly created user.




