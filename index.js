const path = require('path')
const core = require('@actions/core')
const github = require('@actions/github')
const { default: write } = require('@changesets/write')
const { print } = require('@ianwalter/print')
const dot = require('@ianwalter/dot')
const execa = require('execa')
const readPkgUp = require('read-pkg-up')

const types = ['major', 'minor', 'patch']
const ignoredFiles = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock']

async function run () {
  // Try to extract changeset data from the workflow context.
  if (process.env.DEBUG) print.debug('Context', github.context)
  let { type, name, summary } = github.context.payload.inputs || {}
  let ns = 'changeset'

  // Try to extract changeset data from the pull request label or workflow
  // input.
  const label = dot.get(github.context, 'payload.label.name')
  if (!type && label) {
    const parts = label.split(':')
    ns = parts[0]
    type = parts[1]
  }

  if (ns === 'changeset' && types.includes(type)) {
    // Get the package name from the workflow input or try to determine it by
    // finding the nearest package.json to the first changed file.
    const releases = []
    if (name) {
      releases.push({ name, type })
    } else {
      const { stdout } = await execa(
        'git',
        ['diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD~1']
      )
      for (const file of stdout.split('\n')) {
        if (!ignoredFiles.includes(file)) {
          const cwd = path.dirname(file)
          const { packageJson } = await readPkgUp({ cwd })
          releases.push({ name: packageJson.name, type })
        }
      }
    }

    // Get the changeset summary from the workflow input or from the title of
    // the pull request.
    summary = summary || dot.get(github.context, 'payload.pull_request.title')
    if (!summary) throw new Error('Changeset summary could not be determined')

    // Try to write and commit the changeset.
    const cwd = process.cwd()
    await write({ summary, releases }, cwd)

    const author = 'github-actions[bot]'
    await execa('git', ['config', '--global', 'user.name', author])
    const email = 'github-actions[bot]@users.noreply.github.com'
    await execa('git', ['config', '--global', 'user.email', email])

    await execa('git', ['add', '.'])
    await execa('git', ['commit', '-m', 'Adding changeset'])
    await execa('git', ['push', 'origin'])
  } else {
    print.info('Not adding changeset', { ns, type })
  }
}

run().catch(err => {
  print.error(err)
  core.setFailed(err.message)
})
