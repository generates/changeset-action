# Changeset Action
> Automate adding a changeset for simple pull requests

## About

This action works with the [changesets][changesetsUrl] versioning tool to allow
you to automate the creation of changesets typically for automated code creation
tools like [renovate][renovateUrl] or [dependabot][dependabotUrl] that keep your
dependencies up-to-date. You can also use it to manually add a changeset by
providing inputs without having to use the changesets CLI.

## Usage

[See the action being used in this repository][workflowUrl].

```yml
name: Changeset
on:
  pull_request:
    types: [labeled]
jobs:
  changeset:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - name: Changeset
        uses: generates/changeset-action@v2.0.0
      - name: Commit Changes
        uses: generates/commit-action:v1.0.1
        with:
          token: ${{ secrets.GH_PAT }}
```

## License

Hippocratic License - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://ianwalter.dev)

[changesetsUrl]: https://github.com/atlassian/changesets
[renovateUrl]: https://renovatebot.com
[dependabotUrl]: https://dependabot.com/
[workflowUrl]: https://github.com/generates/changeset-action/blob/main/.github/workflows/changeset.yml
[licenseUrl]: https://github.com/generates/changeset-action/blob/main/LICENSE
