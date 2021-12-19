import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from 'react';

import { WithContext as ReactTags } from 'react-tag-input';
import { UserContext } from '../../context/user-Context';
import WEB_CONSTANTS from '../../utilities/constants';
import Tags from '@yaireo/tagify/dist/react.tagify';
import { set } from 'react-hook-form';

const baseTagifySettings = {
  tagTextProp: 'name',
  dropdown: {
    searchKeys: ['value'],
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

export default function TagInput({ authors }) {
  // const [listAuthors, setListAuthors] = useState([]);
  const [tagifyProps, setTagifyProps] = useState({});
  const [tagifySettings, setTagifySettings] = useState({});
  const { getAuthorId, listAuthorsId } =
    useContext(UserContext);
  const server = WEB_CONSTANTS.SERVER;
  const tagify = useRef();

  const settings = {
    ...baseTagifySettings,
    ...tagifySettings,
  };

  useEffect(() => {
    if (authors) {
      // alert('abc');
      // sao set xong nos ko doi trang thai nhi
      // setTagifySettings({ enforceWhitelist: true });
      tagify.current.settings.enforceWhitelist = false;
      tagify.current.addTags(
        authors.map((author) => ({
          value: author.name,
          id: author.id,
        }))
      );
      tagify.current.settings.enforceWhitelist = true;
    }
  }, [authors]);

  const handleAuthor = (e) => {
    let inputSearch = e.detail.value;
    if (inputSearch) {
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
        onChange={() =>
          getAuthorId(
            tagify.current.value.map((value) => value.id)
          )
        }
      />
    </div>
  );
}
