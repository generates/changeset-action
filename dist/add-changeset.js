'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var core = _interopDefault(require('@actions/core'));
var github = _interopDefault(require('@actions/github'));
var fs = _interopDefault(require('fs-extra'));
var path = _interopDefault(require('path'));
var prettier = _interopDefault(require('prettier'));
var humanId = _interopDefault(require('human-id'));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

async function writeChangeset(changeset, cwd) {
  const {
    summary,
    releases
  } = changeset;
  const changesetBase = path.resolve(cwd, ".changeset"); // Worth understanding that the ID merely needs to be a unique hash to avoid git conflicts
  // experimenting with human readable ids to make finding changesets easier

  const changesetID = humanId({
    separator: "-",
    capitalize: false
  });
  const prettierConfig = await prettier.resolveConfig(cwd);
  const newChangesetPath = path.resolve(changesetBase, `${changesetID}.md`); // NOTE: The quotation marks in here are really important even though they are
  // not spec for yaml. This is because package names can contain special
  // characters that will otherwise break the parsing step

  const changesetContents = `---
${releases.map(release => `"${release.name}": ${release.type}`).join("\n")}
---

${summary}
  `;
  await fs.writeFile(newChangesetPath, prettier.format(changesetContents, _objectSpread({}, prettierConfig, {
    parser: "markdown"
  })));
  return changesetID;
}

const { default: write } = writeChangeset;

const types = ['major', 'minor', 'patch'];

async function run () {
  // Try to extract changeset data from the workflow context.
  const label = github.context.event.label.name;
  const title = github.context.event.pull_request.title;

  // Try tp extract changeset data from the pull request label.
  let [namespace = 'changeset', type] = label.split(':');

  // If type can't be determined from an added pull request label, try to get it
  // from the workflow input.
  type = type || core.getInput('type');

  if (namespace === 'changeset' && types.includes(type)) {
    try {
      // Get the package name from the workflow input or try to determine it by
      // finding the nearest package.json to the first changed file.
      let name = core.getInput('package');
      if (!name) {
        // TODO: implement
      }

      // Get the changeset summary from the workflow input or from the title of
      // the pull request.
      const summary = core.getInput('summary') || title;
      if (!summary) {
        throw new Error('Changeset summary could not be determined')
      }

      // Try to write and commit the changeset.
      await write({ summary, releases: [{ name, type }] });
    } catch (err) {
      core.error(err);
      core.setFailed(err.message);
    }
  } else {
    core.info('Not adding changeset', { namespace, type });
  }
}

run();

var addChangesetAction = {

};

module.exports = addChangesetAction;
