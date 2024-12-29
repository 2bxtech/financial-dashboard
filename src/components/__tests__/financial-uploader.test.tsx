import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import FileUploader, { FileUploaderProps } from '../file-uploader';

describe('FileUploader', () => {
  let defaultProps: FileUploaderProps;

  beforeEach(() => {
    defaultProps = {
      onFileUpload: jest.fn(),
      onError: jest.fn(), // Add this line
      loading: false,
      error: '',
    };
  });

  it('calls onFileUpload with the selected file', () => {
    const { getByLabelText } = render(<FileUploader {...defaultProps} />);
    const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' });
    const fileInput = getByLabelText(/drag and drop/i) as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    expect(defaultProps.onFileUpload).toHaveBeenCalledWith(mockFile);
  });

  it('displays an error message if error prop is set', () => {
    const { queryByText, rerender } = render(<FileUploader {...defaultProps} error="" />);
    expect(queryByText(/Error/i)).toBeNull();
    rerender(<FileUploader {...defaultProps} error="Something went wrong" />);
    expect(queryByText(/Something went wrong/i)).not.toBeNull();
  });

  it('displays loading state when loading is true', () => {
    const { getByRole, rerender } = render(<FileUploader {...defaultProps} loading={false} />);
    expect(() => getByRole('status')).toThrow();
    rerender(<FileUploader {...defaultProps} loading />);
    expect(getByRole('status')).toHaveTextContent(/processing file/i);
  });
});
