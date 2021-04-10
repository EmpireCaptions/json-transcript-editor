/* eslint-disable */
import React, { Component } from "react";
import "./App.css";

import Input from "@material-ui/core/Input";
import alertify from 'alertifyjs';
import {
  Button, 
  CardColumns,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter
} from 'reactstrap';
import Plyr from 'plyr';
import InfiniteScroll from "react-infinite-scroll-component";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import Dropdown from './components/dropdown'

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fileName: "",
      showFirstTimer: false,
      secondsValue: 0,
      playbackRate: 1,
      prev: 0,
      next: 10,
      hasMore: true,
      current: [],
      syncModal: false,
      syncModalValue: 0,
      t_index: null,
      w_index: null
    };
    this.index = 0;
    this.inputRef = React.createRef();
    this.focusInputField = React.createRef();
    this.focusInputField = input => {
      if (input) {
        setTimeout(() => { input.focus() }, 100);
      }
    };
    this.plyr;
  }

  fetchMoreData = () => {

    setTimeout(() => {
      this.setState({ current: this.state.current.concat(this.state.mainJSON.transcript.slice(this.state.current.length, this.state.current.length + 10)) })
    }, 1000)
    this.setState((prevState) => ({ prev: prevState.prev + 10, next: prevState.next + 10 }))
    if (this.state.current.length === this.state.mainJSON.transcript.length || this.state.current.length + 10 > this.state.mainJSON.transcript.length) {
      this.setState({ hasMore: false })
      return;
    }
  }
  toggleSyncModal = () => {
    this.setState({ syncModal: !this.state.syncModal, syncModalValue: 0 })
  }
  openSyncModal = (t_index, w_index) => {
    this.setState({ syncModal: true, t_index, w_index })
  }
  syncModalDecrementBtnOnClick = () => {
    alertify.confirm(`Are you sure you want to decrease ${this.state.syncModalValue} ms  ?`, async (status) => {
      if (status) {
        this.syncTimerWithIndex(this.state.syncModalValue * (-1))
      }
    }).setHeader("").set('labels', { ok: 'OK', cancel: 'CANCEL' });
  }
  syncModalIncrementBtnOnClick = () => {
    alertify.confirm(`Are you sure you want to increase ${this.state.syncModalValue} ms  ?`, async (status) => {
      if (status) {
        this.syncTimerWithIndex(this.state.syncModalValue)
      }
    }).setHeader("").set('labels', { ok: 'OK', cancel: 'CANCEL' });
  }
  syncTimerWithIndex = (ms) => {
    var {t_index, w_index} = this.state
    if(t_index != null && w_index != null){
      let seconds = +(ms / 1000).toFixed(3)
      let merged_text = "";

      let old_t_index = t_index
      let old_w_index = w_index

      for(t_index; t_index < this.state.mainJSON.transcript.length; t_index++){
        let t_words = this.state.mainJSON.transcript[t_index]

        if(t_words.words!=null ||t_words.words!=undefined){
          if(old_t_index == t_index){
            w_index = old_w_index
          } else {
            w_index = 0
          }
          for(w_index; w_index < t_words.words.length; w_index++){
            let word = t_words.words[w_index]
            if (word && word.hasOwnProperty("start_time")) {
              let updated_start_time = word.start_time + seconds;
              let updated_end_time = word.end_time + seconds;
              if (updated_start_time <= 0) {
                merged_text += word.text + " ";
                if (updated_end_time > 0) {
                  this.state.mainJSON.transcript[t_index][w_index]['start_time'] = 0
                  this.state.mainJSON.transcript[t_index][w_index]['end_time'] = updated_end_time
                  this.state.mainJSON.transcript[t_index][w_index]['text'] = merged_text
                  merged_text = "";
    
                }
              }
              else {
                if (merged_text != "") {
                  this.state.mainJSON.transcript[t_index][w_index]['start_time'] = 0
                  this.state.mainJSON.transcript[t_index][w_index]['end_time'] = updated_end_time
                  this.state.mainJSON.transcript[t_index][w_index]['text'] = merged_text + w_words.text
                  merged_text = "";
                }
                else {
                  this.state.mainJSON.transcript[t_index]['words'][w_index]['start_time'] = updated_start_time
                  this.state.mainJSON.transcript[t_index]['words'][w_index]['end_time'] = updated_end_time
                }
              }
            }
          }
        }
        
        this.state.mainJSON.transcript[t_index]['start_time'] = this.state.mainJSON.transcript[t_index]['words'][0]['start_time']
        let last_index = this.state.mainJSON.transcript[t_index]['words'].length
        this.state.mainJSON.transcript[t_index]['end_time'] = this.state.mainJSON.transcript[t_index]['words'][last_index - 1]['end_time']
      }

      alertify.success(`Input time ${this.state.syncModalValue} ms  has been added successfully`)
      this.setState({ t_index: null, w_index: null, syncModal: false, syncModalValue: 0 })

    } else {
      alertify.warning('There are some technical issues, Please try again.')
      this.setState({ syncModal: false, syncModalValue: 0 })
    }

  }
  render() {
    return (
      <div>
        <Modal isOpen={this.state.syncModal} toggle={this.toggleSyncModal}>
          <ModalHeader toggle={this.toggleSyncModal}>Sync Time</ModalHeader>
          <ModalBody>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
              <Button
                onClick={this.syncModalDecrementBtnOnClick}
                style={{ marginRight: 20, }}
                outline
                variant="outlined"
                color="danger"
              >
                Sync -
            </Button>
              <Input
                value={this.state.syncModalValue}
                name='secondsValue'
                placeholder={'Enter value'}
                style={{ color: 'black', width: 140 }}
                onChange={(e) => this.validateNumber(e, /^\d*$/, 'syncModalValue')}
                disableUnderline
                className="secondsInput"
              />

              <Button
                className="startRecord"
                onClick={this.syncModalIncrementBtnOnClick}
                variant="contained"
                outline
                variant="outlined"
                color="danger"
              >
                Sync +
              </Button>
            </div>
          </ModalBody>
          <ModalFooter>
            {/* <Button color="primary" onClick={this.syncTimerWithIndex}>Set</Button>{' '} */}
            <Button color="secondary" onClick={this.toggleSyncModal}>Cancel</Button>
          </ModalFooter>
        </Modal>
        <div className="App">
          <div className="App1">
            {!this.state.showPlayer && (
              <div className="loadMediaButton">
                <Button
                  variant="contained"
                  outline
                  color="danger">
                  <input
                    type="file"
                    id="files"
                    style={{ display: 'none' }}
                    accept="application/JSON"
                    onChange={(e) => this.fileSelectHandler(e)}
                  />
                  <label style={{ marginBottom: '-0.5rem', cursor: "pointer" }} htmlFor="files">
                    Import JSON
                    </label>
                </Button>
              </div>
            )}

          </div>
          {this.state.showTimer && (
            <div className="timerStyle1">
              <div className="timersubStyle">
                <CountdownCircleTimer
                  isPlaying
                  duration={3}
                  size={150}
                  onComplete={() => this.onCompleteTimer()}
                  colors={[
                    ["#004777", 0.33],
                    ["#F7B801", 0.33],
                    ["#A30000", 0.33],
                  ]}>
                  {({ remainingTime }) => remainingTime}
                </CountdownCircleTimer>
              </div>
            </div>
          )}
          <div className="App2">
            <>
              {this.state.showNewPlayer ? (
                <div className="player">

                  <video id="player" width={200} height={200}></video>

                </div>
              ) : null}

              {this.state.showPlayer && (
                <div className={this.state.showNewPlayer ? "ButtonNew" : "Button"}>

                  <Button
                    className="startRecord"
                    onClick={this.onExportJson}
                    style={{ marginBottom: 20, }}
                    variant="contained"
                    outline
                    color="danger"
                  >
                    Export to JSON
                  </Button>
                  <Button
                    className="startRecord"
                    style={{ marginBottom: 20, }}
                    onClick={() => window.location.reload()}
                    outline
                    variant="outlined"
                    color="danger"
                  >
                    Upload new file
                  </Button>
                  <Button
                    variant="contained"
                    outline
                    color="danger">
                    <input
                      type="file"
                      id="files"
                      style={{ display: 'none', }}
                      accept="video/*,audio/*"
                      onChange={(e) => this.videoSelectHandler(e)}
                    />
                    <label style={{ marginBottom: '-0.5rem', cursor: "pointer" }} htmlFor="files">
                      Upload Video
                    </label>
                  </Button>
                  <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      onClick={this.onClickSyncDecrementButton}
                      style={{ marginRight: 20, }}
                      outline
                      variant="outlined"
                      color="danger"
                    >
                      Sync -
                  </Button>
                    <Input
                      value={this.state.secondsValue}
                      name='secondsValue'
                      placeholder={'Enter value'}
                      style={{ color: 'black', width: 140 }}
                      onChange={(e) => this.validateNumber(e, /^\d*$/, 'secondsValue')}
                      disableUnderline
                      className="secondsInput"
                    />

                    <Button
                      className="startRecord"
                      onClick={this.onClickSyncIncrementButton}
                      variant="contained"
                      outline
                      variant="outlined"
                      color="danger"
                    >
                      Sync +
                  </Button>
                  </div>

                </div>

              )}
              {this.state.showFirstTimer && (
                <div className="buttonStyle">
              
                  <div className="inputBox">
                    <InfiniteScroll
                      dataLength={this.state.current.length}
                      next={this.fetchMoreData}
                      endMessage='The End'
                      scrollThreshold={0.9}
                      hasMore={this.state.hasMore}
                      loader={<h4>Loading...</h4>}
                    >
                      {this.state.current && this.state.current.map((current_word, t_index) => {
                        return <><div className="buttonStyle">
                          <div className="inputBox" >
                            <Dropdown 
                              onChange={(e, changeAll = false) => this.onChangeSpeaker(e,current_word, changeAll)} 
                              defaultValue='Speaker'
                              value={current_word.speaker||"Speaker"}
                            />
                            {/* <input
                              className="speakerStyle"
                              onChange={(e) => this.onChangeSpeaker(e,current_word)}
                              defaultValue='Speaker'
                              value={current_word.speaker||"Speaker"} /> */}

                            {current_word.words.map((t_word, index) => (
                              <>
                                <input
                                  value={t_word.text}
                                  ref={this.inputRef}
                                  key={index}
                                  id={index}
                                  type="text"
                                  role="textbox"
                                  style={{
                                    width: (t_word.text.length * 8) + 8, background: '#fff', border: 0, outline: 'none', textAlign: 'center',
                                    fontWeight: this.state.mainJSON.transcript[t_index].words[index]&&parseFloat(this.state.mainJSON.transcript[t_index].words[index].start_time) <= parseFloat(this.plyr && this.plyr.currentTime) && parseFloat(this.state.mainJSON.transcript[t_index].words[index].end_time) > parseFloat(this.plyr && this.plyr.currentTime) ? "700" : 'normal',
                                    color: this.state.mainJSON.transcript[t_index].words[index]&&parseFloat(this.state.mainJSON.transcript[t_index].words[index].start_time) <= parseFloat(this.plyr && this.plyr.currentTime) && parseFloat(this.state.mainJSON.transcript[t_index].words[index].end_time) > parseFloat(this.plyr && this.plyr.currentTime) ? 'blueviolet' : 'black'
                                  }}
                                  onFocus={this.handleFocus}
                                  onBlur={(e) => this.onBlurText(e,t_index,index)}
                                  onClick={() => this.onClickWord(t_word)}
                                  onChange={(e) => this.onChangeTextValue(e,t_index,index)}
                                  onKeyPress={e => this.onKeyPress(e, t_index, index)}
                                  onKeyDown={e => this.onKeyDown(e, t_index, index)}
                                  onContextMenu={e => {e.preventDefault(); this.openSyncModal(t_index, index);}}
                                  onDoubleClick={(e) => this.onDoubleClickEditWord(e, t_index, index)}
                                />

                              </>
                            )
                            )
                            }</div></div><br /></>
                      })}
                    </InfiniteScroll>
                  </div>

                </div>

              )}
            </>
          </div>
        </div>
      </div>
    );
  }

  /**
   *
   * function to upload audio or video type file and store txt value in state
   */

  fileSelectHandler = (e) => {
    this.count = 0
    this.setState({ fileName: e.target.files[0].name.split(".")[0] });
    if (e.target.files && e.target.files[0]) {
      let reader = new FileReader();
      reader.onload = (e) => {
        this.setState({ showFirstTimer: true, mainJSON: JSON.parse(e.target.result) });
        
        this.setState({ showPlayer: true, current: this.state.mainJSON.transcript.slice(this.state.prev, this.state.next) })
      };
      reader.readAsText(e.target.files[0]);
      fetch(e.target.files[0])
        .then((res) => { res.json() })
        .then((data) => {
        })
    }
  };

onChangeSpeaker=(e,current_word, changeAll)=>{
    let oldSpeaker = current_word.speaker
    current_word.speaker = e.target.value;
    if(changeAll){
      this.state.mainJSON.transcript.map((t_words, t_index) => {
        if(t_words.speaker == oldSpeaker){
          t_words.speaker = e.target.value
        }
      })
    }

    this.setState({ speaker: e.target.value })

    
}


onChangeTextValue=(e,t_index,index)=>{

  this.state.mainJSON.transcript[t_index]['words'][index].text = e.target.value
  this.setState({ selectedWord: e.target.value,/* currentWidth  */})
}

onKeyDown = (e, t_index, w_index) => {
  var key = e.keyCode || e.charCode;

  if(key == 8 && w_index == 0 && e.target.selectionStart == 0 && t_index > 0){
    e.preventDefault()
    var mainJSON = this.state.mainJSON    
    let currentWords = mainJSON.transcript[t_index].words

    var current = this.state.current
    
    current[t_index - 1].end_time = currentWords[currentWords.length - 1].end_time
    current[t_index - 1].words = [...current[t_index - 1].words]

    mainJSON.transcript[t_index - 1].end_time = currentWords[currentWords.length - 1].end_time
    mainJSON.transcript[t_index - 1].words = [...mainJSON.transcript[t_index - 1].words, ...currentWords]

    var slice1 = mainJSON.transcript.slice(0, t_index)
    var slice2 = mainJSON.transcript.slice(t_index + 1, mainJSON.transcript.length)

    var currentSlice1 = current.slice(0, t_index)
    var currentSlice2 = current.slice(t_index + 1, current.length)

    current = [...currentSlice1, ...currentSlice2]

    mainJSON.transcript = [ ...slice1, ...slice2 ]

    this.setState({ mainJSON, current })
  }

}

onKeyPress = (e, t_index, w_index) => {
  if ( e.key === 'Enter' ) {
    // ENTER IS PRESSED
      if(((this.state.mainJSON.transcript[t_index].words.length - 1) == w_index && e.target.value.length == e.target.selectionStart) || (w_index == 0 && e.target.value.length != e.target.selectionStart)){
        // if this is last word or first word do nothing...
      } else {

        let slice1 = this.state.mainJSON.transcript.slice(0, t_index + 1)
        let slice2 = this.state.mainJSON.transcript.slice(t_index + 1, this.state.mainJSON.transcript.length)

        let currentSlice1 = this.state.current.slice(0, t_index + 1)
        let currentSlice2 = this.state.current.slice(t_index + 1, this.state.current.length)
        
        
        var wordSlice1 = this.state.mainJSON.transcript[t_index].words.slice(0, e.target.value.length == e.target.selectionStart ? w_index + 1 : w_index) 
        var wordSlice2 = this.state.mainJSON.transcript[t_index].words.slice(e.target.value.length == e.target.selectionStart ? w_index + 1 : w_index, this.state.mainJSON.transcript[t_index].words.length)

        slice1[slice1.length - 1].end_time = wordSlice1[wordSlice1.length - 1].end_time
        slice1[slice1.length - 1].words = wordSlice1

        currentSlice1[currentSlice1.length - 1].end_time = wordSlice1[wordSlice1.length - 1].end_time
        currentSlice1[currentSlice1.length - 1].words = wordSlice1
        
        let newTrans = {
          "speaker":this.state.mainJSON.transcript[t_index].speaker,
          "start_time":wordSlice2[0].start_time,
          "end_time":wordSlice2[wordSlice2.length-1].end_time,
          "words": wordSlice2
        }

        currentSlice1 = [...currentSlice1, newTrans]

        slice1.push(newTrans)
        
        let merged = [...slice1, ...slice2]
        let currentMerged = [ ...currentSlice1, ...currentSlice2 ]

        this.setState({ 
          mainJSON: { 
            ...this.state.mainJSON,
            transcript: merged
          } ,
          current: currentMerged,
          prev: this.state.prev + 1,
          next: this.state.next + 1
        })
      }
  }
}

onBlurText=(e,t_index,index)=>{
  if (e.target.value == '') {
    let totalWords = this.state.mainJSON.transcript[t_index]['words'].length
    let slice1 = this.state.mainJSON.transcript[t_index]['words'].slice(0, index)
    let slice2 = this.state.mainJSON.transcript[t_index]['words'].slice(index + 1, totalWords)

    let merged = [ ...slice1, ...slice2 ]

    let mainJSON = this.state.mainJSON

    mainJSON.transcript[t_index].words = merged

    this.setState({ mainJSON })
  }
}

  onCompleteTimer = (first) => {
    this.setState({ showTimer: false, showNewPlayer: true })
    this.plyr = new Plyr('#player');
    this.plyr.source = {
      type: 'video',
      title: 'myTitle',
      sources: [
        {
          src: this.state.url,
          type: 'video/mp4',
          size: 300,
        }
      ],
      speed: this.state.playbackRate
    };
    this.plyr.on('timeupdate', event => {
      this.setState({ currentTime: this.plyr.currentTime })
      const instance = event.detail.plyr;
      this.setState({ playingInstance: event.detail.plyr })
    });
  };

  videoSelectHandler = (e) => {
    this.count = 0
    if (e.target.files && e.target.files[0]) {
      let reader = new FileReader();
      reader.onload = (e) => {
        this.setState({ url: e.target.result, showTimer: true });

      };
      reader.readAsDataURL(e.target.files[0]);
      fetch(e.target.files[0])
        .then((res) => { res.json() })
        .then((data) => {
        })
    }
  };

  onSync = (ms) => {
    let seconds = ms / 1000;
    let final_words = [];
    let merged_text = "";
    this.state.mainJSON.transcript.map((t_words, t_index) => {
      let w_index = 0
      if(t_words.words!=null ||t_words.words!=undefined){
        for (let word of t_words.words) {
          // console.log(word);
          if (word && word.hasOwnProperty("start_time")) {
            let updated_start_time = word.start_time + seconds;
            let updated_end_time = word.end_time + seconds;
            if (updated_start_time <= 0) {
              merged_text += word.text + " ";
              if (updated_end_time > 0) {
                this.state.mainJSON.transcript[t_index][w_index]['start_time'] = 0
                this.state.mainJSON.transcript[t_index][w_index]['end_time'] = updated_end_time
                this.state.mainJSON.transcript[t_index][w_index]['text'] = merged_text
                merged_text = "";
  
              }
            }
            else {
              if (merged_text != "") {
                this.state.mainJSON.transcript[t_index][w_index]['start_time'] = 0
                this.state.mainJSON.transcript[t_index][w_index]['end_time'] = updated_end_time
                this.state.mainJSON.transcript[t_index][w_index]['text'] = merged_text + w_words.text
                merged_text = "";
              }
              else {
                this.state.mainJSON.transcript[t_index]['words'][w_index]['start_time'] = updated_start_time
                this.state.mainJSON.transcript[t_index]['words'][w_index]['end_time'] = updated_end_time
              }
            }
          }
          w_index += 1
        }
      }
      
      this.state.mainJSON.transcript[t_index]['start_time'] = this.state.mainJSON.transcript[t_index]['words'][0]['start_time']
      let last_index = this.state.mainJSON.transcript[t_index]['words'].length
      this.state.mainJSON.transcript[t_index]['end_time'] = this.state.mainJSON.transcript[t_index]['words'][last_index - 1]['end_time']
    })

    alertify.success(`Input time ${this.state.secondsValue} ms  has been added successfully`)

  }

  onClickWord = (word) => {
    if (this.plyr != undefined) {
      this.plyr.currentTime = word.start_time;
    }
  }


  onDoubleClickEditWord = (e, t_index, w_index) => {
    this.setState({  selectedWord: e.target.value, t_index, w_index }, () => {
    })
  }

  onClickSyncDecrementButton = () => {
    alertify.confirm(`Are you sure you want to decrease ${this.state.secondsValue} ms  ?`, async (status) => {
      if (status) {
        this.onSync("-" + this.state.secondsValue)
      }
    }).setHeader("").set('labels', { ok: 'OK', cancel: 'CANCEL' });
  }

  onClickSyncIncrementButton = () => {
    alertify.confirm(`Are you sure you want to increase ${this.state.secondsValue} ms  ?`, async (status) => {
      if (status) {
        this.onSync(this.state.secondsValue)
      }
    }).setHeader("").set('labels', { ok: 'OK', cancel: 'CANCEL' });
  }

  onExportJson = () => {
    
    let arr = this.state.mainJSON.transcript.map((main) => {
        main.words.filter((words) => {
        if (words) return main
      })
      return main
    })
    let export_json = {
      "name": this.state.fileName,
      "transcript": arr
    }
    this.download(
      JSON.stringify(export_json),
      this.state.fileName + ".json",
      "text/plain"
    );
  };

  download = (content, fileName, contentType) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  enterPressed = (event) => {
    var code = event.keyCode || event.which;
    if (code === 13) { //13 is the enter keycode
      event.preventDefault()
      this.updateJSON()
    }
  };

  validateNumber = (evt, regex, key) => {
    if (!regex.test(evt.target.value)) {
      return false;
    }
    else {
      this.setState({ [key]: evt.target.value, }, () => {
      })
    }
  }

  handleFocus = (event) => {
    event.target.select();
  }

}

export default (App);
