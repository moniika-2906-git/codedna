import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const CodeEditor = ({ value, onChange }: CodeEditorProps) => {
  return (
    <div className="h-full overflow-hidden rounded-lg border border-zinc-800">
      <CodeMirror
        value={value}
        onChange={onChange}
        theme="dark"
        height="100%"
        extensions={[javascript({ jsx: false })]}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
        }}
        style={{ height: "100%", fontSize: 13 }}
      />
    </div>
  );
};
