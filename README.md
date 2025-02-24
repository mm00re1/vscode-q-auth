## Customized Authentication for vscode-q

1. update **auth** function in src/extension.ts. `jshinonome.vscode-q` will pass all configurations to this extension.

    **Note**: DO NOT change publisher and name in the package.json, the extension name has to be `jshinonome.vscode-q-auth`

2. run the following commands from this repo folder to generate a extension

    **Note**: If md5 is not required, use `npm remove md5` to remove the dependency.

```
npm i
sudo npm i -g vsce
vsce package
```

3.  distribute `vscode-q-auth-*.*.*.vsix` to your user.

### Example Implementations
Example implementations are available in the `examples/` folder. Currently, the following example is included:
- `azure_entra_id/` - Demonstrates customized authentication using Azure Entra ID.
