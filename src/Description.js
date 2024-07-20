import React from 'react';
import parse from 'html-react-parser';

const Description = ({ text = '', limit }) => {
  const truncateText = (text, limit) => {
    const truncated = text.length > limit ? text.slice(0, limit) + '...' : text;
    return truncated;
  };

  return <div>{parse(truncateText(text, limit))}</div>;
};

export default Description;
