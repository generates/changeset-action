const core = require('@actions/core')
const github = require('@actions/github')
const { default: write } = require('@changesets/write')
const { print } = require('@ianwalter/print')

const types = ['major', 'minor', 'patch']

async function run () {
  // Try to extract changeset data from the workflow context.
  const label = github.context.event?.label?.name
  const title = github.context.event?.pull_request?.title

  // Try tp extract changeset data from the pull request label.
  let [namespace = 'changeset', type] = label?.split(':')

  // If type can't be determined from an added pull request label, try to get it
  // from the workflow input.
  type = type || core.getInput('type')

  if (namespace === 'changeset' && types.includes(type)) {

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
    await write({ summary, releases: [{ name, type }] })
  } else {
    core.info('Not adding changeset', { namespace, type })
  }
}

run().catch(err => {
  print.error(err)
  core.setFailed(err.message)
})
