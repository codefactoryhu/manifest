<script lang="ts">
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
	import { onDestroy, onMount } from 'svelte';
	import { pickedTheme } from '../themePicker/themeStore';
	import { Spinner } from 'flowbite-svelte';

	export let fileContent: string;
	export let editorContent: string;
	export let syntaxIsCorrect: boolean | null;

	$: if (fileContent && model) model.setValue(fileContent);
	$: if (fileContent === ' ' && model) model.setValue('');
	$: if (editorContent === ' ' && model) model.setValue('');

	$: if ($pickedTheme && monaco) monaco.editor.setTheme($pickedTheme);

	let standaloneEditor: Monaco.editor.IStandaloneCodeEditor;
	let monaco: typeof Monaco;
	let editorContainer: HTMLElement;
	let model: Monaco.editor.ITextModel;
	let modelUri: Monaco.Uri;
	let isLoading: boolean = true;

	onMount(async () => {
		monaco = (await import('./monaco')).default;
		standaloneEditor = monaco.editor.create(editorContainer, {
			automaticLayout: true,
			colorDecorators: true,
			scrollBeyondLastLine: false,
			renderValidationDecorations: 'on',
			minimap: { enabled: false }
		});

		standaloneEditor.onDidChangeModelContent(() => {
			const contentOfEditor = monaco.editor.getModel(modelUri)?.getValue();
			if (contentOfEditor) {
				editorContent = contentOfEditor;
			}
		});
		useYamlWorker();
		isLoading = false;
	});

	const useYamlWorker = () => {
		model = monaco.editor.createModel(editorContent, 'yaml');
		modelUri = model.uri;
		standaloneEditor.setModel(model);
	};

	onDestroy(() => {
		editorContent = '';
		monaco?.editor.getModels().forEach((model) => model.setValue(''));
		if (standaloneEditor !== undefined) {
			standaloneEditor.dispose();
		}
	});
</script>

<div
	hidden={isLoading}
	id="editor-container"
	class="grow {syntaxIsCorrect === false ? 'border border-red-600' : ''} "
	bind:this={editorContainer}
></div>
{#if isLoading}
	<div class="inset-0 flex h-full flex-row items-center justify-center">
		<Spinner color="gray" />
	</div>
{/if}
