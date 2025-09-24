// Mock for @react-pdf/renderer to avoid ES module issues in Jest
const pdf = jest.fn(() => ({
  toBlob: jest.fn(() => Promise.resolve(new Blob(['mock pdf data'], { type: 'application/pdf' })))
}));

const Document = 'div';
const Page = 'div';
const Text = 'div';
const View = 'div';
const Image = 'div';
const StyleSheet = {
  create: jest.fn((styles) => styles)
};

module.exports = {
  pdf,
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet
};