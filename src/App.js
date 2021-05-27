import "./styles.css";
import React from "react";
const initialStories = [
  //list declaring locally
  {
    title: "React",
    url: "https://reactjs.org/",
    author: "Jordan Walke",
    num_comments: 3,
    points: 4,
    objectID: 0
  },
  {
    title: "Redex",
    url: "https://readux.js.org/",
    author: "Dan Abramous,Andrew Clark",
    num_comments: 2,
    points: 5,
    objectID: 1
  }
];
const ACTIONTERMS = {
  STORY_FETCH_INIT: "STORY_FETCH_INIT",
  STORY_FETCH_SUCCESS: "STORY_FETCH_SUCCESS",
  STORY_FETCH_FAILURE: "STORY_FETCH_FAILURE",
  REMOVE_STORY: "REMOVE_STORY"
};
// const getAsyncStories=()=>                                duplicate data fetching
//   new Promise(resolve =>                                  //use as a real deta fetching
//     setTimeout(()=>
//       resolve({data : {stories:initialStories}}),2000)
//   )
// new Promise((resolve,reject)=>setTimeout(reject,2000))      //use to get error in data fetching

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query="; //url for fetching data

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );
  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);
  return [value, setValue];
};

const storiesReducer = (state, action) => {
  switch (action.type) {
    case ACTIONTERMS.STORY_FETCH_INIT:
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case ACTIONTERMS.STORY_FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case ACTIONTERMS.STORY_FETCH_FAILURE:
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    case ACTIONTERMS.REMOVE_STORY:
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        )
      };
    default:
      throw new Error();
  }
};

export default function App() {
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");

  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false
  });

  // React.useEffect(()=>{
  //   dispatchStories({type:ACTIONTERMS.STORY_FETCH_INIT})

  //   getAsyncStories().then(result=>{                               //fetching duplicate data
  //     dispatchStories({
  //       type: ACTIONTERMS.STORY_FETCH_SUCCESS,
  //       payload:result.data.stories,
  //     })
  //   }).catch(()=>
  //   dispatchStories({type:ACTIONTERMS.STORY_FETCH_FAILURE}))
  // },[])

  React.useEffect(() => {
    dispatchStories({
      type: ACTIONTERMS.STORY_FETCH_INIT
    });
    fetch(`${API_ENDPOINT}react`)
      .then((response) => response.json())
      .then((result) => {
        dispatchStories({
          type: ACTIONTERMS.STORY_FETCH_SUCCESS,
          payload: result.hits
        });
      })
      .catch(() => dispatchStories({ type: ACTIONTERMS.STORY_FETCH_FAILURE }));
  }, []);

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: ACTIONTERMS.REMOVE_STORY,
      payload: item
    });
  };
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  const searchedStories = stories.data.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <>
      <InputWithlabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      >
        {" "}
        <strong>Search:</strong>
      </InputWithlabel>
      {stories.isLoading ? (
        <p>Loading......</p>
      ) : (
        <List list={searchedStories} onRemoveItem={handleRemoveStory} />
      )}
      {stories.isError && <p> something went wrong.....</p>}
    </>
  );
}

const InputWithlabel = ({
  id,
  value,
  type = "text",
  isFocused,
  onInputChange,
  children
}) => {
  const inputRef = React.useRef();
  // React.useEffect(()=>{
  //   if(isFocused){
  //     inputRef.current.focus()
  //   }
  // },[inputRef])
  return (
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      <input
        id={id}
        ref={inputRef}
        type={type}
        value={value}
        onChange={onInputChange}
      />
    </>
  );
};

const List = ({ list, onRemoveItem }) =>
  list.map((item) => (
    <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
  ));

const Item = ({ item, onRemoveItem }) => {
  // const handleRemove=()=>{
  //   console.log("click")
  //   onRemoveItem(item)
  // }
  return (
    <div>
      <span>
        <a href={item.url}> |{item.title} |</a>
      </span>
      <span> |{item.author}| </span>
      <span> |{item.num_comments}| </span>
      <span> |{item.points}| </span>
      <span>
        {" "}
        <button type="button" onClick={() => onRemoveItem(item)}>
          Dismiss
        </button>
      </span>
    </div>
  );
};
