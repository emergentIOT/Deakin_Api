# Library configuration

The files in this directory are concerned with setting the src attribute on the web component library script tags.

## The problem

Our CI/CD test environment creates a new subdomain for each containerised service in each branch, using the following naming convention.

`<branchname>--<servicename>.launchpad-dev.deakin.edu.au`

This poses a problem in how we set the src attribute in the script tag that fetches the libraries. The standard Angular way of managing variation between environments is impractical because we can't have a separate `environments.ts` file for each branch. Firstly because of the number of branches that are created and deleted as development progresses, and secondly, it would be a very manual and error prone process. Consequently, the problem can't be resolved at build time.

## The solution

In order to resolve this, two things must happen.

- The application must be aware of its environment (specifically the root URLs of any services it accesses)
- The application must update the src attributes of the script tags at runtime

## Further benefits

This approach also allows us to make the containers truly portable, meaning that they can be placed in a new environment without running a separate build.

## Local worflow

At runtime, the root level application component, `app.component.ts`

1. Reads the data contained in `app/src/assets/config/lib-config.json` which comprises of
   - Element IDs
   - Root URLs (in the format localhost:port to match the docker-compose settings)
   - File paths
2. Iterates over the relevent script tags and update the src attributes.

The browser then fetches and runs the scripts making the libraries available.

## Swarm workflow

Prior to the runtime behaviour described above, the deployment script does the following

1. The root URLs are defined and passed into the container as environment variables.
2. The container runs `app/scripts/substute_env.sh` which
   - Reads `app/src/assets/config/lib-config.template.json`
   - Replaces the envrionment variable references with their value
   - Writes the result to `app/src/assets/config/lib-config.json`
3. Starts the web server

Now, at runtime, the config has the correct values for the current envionment when `app.component.ts` modifies the script tags.
