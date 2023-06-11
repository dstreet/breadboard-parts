import { FC } from "react";
import SyntaxHighlighter from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { useFetchPart } from "./useFetchPart";

interface Props {
  partNumber: string
}

export const PartView: FC<Props> = (props) => {
  const { partNumber } = props
  const { part, error, loading } = useFetchPart(partNumber)

  if (loading) {
    return (
      <div className="center-display">
        <div className="loading">Loading&hellip;</div>
      </div>
    )
  }

  if (error) {
    console.error(error)
    return (
      <div className="center-display">
        <div className="error">Failed to get part.<br/><pre>{error.message}</pre></div>
      </div>
    )
  }

  return (
    <SyntaxHighlighter language="json" style={dracula}>
      {JSON.stringify(part, undefined, 2)}
    </SyntaxHighlighter>
  )
}