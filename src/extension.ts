// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  commands,
  ConfigurationTarget,
  ExtensionContext,
  notebook,
  NotebookCell,
  NotebookCellData,
  NotebookCellKind,
  NotebookRange,
  window,
  workspace,
  WorkspaceEdit,
} from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
  context.subscriptions.push(
    ...[
      commands.registerCommand("notebook.cell.changeToHeading1", (cell) =>
        convertToHeading(cell, 1)
      ),
      commands.registerCommand("notebook.cell.changeToHeading2", (cell) =>
        convertToHeading(cell, 2)
      ),
      commands.registerCommand("notebook.cell.changeToHeading3", (cell) =>
        convertToHeading(cell, 3)
      ),
      commands.registerCommand("notebook.cell.changeToHeading4", (cell) =>
        convertToHeading(cell, 4)
      ),
      commands.registerCommand("notebook.cell.changeToHeading5", (cell) =>
        convertToHeading(cell, 5)
      ),
      commands.registerCommand("notebook.cell.changeToHeading6", (cell) =>
        convertToHeading(cell, 6)
      ),
    ]
  );
  await disableJupyterExtensionKeyboards();
}

async function disableJupyterExtensionKeyboards() {
  await workspace
    .getConfiguration("jupyter", undefined)
    .update("enableKeyboardShortcuts", false, ConfigurationTarget.Global);
}

async function convertToHeading(cell: NotebookCell, number: number) {
  const document = window.activeNotebookEditor?.document;
  const selections = window.activeNotebookEditor?.selections;
  if (!document || !selections || selections.length === 0) {
    return;
  }
  const cells = new Set<NotebookCell>();
  selections?.forEach((selection) =>
    document.getCells(selection).forEach((cell) => cells.add(cell))
  );
  cells.forEach(async (cell) => {
    if (cell.kind === NotebookCellKind.Code) {
      let source = cell.document.getText();
      const expectedPrefix = "".padEnd(number, "#");
      while (!source.startsWith(expectedPrefix)) {
        source = `#${source}`;
      }
	  // Remove unnecessary leading `#`
      while (source.startsWith(expectedPrefix + '#')) {
        source = source.substring(1);
      }
      const markdownCell = new NotebookCellData(
        NotebookCellKind.Markup,
        source,
        "markdown"
      );
      const edit = new WorkspaceEdit();
      edit.replaceNotebookCells(
        cell.notebook.uri,
        new NotebookRange(cell.index, cell.index + 1),
        [markdownCell]
      );
      await workspace.applyEdit(edit);
    }
  });
}
