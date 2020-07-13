const core = require('@actions/core')
const github = require('@actions/github')
const { default: write } = require('@changesets/write')
const { print } = require('@ianwalter/print')
const dot = require('@ianwalter/dot')

const types = ['major', 'minor', 'patch']

async function run () {
  // Try to extract changeset data from the workflow context.
  const label = dot.get(github.context, 'event.label.name')
  const title = dot.get(github.context, 'event.pull_request.title')

  // Try to extract changeset data from the pull request label or workflow
  // input.
  let [ns, type] = label
    ? label.split(':')
    : ['changeset', core.getInput('type')]

  if (ns === 'changeset' && types.includes(type)) {
    // Get the package name from the workflow input or try to determine it by
    // finding the nearest package.json to the first changed file.
    let name = core.getInput('package')
    if (!name) {
      // TODO: implement
    }

    // Get the changeset summary from the workflow input or from the title of
    // the pull request.
    const summary = core.getInput('summary') || title
    if (!summary) {
      throw new Error('Changeset summary could not be determined')
    }

    // Try to write and commit the changeset.
    await write({ summary, releases: [{ name, type: semver }] })
  } else {
    print.info('Not adding changeset', { ns, type })
  }
}

run().catch(err => {
  print.error(err)
  core.setFailed(err.message)
})
