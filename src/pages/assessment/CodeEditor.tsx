import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const CodeEditor = ({ value, onChange, readOnly }: CodeEditorProps) => {
  return (
    <div className="h-full overflow-hidden rounded-lg border border-zinc-800">
      <CodeMirror
        value={value}
        onChange={onChange}
        theme="dark"
        height="100%"
        editable={!readOnly}
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
