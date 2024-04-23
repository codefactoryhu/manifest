import * as monaco from 'monaco-editor';

// Import the workers in a production-safe way.
// This is different than in Monaco's documentation for Vite,
// but avoids a weird error ("Unexpected usage") at runtime
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import { configureMonacoYaml } from 'monaco-yaml';
import YamlWorker from 'monaco-yaml/yaml.worker?worker';

self.MonacoEnvironment = {
	getWorker: function (_: string, label: string) {
		switch (label) {
			// case 'json':
			// 	return new jsonWorker();
			case 'yaml':
				// this way we should be able to configure monaco-yaml
				// here we can add Conjure JSON scheme for validation
				// if we had one
				configureMonacoYaml(monaco, {
					hover: true,
					completion: true,
					validate: true,
					format: true
					// enableSchemaRequest: true,
					// schemas: [
					// 	{
					// 		// If YAML file is opened matching this glob
					// 		fileMatch: ['**/.prettierrc.*'],
					// 		// Then this schema will be downloaded from the internet and used.
					// 		uri: 'https://json.schemastore.org/prettierrc.json'
					// 	},
					// 	{
					// 		// If YAML file is opened matching this glob
					// 		fileMatch: ['**/person.yaml'],
					// 		// The following schema will be applied
					// 		schema: {
					// 			type: 'object',
					// 			properties: {
					// 				name: {
					// 					type: 'string',
					// 					description: 'The person’s display name'
					// 				},
					// 				age: {
					// 					type: 'integer',
					// 					description: 'How old is the person in years?'
					// 				},
					// 				occupation: {
					// 					enum: ['Delivery person', 'Software engineer', 'Astronaut']
					// 				}
					// 			}
					// 		},
					// 		// And the URI will be linked to as the source.
					// 		uri: 'https://github.com/remcohaszing/monaco-yaml#usage'
					// 	}
					// ]
				});
				monaco.editor.setTheme(
					localStorage.getItem('color-theme') === 'light' ? 'Cobalt2' : 'Blackboard'
				);
				return new YamlWorker();
			default:
				monaco.editor.setTheme(
					localStorage.getItem('color-theme') === 'light' ? 'Cobalt2' : 'Blackboard'
				);
				return new editorWorker();
		}
	}
};

import('$lib/assets/themes/Blackboard.json').then((data) => {
	monaco.editor.defineTheme('Blackboard', data as monaco.editor.IStandaloneThemeData);
});
import('$lib/assets/themes/Cobalt2.json').then((data) => {
	monaco.editor.defineTheme('Cobalt', data as monaco.editor.IStandaloneThemeData);
});

export default monaco;
