import path from 'path'
import core from '@actions/core'
import github from '@actions/github'
import write from '@changesets/write'
import { createLogger } from '@generates/logger'
import dot from '@ianwalter/dot'
import execa from 'execa'
import { readPackageUpAsync } from 'read-pkg-up'

const logger = createLogger({ level: 'info', namespace: 'changeset-action' })
const types = ['major', 'minor', 'patch']
const ignoredFiles = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock']

async function run () {
  // Try to extract changeset data from the workflow context.
  if (process.env.DEBUG) logger.debug('Context', github.context)
  let { type, name, summary } = github.context.payload.inputs || {}

  // Try to extract changeset data from the pull request label or workflow
  // input.
  const labels = github.context.payload?.pull_request?.labels || []
  if (!type) {
    for (const label of labels) {
      const [ns, t] = label.name.split('.')
      if (ns === 'changeset' && types.includes(t)) {
        type = t
        break
      }
    }
  }

  if (types.includes(type)) {
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
          const { packageJson } = await readPackageUpAsync({ cwd })
          const hasPackage = releases.some(r => r.name === packageJson.name)
          if (!hasPackage) releases.push({ name: packageJson.name, type })
        }
      }
    }

    // Get the changeset summary from the workflow input or from the title of
    // the pull request.
    summary = summary || dot.get(github.context, 'payload.pull_request.title')
    if (!summary) throw new Error('Changeset summary could not be determined')

    // Don't create a new changeset if it already exists.
    const { stdout } = await execa('grep', [`"${summary}"`, '-r', '.changeset'])
    if (stdout) return logger.info('Found existing changeset:', stdout)

    // Create the changeset.
    const cwd = process.cwd()
    await write.default({ summary, releases }, cwd)
  } else {
    logger.info('Not adding changeset', { type, labels })
  }
}

run().catch(err => {
  logger.error(err)
  core.setFailed(err.message)
})
