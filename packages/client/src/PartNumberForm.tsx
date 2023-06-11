import { FC, FormEvent, useState } from "react"

interface Props {
  onSubmit: (partNumber: string) => void
}

export const PartNumberForm: FC<Props> = (props) => {
  const { onSubmit } = props
  const [partNumber, setPartNumber] = useState<string>('')

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    setPartNumber(e.currentTarget.value)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(partNumber)
  }

  return (
    <form onSubmit={handleSubmit} className="center-display">
      <input required type="text" placeholder="Part no." value={partNumber} onChange={handleChange}/>
      <button type="submit">Submit</button>
    </form>
  )
}