const core = require('@actions/core')
const github = require('@actions/github')
const { default: write } = require('@changesets/write')
const { print } = require('@ianwalter/print')
const dot = require('@ianwalter/dot')
const execa = require('execa')

const types = ['major', 'minor', 'patch']

async function run () {
  // Try to extract changeset data from the workflow context.
  let { type, package, summary } = github.context.payload.inputs
  let ns = 'changeset'

  // Try to extract changeset data from the pull request label or workflow
  // input.
  const label = dot.get(github.context, 'event.label.name')
  if (!type && label) {
    const parts = label.split(':')
    ns = parts[0]
    type = parts[1]
  }

  if (ns === 'changeset' && types.includes(type)) {
    // Get the package name from the workflow input or try to determine it by
    // finding the nearest package.json to the first changed file.
    if (!package) {
      // TODO: implement
    }

    // Get the changeset summary from the workflow input or from the title of
    // the pull request.
    summary = summary || dot.get(github.context, 'event.pull_request.title')
    if (!summary) {
      throw new Error('Changeset summary could not be determined')
    }

    // Try to write and commit the changeset.
    const cwd = process.cwd()
    await write({ summary, releases: [{ name: package, type }] }, cwd)
    await execa('git', ['add', '.'])
    await execa('git', ['commit', '-m', '"Adding changeset"'])
    await execa('git', ['push', 'origin'])
  } else {
    print.info('Not adding changeset', { ns, type })
  }
}

run().catch(err => {
  print.error(err)
  core.setFailed(err.message)
})
