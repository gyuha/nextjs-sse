import DOMPurify from 'dompurify';
import type React from 'react';

interface IStringToHtmlProps {
  text: string | React.ReactNode | React.JSX.Element | null;
}

const StringToHtml = ({ text }: IStringToHtmlProps): React.ReactNode | React.JSX.Element | null => {
  if (typeof text === 'string') {
    const sanitizedData = DOMPurify.sanitize(text);
    // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
    return <div dangerouslySetInnerHTML={{ __html: sanitizedData }} />;
  }
  return text;
};

export default StringToHtml;
