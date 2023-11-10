# file-handler

RestApp that handles uploads of files to Sitevision. The source of the file can either be a URL or a file on disk. In the settings of the restapp, you define which folder the upload should be made to. You can also specify which subfolder you want the file to be created under. If the subfolder does not exist, it will be created automatically.

The RestApp has two routes:

`/createFileFromUri`

This route requires a POST with the parameters `uri` and `fileName`. `uri` is a URL to a file to be uploaded. `fileName` is the name of the file to be created. If the file already exists, it will be overwritten. If there is a parameter called `subFolder`, the file will be created in that subfolder. If the subfolder does not exist, it will be created automatically.

`/createFileFromTemp`

This route requires a POST with the parameters `file` and `subFolder`. `file` is a file to be uploaded. `subFolder` is a subfolder that the file should be created under. If the subfolder does not exist, it will be created automatically.

## Building

- `npm run create-addon` creates an addon with the name configured in the setup task
- `npm run build` compresses `/src` into `/dist`. If you use babel to transpile your code, this target will compress a transpiled version of your `/src`
- `npm run build deploy` runs the build task and deploys to the addon configured in the setup task
- `npm run build force-deploy` runs the build task and deploys with the possibility to overwrite an existing RESTApp
- `npm run dev` watches files for changes and runs `build force-deploy` on save
- `npm run sign` invokes the signing endpoint of the Sitevision developer REST API. A signed version of the RESTApp will be created in the `/dist` folder
- `npm run deploy-prod` deploys the signed RESTApp to a production environment
- `npm run setup-dev-properties` creates .dev-properties.json

[Visit developer.sitevision.se for more information](https://developer.sitevision.se)
