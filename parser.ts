{
  program: ({ sourceElements }) => sourceElements();
  sourceElements: ({ sourceElement, AL_LEAST_ONE }) =>
    AL_LEAST_ONE(() => sourceElement());
}
