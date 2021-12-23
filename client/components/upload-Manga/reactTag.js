import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from 'react';

import { WithContext as ReactTags } from 'react-tag-input';
import WEB_CONSTANTS from '../../utilities/constants';
import Tags from '@yaireo/tagify/dist/react.tagify';
import { set } from 'react-hook-form';

const baseTagifySettings = {
  tagTextProp: 'name',
  dropdown: {
    searchKeys: ['value', 'alias'],
    enabled: 0, // show the dropdown immediately on focus
    maxItems: 5,
    closeOnSelect: true, // keep the dropdown open after selecting a suggestion
    highlightFirst: true,
    fuzzySearch: true,
  },
  editTags: false,
  keepInvalidTags: false,
  enforceWhitelist: true,
};

export default function TagInput({
  authors,
  updateAuthor,
}) {
  const [tagifyProps, setTagifyProps] = useState({});
  const [tagifySettings, setTagifySettings] = useState({});

  const server = WEB_CONSTANTS.SERVER;
  const tagify = useRef();

  const settings = {
    ...baseTagifySettings,
    ...tagifySettings,
  };

  useEffect(() => {
    if (authors) {
      tagify.current.settings.enforceWhitelist = false;
      tagify.current.addTags(
        authors.map((author) => ({
          value: author.name,
          alias: author.alias,
          id: author.id,
        }))
      );
      tagify.current.settings.enforceWhitelist = true;
    }
  }, [authors]);

  const handleAuthor = (e) => {
    let inputSearch = e.detail.value;
    if (inputSearch) {
      console.log(tagify.current.value);
      setTagifyProps({ loading: true });
      fetch(
        `${server}/search-author/${encodeURIComponent(
          inputSearch
        )}`
      )
        .then((res) => res.json())
        .then((datas) => {
          if (datas) {
            console.log(datas);
            setTagifyProps(
              (lastProps) => ({
                ...lastProps,
                whitelist: datas.map((data) => ({
                  value: data.name,
                  id: data.id,
                  alias: data?.alias,
                })),
                loading: false,
              }),
              () => {
                tagify.current.dropdown.show(inputSearch);
              }
            );
          } else {
            setTagifyProps({
              loading: false,
            });
          }
        });
    } else {
      // setListAuthors([]);
    }
  };

  return (
    <div>
      <Tags
        tagifyRef={tagify}
        autoFocus={true}
        {...tagifyProps}
        settings={settings}
        onInput={handleAuthor}
        onChange={() => {
          updateAuthor(
            tagify.current.value.map((value) => value.id)
          );
        }}
      />
    </div>
  );
}
