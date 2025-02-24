## Customized Authentication for vscode-q (azure_entra_id implementation)

1. update **auth** function in src/extension.ts. `jshinonome.vscode-q` will pass all configurations to this extension.

    **Note**: DO NOT change publisher and name in the package.json, the extension name has to be `jshinonome.vscode-q-auth`

2. run the following commands from this repo folder to generate a extension

```
npm i
sudo npm i -g vsce
# alternative command may be needed ->    npm install -g @vscode/vsce
vsce package
```

3.  distribute `vscode-q-auth-*.*.*.vsix` to your user.


### Notes on using oauth pkce flow
Tick the "Customized Authentication" checkbox and pass your Azure Entra ID app details in the password box in the following format
```
<TENANT-ID>|<YOUR-CLIENT-ID>|<SCOPE>
```

For your client app, you will need to add 1 or 2 Redirect URIs
```
https://vscode.dev/redirect
ms-appx-web://Microsoft.AAD.BrokerPlugin/<YOUR-CLIENT-ID> # this may not be needed depeneding on what env you are using
```

Full worked example of creating app registrations on Entra ID for the oauth pkce flow can be found in this post
https://kdbsuite.com/oauth-for-kdb/
