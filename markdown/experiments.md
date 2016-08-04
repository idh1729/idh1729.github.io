# Experiments

<!-- MarkdownTOC -->

- Overview
- Terminology
- Architecture
- Usage
- Criteria
- Flags

<!-- /MarkdownTOC -->

## Overview
Experiments is an AB testing framework. It's core purpose is to tag users exposed to an experiment, so that
analysis can ignore users who did not use any part of the app that the experiment affects.

## Terminology

User-specific:
| Name | Type | Description | Example |
| ------- | ------- | ------- | ------- |
| **condition** | *string* | The condition the user will see.  | `"control"`  |
| **contexts** | *array* | The contexts, if any, the user became treated in.  | `['backend']`  |
| **destiny** | *string* | The condition the user would see were they eligible.  | `"experiment"`  |
| **eligible** | *boolean* | Whether the user is eligible to become treated.  | `false`  |
| **treated** | *boolean* | Whether the user saw the condition when eligible.  | `true`  |

Experiment-specific:
| Name | Type | Description | Example |
| ------- | ------- | ------- | ------- |
| **rollout** | *float* | The fraction `0 <= f <= 1` of users included in this expeirment. The rest are ineligible.  | `"control"`  |
| **criterion** | *func* | A function `f: user_id -> bool` that filters users from an experiment.  | N/A  |
| **status** | *string* | `'running'` means a live experiment. any other status is identical to a rollout of `0.0`.  | `'running'`  |

## Architecture

### Event tracking
The supplanting framework corrects this error by adding a new data point: `treated`. This boolean expresses whether the user's test condition was *used*. By only looking at users that have been `treated`, the effects of a tests can be assessed by comparing users that received `condition` to their *counterfactual* cohort.

Since the value of `treated` may change over time - by definition, at most once from `false` to `true` - it is persisted by a store on the backend. To calculate `treated` correctly, the framework places each `condition` within a walled garden, constricting access to a single gate that documents its activity: an `Informant`.

To query a test condition, a client must invoke its `Informant`:
```python
condition = Informant.get_condition_and_treat('pie_test')
if condition == "apple_pie":
    ...
```

The first time a test condition is queried through an `Informant`, the value of `treated` becomes `true`.

![](https://idh1729.github.io/images/diagram1.svg)

By discriminating between users according to their `treated` value, the `Informant` populates tracking properties only with conditions that were used:
```python
tracking_properties.get('pie_test') # 'pumpkin_pie'
tracking_properties.get('color_test') # None, no condition for this test was used
```

This fulfills the function of a seive: only test conditions that were *used* are included as tracking properties, allowing for *counterfactual* analysis of the collected data.

### Persistence
In order for `treated` to remain valid across sessions and clients, it is stored in a database. Whenever an `Informant` updates a `treated` value, it sends a request to the backed.

![](https://idh1729.github.io/images/diagram2.svg)

### Treatment records

Before, we assumed tests never changed. In reality, this happens all the time: tests are launched or shut down, parameters such as rollout are replaced, and as a result test conditions change.

To ensure the semantics of `treated` remain valid in the face of these alterations, another two data points are taken into account. Thus a **treatment record** contains the following entries:

| Name | Type | Description | Example |
| ------- | ------- | ------- | ------- |
| **condition** | *string* | The condition the user will see.  | `"pumpkin"`  |
| **eligible** | *boolean* | Whether the user is eligible to become treated.  | `false`  |
| **destiny** | *string* | The condition the user would see were they eligible.  | `"apple"`  |
| **treated** | *boolean* | Whether the user saw the condition when eligible.  | `true`  |
| **contexts** | *array* | The contexts, if any, the user became treated in.  | `['ate_pie']`  |

#### Eligibility
When creating tests, we can choose to target a specified set of users. For example, we may want to protect special users, such as employees and testers, from experimental conditions.

When `eligible` changes, so can `condition`. When this happens, the meaning of `treated` becomes corrupted, as it is no longer a marker that the user has seen the `condition`.

To get around this, the framework uses `destiny` in lieu of `condition` to generate tracking properties. This new value stays constant across alternations of `eligible` and `condition`, and satisfies this property:
```python
if eligible:
   same = condition == destiny  # True
```


## Usage
### Creating a test

Visit the [dashboard](https://duolingo.com/diagnostics/counterfactuals/dashboard) and click 'Create an experiment'.

#### New user tests

When creating a test, select the `created_after` criterion, and enter a date, e.g. `'2016-01-01'`. All users created on or after that date will be included in the experiment; old users will not be tracker and receive the fallback condition.

*Note*: Criteria parameters are Python literals; you must wrap a date parameter with string quotes. (However, they are evaluated safely and typed checked, so incorrect types are caught early and are never written to our database.)

### Backend
Import `Informant` from `common.lib.experiments.informant`.

```python
from common.lib.experiments.informant import Informant
```

Query a test condition:

```python
user_id = 123456
experiment_name = "backend_test"
condition = Informant.get_condition_and_treat(user_id, experiment_name)
if condition == "experiment":
    ...
```

If you need access to test conditions in multiple places or across platforms, you can use a context to label each condition query:

```python
user_id = 123456
experiment_name = "backend_test"
context = "backend"
condition = Informant.get_condition_and_treat_in_context(user_id, experiment_name, context)
if condition == "experiment":
    ...
```

If you are having trouble importing `Informant`, try moving its import statement to the function or method that makes a condition query:

```python
def should_send_email(user_id):
    from common.lib.experiments.informant import Informant

    experiment_name = "email_test"
    condition = Informant.get_condition_and_treat(user_id, experiment_name)
    return condition == "experiment"
```


### iOS
Query a user's test condition in Objective-C:

```objc
DUOAccountManager *manager = [DUOAccountManager instance];
NSString *condition = [manager getConditionAndTreat:@"ios_border_roundness" inContext:@"rendering_shape"];

switch (condition) {
    case @"round":
        ...
}
```

Accomplish the same thing in Swift:
```swift
let manager = DUOAccountManager.instance()
let condition = manager.getConditionAndTreat("ios_border_roundness", inContext: "rendering_shape")

switch condition {
case "square":
    ...
}
```

### Android
To support a test on Android, the developer must take the following steps.

Define an enum of test conditions and initialize a corresponding `CounterfactualTest`:

```java
public class AB {
    ...

    /**
     * Test conditions for the android_pie_test experiment.
     */
    public static enum AndroidPieTestCondition {
        APPLE_PIE,
        PUMPKIN_PIE,
        CHOCOLATE_EXPLOSION;
    }

    /**
     * A test instance for "android_pie_test".
     */
    public static final CounterfactualTest<AndroidPieTestCondition> ANDROID_PIE_TEST
        = new CounterfactualTest<>("android_pie_test", AndroidPieTestCondition.class);

    ...
}
```

Query a test condition:

```java
import com.duolingo.util.AB;

public class Foo {
    ...

    AndroidPieTestCondition condition = AB.ANDROID_PIE_TEST.getConditionAndTreat("bar_context");

    switch (condition) {
        case AB.AndroidPieTestCondition.APPLE_PIE:
            ...
    }

    ...
}
```

### Web

Query a test condition:
```js
var informant = require('util/duolingo-informant');
var condition = informant.getConditionAndTreat('web_pie_test', 'view_context');

switch (condition) {
    case "apple_pie": {
        ...
    }
    ...
}
```

## Criteria
Each experiment can target user subcohorts by attaching criteria. A criterion is a function
from `user_id` to `bool`. A user whose ID evaluates to `False` is ineligible.

Define a criterion:
```python
# common.lib.experiments.criterion

@criterion
def not_trial(user_id):
    """Not a trial user."""
    user = get_user_by_id(user_id, use_detached_user=True)
    return not user.is_trial_user()
```

With parameters controlled from the dashboard:
```python
# common.lib.experiments.criterion

@criterion(
    signatures=[
        ('date', str, False), # A criterion can include parameters controlled from the dashboard
    ]
)
def created_after(user_id, date):
    """User created after given date."""
    user = get_user_by_id(user_id, use_detached_user=True)
    creation_date = user.datetime
    return creation_date >= datetime.datetime.strptime(date, _DATE_FORMAT)
```

## Flags
Given a user ID, criteria can use any data accessible on the monolith to calculate a return value
`bool`. Microservices that use Experiments may want to use criteria to determine eligibility. A
problem arises when data relevant to eligibility is not available from the monolith.

Flags allow microservices to post primitive values to Experiments that can later be used to evaluate a criterion.

Define a flag:
```python
# common.lib.experiments.flag

SchoolsClassroomsFlag = Flag(
    name='schools_classrooms',
    signatures=[
        Signature(
            keyword='has_classrooms',
            type_=bool,
            optional=False,
            default=False,
        ),
    ],
)
```

Use flag values in a criterion:
```python
# common.lib.experiments.criterion

@criterion(
    flags=[SchoolsClassroomsFlag],
    allow_caching=False,
)
def is_not_schools(user_id, classrooms_values):
    """User is neither a teacher nor a student in Schools"""
    return not classrooms_values.has_classrooms
```

Update user flag values:
```
curl 'http://localhost:8080/api/1/experiments/flags' \
--data '{"user_ids": ["12345"], "flag_name": "schools_classrooms", "values": {"12345": {"has_classrooms": true}}}'
```

