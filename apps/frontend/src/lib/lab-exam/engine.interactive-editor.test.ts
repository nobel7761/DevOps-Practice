import { describe, expect, it } from "vitest";
import {
  createShell,
  discardEditorAndExit,
  execute,
  isInEditor,
  saveEditorAndExit,
  updateEditorDraft,
} from "./engine";

describe("vim/nano/visudo as a simplified editor", () => {
  it("opens a new file with an empty draft", () => {
    const result = execute(createShell(), "vim /root/notes.txt");

    expect(result.error).toBe(false);
    expect(isInEditor(result.state)).toBe(true);
    expect(result.state.pendingEditor).toEqual({
      path: "/root/notes.txt",
      content: "",
    });
  });

  it("opens an existing file pre-filled with its current content", () => {
    const afterWrite = execute(createShell(), 'echo "hello" > /root/x.txt');
    const result = execute(afterWrite.state, "vim /root/x.txt");

    expect(isInEditor(result.state)).toBe(true);
    expect(result.state.pendingEditor?.content).toBe("hello");
  });

  it("visudo always opens /etc/sudoers, pre-filled with its current content", () => {
    const shell = createShell();
    const result = execute(shell, "visudo");

    expect(isInEditor(result.state)).toBe(true);
    expect(result.state.pendingEditor?.path).toBe("/etc/sudoers");
    expect(result.state.pendingEditor?.content).toBe(
      shell.fs["/etc/sudoers"].content,
    );
  });

  it("saving (:wq) writes the draft to the filesystem and closes the editor", () => {
    const afterOpen = execute(createShell(), "vim /root/notes.txt").state;
    const afterEdit = updateEditorDraft(afterOpen, "hello world");
    const result = saveEditorAndExit(afterEdit);

    expect(result.error).toBe(false);
    expect(isInEditor(result.state)).toBe(false);
    expect(result.state.fs["/root/notes.txt"].content).toBe("hello world");
  });

  it("discarding (:q!) closes the editor without writing anything", () => {
    const afterWrite = execute(
      createShell(),
      'echo "original" > /root/x.txt',
    ).state;
    const afterOpen = execute(afterWrite, "vim /root/x.txt").state;
    const afterEdit = updateEditorDraft(afterOpen, "changed but not saved");
    const result = discardEditorAndExit(afterEdit);

    expect(isInEditor(result.state)).toBe(false);
    expect(result.state.fs["/root/x.txt"].content).toBe("original");
  });

  it("denies opening a file the current user can't write to", () => {
    const created = execute(createShell(), "useradd joker").state;
    const loggedIn = execute(created, "su - joker").state;

    const result = execute(loggedIn, "vim /etc/shadow");

    expect(result.error).toBe(true);
    expect(isInEditor(result.state)).toBe(false);
  });
});
