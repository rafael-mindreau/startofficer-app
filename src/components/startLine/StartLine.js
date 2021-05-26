import React from 'react';
import Aircraft from 'components/aircraft/Aircraft';

const ZD = {
  tailNumber: 'ZD',
  tailNumberColor: '#d42e2e',
};

const TWIN = {
  tailNumber: '808',
  tailNumberColor: '#12428a',
};

export default () => (
  <Aircraft aircraft={ZD} />
);
