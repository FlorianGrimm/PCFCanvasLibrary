# PCFCanvasLibrary


## Status 
- HotReload

    enables HotReload for deployed controls, if harness is not engough.

    beta - works on my machine ...

- ControlState

    do not use for now.    

    alpha

- Logging

    do not use for now.

    alpha 

- Triggers

    do not use for now.
    
    alpha

- Messaging

    do not use for now.

    alpha

- Mocks

    do not use for now.

    very alpha

## HotReload

The repo https://github.com/FlorianGrimm/PCFCanvasLibrarySample contains a sample for the hot reload.
 PCFHotReloadSample

- pac pcf init --namespace NamespaceSample --name ControlSample --template field
- copy index.ts to ControlSample.ts

- npm install pcfcanvaslibrary --save
  
- index.ts

```typescript
import * as control from "./ControlSample";

// development enable HotReload
/* */
import { enableHotReloadForTypes } from 'pcfcanvaslibrary/src/HotReload/index';
enableHotReloadForTypes(true, control.ControlSample.name, control, exports);
/* */

// Production
/*
Object.defineProperty(exports, "__esModule", { value: true });
for (const key in controls) {
    Object.defineProperty(exports, key, { enumerable: true, value: (controls as any)[key] });    
}
*/
```

- ControlSample.ts
```typescript

type HotReloadState = { foo: number; };

export class ControlSample implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    static version=1;
    // ...
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
        // ...
    }

    getHotReloadState(): HotReloadState {
        return { foo: this.foo };
    }

    hotReload(context: ComponentFramework.Context<IInputs>, notifyOutputChanged?: () => void, state?: ComponentFramework.Dictionary, container?: HTMLDivElement, hotReloadState?: HotReloadState): void {
        if (hotReloadState) {
            this.foo = hotReloadState.foo;
        }
        this.init(context, notifyOutputChanged, state, container);
    }
}
```

- ...\ControlManifest.Input.xml

    modify as needed...



- modify ...\node_modules\pcf-start\bin\pcf-start.js

    enable cors by adding cors: true, 

```javascript
// Start server
var options = {
    port: 8181,
    host: '0.0.0.0',
    cors: true, 
    root: path.resolve(process.cwd(), codePath),
    open: true,

```

- run harness

```cmd
npm run start watch
```

- deploy the control to make.powerapps.com

- add your control to the canvas app.

- enable hot reload

    In your browser - F12 - Console
```javascript

PCFCanvasLibrary.enableHotReload("ControlSample")

// -or- for more options

PCFCanvasLibrary.enableHotReload("ControlSample", 24, "http://127.0.0.1:8181/bundle.js")

```

- modify the code

    optional: increase the version

```typescript

type HotReloadState = { foo: number; };

export class ControlSample implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    static version=2;
```

    The control should reload in harness and in maker.

- disable hot reload
    
    - Temporary
```javascript
PCFCanvasLibrary.disableHotReload("ControlSample")
```
    - for production deployment
    
    change the index.ts so that the enableHotReloadForTypes is no more called. (Flip comments)
