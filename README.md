# strong-github-analytics

[![Build Status](https://travis-ci.org/strongloop/strong-github-analytics.svg?branch=master)](https://travis-ci.org/strongloop/strong-github-analytics)

A toolkit that utilizes the strong-github-api for generating analytics data.

## Installation

```
npm i -g strong-github-analytics
sl-gh --help
```

## make-sprint

Use the make-sprint command to generate a common milestone across an
organization's GitHub repositories, or a user's owned repositories.

### Notable Options
- `--org=<orgName>` - The name of your organization in GitHub. For example, if
the URL for your org is `https://github.com/strongloop`, then you'll want to
use `strongloop` as your orgName.
- `--user=<user>` and `--password=<password>` - If you don't have a GitHub token
(really, you should just make one!), then you can use user and password to
authenticate.
- `--title=<title>` - The title of the milestone to create across targets.
- `--description=<desc>` - The text to put into the milestone description.
- `--dryrun` - Will simulate the run to allow you to review and confirm your
targets. Useful if you don't feel like manually deleting dozens of milestones!
For a complete list of options, run `sl-gh make-sprint --help`.

### Example
```
sl-gh make-sprint 2012-12-12 --token=abcdef12345abcdef12345 --org=strongloop --title="Sprint 42"
--description="Sprint to end all sprints!"
```

**Note**: If used under a user's context, this will not generate milestones
for repositories that a user does not own, _even if he/she has appropriate
rights to do so_!
