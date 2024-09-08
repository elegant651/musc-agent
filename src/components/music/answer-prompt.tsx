"use client";
import { Table } from "@radix-ui/themes"

type Props = {
  data: string;
};

export const AnswerPrompt: React.FC<Props> = ({ data }) => {

  return (
    <>
      {data}
    </>
  )
}