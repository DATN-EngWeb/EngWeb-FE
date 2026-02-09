'use client';

import { Plugin, Command } from 'ckeditor5';
import type { Editor } from 'ckeditor5';
import { ButtonView } from 'ckeditor5';
import type { Locale } from 'ckeditor5';

import type {
  DowncastConversionApi,
  UpcastConversionApi,
  ModelElement,
  ViewElement,
  ModelWriter,
} from '@ckeditor/ckeditor5-engine';

/**
 * Blank plugin for CKEditor 5
 * Creates custom <blank id="X"> elements for fill-in-the-blank functionality
 */
class BlankEditing extends Plugin {
  static get pluginName() {
    return 'BlankEditing';
  }

  init() {
    const editor = this.editor as Editor;

    // Define schema for blank element
    editor.model.schema.register('blank', {
      isInline: true,
      allowWhere: '$text',
      allowAttributes: ['id'],
    });

    /**
     * Upcast: <span class="blank-element" data-blank-id="...">
     *   → model: <blank id="..." />
     */
    editor.conversion.for('upcast').elementToElement({
      view: {
        name: 'span',
        classes: 'blank-element',
      },
      model: (viewElement: ViewElement, conversionApi: UpcastConversionApi) => {
        const { writer } = conversionApi;
        const id = viewElement.getAttribute('data-blank-id');

        return writer.createElement('blank', {
          id,
        });
      },
    });

    /**
     * Downcast: model <blank id="...">
     *   → <span class="blank-element" data-blank-id="..."></span>
     */
    editor.conversion.for('downcast').elementToElement({
      model: 'blank',
      view: (modelElement: ModelElement, conversionApi: DowncastConversionApi) => {
        const { writer } = conversionApi;
        const id = modelElement.getAttribute('id');

        return writer.createEmptyElement('span', {
          class: 'blank-element',
          'data-blank-id': id,
          contenteditable: 'false',
        });
      },
    });

    // Keep data-blank-id in sync when model id changes (editing + data)
    editor.conversion.for('downcast').attributeToAttribute({
      model: {
        name: 'blank',
        key: 'id',
      },
      view: (attributeValue) => ({
        key: 'data-blank-id',
        value: attributeValue,
      }),
      converterPriority: 'highest',
    });

    // Helper: renumber all blanks sequentially from startingId
    const renumberBlanks = (writer: ModelWriter) => {
      const root = editor.model.document.getRoot();
      if (!root) return;

      const startingIdRaw = editor.config.get('blank.startingId');
      const startingId = Number(startingIdRaw ?? 1) || 1;

      const blanks: ModelElement[] = [];
      const walker = editor.model.createRangeIn(root).getWalker({
        ignoreElementEnd: true,
      });

      for (const { item } of walker) {
        if (item.is('element', 'blank')) {
          blanks.push(item);
        }
      }

      blanks.forEach((blank, index) => {
        const expectedId = startingId + index;
        const currentId = Number(blank.getAttribute('id'));
        if (currentId !== expectedId) {
          writer.setAttribute('id', expectedId, blank);
        }
      });
    };

    // Auto-renumber after data changes (e.g., deletion) without freezing
    let isRenumbering = false;
    editor.model.document.on('change:data', () => {
      if (isRenumbering) return;

      const root = editor.model.document.getRoot();
      if (!root) return;

      const startingIdRaw = editor.config.get('blank.startingId');
      const startingId = Number(startingIdRaw ?? 1) || 1;

      const blanks: ModelElement[] = [];
      const walker = editor.model.createRangeIn(root).getWalker({
        ignoreElementEnd: true,
      });

      for (const { item } of walker) {
        if (item.is('element', 'blank')) {
          blanks.push(item);
        }
      }

      let needsFix = false;
      for (let i = 0; i < blanks.length; i++) {
        const expectedId = startingId + i;
        const currentId = Number(blanks[i].getAttribute('id'));
        if (currentId !== expectedId) {
          needsFix = true;
          break;
        }
      }

      if (!needsFix) return;

      isRenumbering = true;
      editor.model.enqueueChange({ isUndoable: false }, (writer) => {
        renumberBlanks(writer);
      });
      isRenumbering = false;
    });

    // Define insertBlank command
    editor.commands.add('insertBlank', new InsertBlankCommand(editor));

    // Define deleteBlank command
    editor.commands.add('deleteBlank', new DeleteBlankCommand(editor, renumberBlanks));
  }
}

/**
 * UI plugin for blank button
 */
class BlankUI extends Plugin {
  static get pluginName() {
    return 'BlankUI';
  }

  init(): void {
    const editor = this.editor as Editor;

    // Intercept Backspace/Delete on a selected blank to remove and renumber
    editor.editing.view.document.on('delete', (evt, data) => {
      const selectedElement = editor.model.document.selection.getSelectedElement();
      if (selectedElement?.is('element', 'blank')) {
        editor.execute('deleteBlank');
        data.preventDefault();
        evt.stop();
      }
    });

    const blankIcon = `
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            width="20"
            height="20"
            fill="none">

            <!-- (1) -->
            <text x="0"
                y="13.5"
                font-size="10"
                font-weight="700"
                font-family="Arial, Helvetica, sans-serif"
                fill="currentColor">(1)</text>

            <!-- blank ___ -->
            <line x1="15"
                y1="13.5"
                x2="20"
                y2="13.5"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"/>
        </svg>
    `;

    editor.ui.componentFactory.add('insertBlank', (locale: Locale) => {
      const button = new ButtonView(locale);

      button.set({
        label: 'Insert Blank',
        icon: blankIcon,
        tooltip: true,
        withText: false,
      });

      button.on('execute', () => {
        editor.execute('insertBlank');
        editor.editing.view.focus();
      });

      return button;
    });
  }
}

/**
 * InsertBlank Command
 */
class InsertBlankCommand extends Command {
  execute(): void {
    const editor = this.editor as Editor;
    const model = editor.model;
    const selection = model.document.selection;
    const nextId = this.getNextBlankId();

    model.change((writer: ModelWriter) => {
      const blankElement = writer.createElement('blank', {
        id: nextId,
      });

      model.insertContent(blankElement, selection);
      writer.setSelection(blankElement, 'after');
    });
  }

  private getNextBlankId(): number {
    const editor = this.editor as Editor;
    const root = editor.model.document.getRoot();
    const startingIdRaw = editor.config.get('blank.startingId');
    const startingId = Number(startingIdRaw ?? 1) || 1;

    if (!root) return startingId;

    // Collect all blank IDs and sort them
    const blankIds: number[] = [];
    const walker = editor.model.createRangeIn(root).getWalker({
      ignoreElementEnd: true,
    });

    for (const { item } of walker) {
      if (item.is('element', 'blank')) {
        const id = Number(item.getAttribute('id'));
        if (!isNaN(id)) {
          blankIds.push(id);
        }
      }
    }

    if (blankIds.length === 0) return startingId;

    // Return next sequential ID
    blankIds.sort((a, b) => a - b);
    return blankIds[blankIds.length - 1] + 1;
  }
}

/**
 * Delete Blank Command - with auto-renumbering
 */
class DeleteBlankCommand extends Command {
  private readonly renumber: (writer: ModelWriter) => void;

  constructor(editor: Editor, renumber: (writer: ModelWriter) => void) {
    super(editor);
    this.renumber = renumber;
  }

  execute(): void {
    const editor = this.editor as Editor;
    const model = editor.model;
    const selection = model.document.selection;
    const selectedElement = selection.getSelectedElement();

    if (selectedElement?.is('element', 'blank')) {
      model.change((writer) => {
        writer.remove(selectedElement);
        this.renumber(writer);
      });
    }
  }
}

export { BlankEditing, BlankUI };
