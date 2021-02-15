import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';



class Square extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };

    this.handleChange = this.handleChange.bind(this);
  } 

  handleChange(event) {
    //Check If Input Is Valid
    const validnums = ['', '1','2','3','4','5','6','7','8','9'];
    const enteredvalue = event.target.value;

    if(enteredvalue.length > 1) {
      this.setState({
        value: enteredvalue.slice(0,1),
      });
    }
    else if(!(validnums.includes(enteredvalue))) {
      this.setState({
        value: '',
      });
    }
    else {
      this.setState({
        value: event.target.value,
      });
      this.props.onChange(this.props.num,event.target.value);
    }
  }

  render() {
    var currentvalue = this.state.value;
    if(this.props.valueupdate !== undefined) {
      currentvalue = this.props.valueupdate;
    }

    return (
      <input type='text' className='square' onChange={this.handleChange} value={currentvalue} /> 
    );
  }
}



class Board extends React.Component {
  renderSquare(number, key, value) {
    return (
      <Square num={number} key={key} valueupdate={value} onChange={(pos,val) => this.props.onChange(pos,val)} />
    );
  }

  render() {
    var board = [];
    let number = 0;
    var values = this.props.value;

    //Keys for Array
    const keys = [];
    for (var m = 0; m < 81; m++) {
      keys.push(m.toString());
    }

    //Adding Rows
    for (var j = 0; j < 9; j++) {
      var row = [];
      for (var i = 0; i < 9; i++) {
        if(values.length > 0) {
          row.push(this.renderSquare(number, keys[number], values[number]));
          number++;
        }
        else {
          row.push(this.renderSquare(number, keys[number]));
          number++;
        }
      }
      const akey = ('row_' + j.toString());
      board.push(<div key={akey} className='row'>{row}</div>);
    }

    return (
      <div>

        <div id='board'>
          {board}
        </div>

      </div>
    );
  }

}


class SudokuSolver extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      puzzleinput: Array(9).fill(NaN).map(row => new Array(9).fill(NaN)),
      puzzleoutput: [],
    };
  }

  handleNumber(pos,val) {
    const position = pos;
    const value = parseInt(val);
    const isrow = parseInt(position / 9);
    const iscol = (position % 9);

    let newarray = this.state.puzzleinput;
    newarray[isrow][iscol] = value;
    this.setState({
      puzzleinput: newarray,
    });

  }

  //Functions For solveSudoku()

  NotInRow(array, row, num, setting) {
    var inrow = [];
    if(setting === 'two') {
      for(var i = 0; i < 9; i++) {
        if(!isNaN(array[row][i])) {
          inrow.push(array[row][i])
        }
      }
      inrow.splice(inrow.indexOf(num),1);
    }
    else {
      inrow = array[row];
    }

    if(inrow.includes(num)) {
      return false;
    }
    else {
      return true;
    }
  }

  NotInCol(array, col, num, setting) {
    var incol = [];
    for(var i = 0; i < 9; i++) {
      if(!isNaN(array[i][col])) {
        incol.push(array[i][col]);
      }
    }

    if(setting === 'two') {
      incol.splice(incol.indexOf(num),1);
    }

    if(incol.includes(num)) {
      return false;
    }
    else {
      return true;
    }
  }

  NotInBox(array, row, col, num, setting) {
    //Position
    var boxrow = 0;
    var boxcol = 0;
    if(2 < row && row < 6) {
      boxrow = 3;
    }
    else if(row > 5) {
      boxrow = 6;
    }
    if(2 < col && col < 6) {
      boxcol = 3;
    }
    else if(col > 5) {
      boxcol = 6;
    }

    //Get Values of Box
    var tempbox = [];

    for(var i = 0; i < 3; i++) {
      for(var j = 0; j < 3; j++) {
        tempbox.push(array[boxrow+i][boxcol+j]);
      }
    }

    if(setting === 'two') {
      tempbox.splice(tempbox.indexOf(num),1);
    }

    //Check if Value in Box
    if(tempbox.includes(num)) {
      return false;
    }
    else {
      return true;
    }
  }

  CanNumberBePlaced(array, row, col, num) {
    if(this.NotInRow(array, row, num, 'one') && this.NotInCol(array, col, num, 'one') && this.NotInBox(array, row, col, num, 'one') && isNaN(array[row][col])) {
      return true;
    }
    else {
      return false;
    }
  }

  IsUserInputValid() {
    document.getElementById('invalidinput').style.display = 'none';
    var array = this.state.puzzleinput;

    for(var row = 0; row < 9; row++) {
      for(var col = 0; col < 9; col++) {
        if(!isNaN(array[row][col])) {
          if(!this.NotInRow(array, row, array[row][col], 'two') || !this.NotInCol(array, col, array[row][col], 'two') || !this.NotInBox(array, row, col, array[row][col], 'two')) {
            document.getElementById('invalidinput').style.display = 'block';
            return false;
          }
        }
      }
    }
    return true;
  }

  CopyArray() {
    var puzzlearray = Array(9).fill(NaN).map(row => new Array(9).fill(NaN));
    for(var m = 0; m < 9; m++) {
      for(var n = 0; n < 9; n++) {
        puzzlearray[m][n] = this.state.puzzleinput[m][n];
      }
    }
    return puzzlearray;
  }

  SudokuSolver(array) {
    var row = 0;
    var col = 0;
    var emptybox = false;

    //Find Empty Box
    for(row = 0; row < array.length; row++) {
      for(col = 0; col < array[row].length; col++) {
        if(isNaN(array[row][col])) {
          emptybox = true;
          break;
        }
      }
      if(emptybox) {
        break;
      }
    }
    if(!emptybox) {
      return true;
    }

    //Place Number
    for(var num = 1; num < 10; num++) {
      if(this.CanNumberBePlaced(array, row, col, num)) {
        array[row][col] = num;

        if(this.SudokuSolver(array)) {
          return true;
        }
        else {
          array[row][col] = NaN;
        }
      }
    }
    return false;
  }


  //Solve Sudoku Function
  solveSudoku() {
    //Is User Input Valid
    if(!this.IsUserInputValid()) {
      return 1;
    }

    //Array Copy
    var puzzlearray = this.CopyArray();

    //Solve
    if(!this.SudokuSolver(puzzlearray)) {
      document.getElementById('notsolvable').style.display = 'block';
      return false;
    }

    //Make Array Back Into List
    var puzzleoutputlist = this.state.puzzleoutput;
    for(var row = 0; row < 9; row++) {
      for(var col = 0; col < 9; col++) {
        puzzleoutputlist.push(puzzlearray[row][col]);
      }
    }

    this.setState({
      puzzleoutput: puzzleoutputlist,
    });
    
    document.getElementById('solvebutton').disabled = true;

  }


  render() {
    return (
      <div id='all'>
        <h1>Minimalist Sudoku Solver</h1>
        <Board value={this.state.puzzleoutput} onChange={(pos,val) => this.handleNumber(pos,val)} />
        <h2 id='invalidinput'>Invalid Input</h2>
        <h2 id='notsolvable'>Not Solvable</h2>
        <button id='solvebutton' onClick={() => {this.solveSudoku()}}>Solve</button>
        <br />
        <button id='clear' onClick={() => {window.location.reload();}}>Clear</button>
      </div>
    );
  }
}



ReactDOM.render(
  <SudokuSolver />,
  document.getElementById('root')
);
