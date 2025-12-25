import React, { useState, useEffect, useRef, useCallback } from 'react';

type SquareType = 'tw' | 'dw' | 'tl' | 'dl' | 'start' | 'normal';

interface Square {
  letter: string;
  type: SquareType;
  row: number;
  col: number;
}

// Official Scrabble letter point values
const LETTER_VALUES: { [key: string]: number } = {
  'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1,
  'F': 4, 'G': 2, 'H': 4, 'I': 1, 'J': 8,
  'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1,
  'P': 3, 'Q': 10, 'R': 1, 'S': 1, 'T': 1,
  'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4,
  'Z': 10
};

const ScrabbleBoard: React.FC = () => {
  const [selectedSquare, setSelectedSquare] = useState<{ row: number; col: number } | null>(null);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentWord, setCurrentWord] = useState<{
    tiles: { row: number; col: number; letter: string }[];
    score: number;
    lastTile: { row: number; col: number } | null;
  }>({ tiles: [], score: 0, lastTile: null });
  const [playingWord, setPlayingWord] = useState(false);
  const [lockedOrientation, setLockedOrientation] = useState<'horizontal' | 'vertical' | null>(null);
  
  // Track all completed words
  const [completedWords, setCompletedWords] = useState<Array<{
    word: string;
    score: number;
    tiles: { row: number; col: number; letter: string }[];
    orientation: 'horizontal' | 'vertical';
  }>>([]);
  
  // Track which word's tiles should be highlighted
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number | null>(null);
  
  // Track if we're in edit mode for a completed word
  const [editingWordIndex, setEditingWordIndex] = useState<number | null>(null);
  
  // Track if showing clear board confirmation modal
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Track the currently displayed word (for words not yet in completedWords)
  const [displayedWord, setDisplayedWord] = useState<{
    word: string;
    score: number;
    tiles: { row: number; col: number; letter: string }[];
    orientation: 'horizontal' | 'vertical';
  } | null>(null);

  // Define the board layout with premium squares
  const getBoardLayout = (): SquareType[][] => {
    const board: SquareType[][] = Array(15).fill(null).map(() => Array(15).fill('normal'));

    // Triple Word Score (TW) - corners and middle edges
    const twPositions = [
      [0, 0], [0, 7], [0, 14],
      [7, 0], [7, 14],
      [14, 0], [14, 7], [14, 14]
    ];
    twPositions.forEach(([r, c]) => board[r][c] = 'tw');

    // Double Word Score (DW) - diagonal pattern
    const dwPositions = [
      [1, 1], [2, 2], [3, 3], [4, 4],
      [1, 13], [2, 12], [3, 11], [4, 10],
      [10, 4], [11, 3], [12, 2], [13, 1],
      [10, 10], [11, 11], [12, 12], [13, 13]
    ];
    dwPositions.forEach(([r, c]) => board[r][c] = 'dw');

    // Triple Letter Score (TL)
    const tlPositions = [
      [1, 5], [1, 9],
      [5, 1], [5, 5], [5, 9], [5, 13],
      [9, 1], [9, 5], [9, 9], [9, 13],
      [13, 5], [13, 9]
    ];
    tlPositions.forEach(([r, c]) => board[r][c] = 'tl');

    // Double Letter Score (DL)
    const dlPositions = [
      [0, 3], [0, 11],
      [2, 6], [2, 8],
      [3, 0], [3, 7], [3, 14],
      [6, 2], [6, 6], [6, 8], [6, 12],
      [7, 3], [7, 11],
      [8, 2], [8, 6], [8, 8], [8, 12],
      [11, 0], [11, 7], [11, 14],
      [12, 6], [12, 8],
      [14, 3], [14, 11]
    ];
    dlPositions.forEach(([r, c]) => board[r][c] = 'dl');

    // Center star (start position)
    board[7][7] = 'start';

    return board;
  };

  const boardLayout = getBoardLayout();
  const [squares, setSquares] = useState<Square[][]>(
    boardLayout.map((row, rowIdx) =>
      row.map((type, colIdx) => ({
        letter: '',
        type,
        row: rowIdx,
        col: colIdx
      }))
    )
  );
  
  // Track which premium tiles have been triggered
  const [triggeredTiles, setTriggeredTiles] = useState<Set<string>>(new Set());

  const getSquareClass = (type: SquareType, row: number, col: number): string => {
    const tileKey = `${row}-${col}`;
    const isTriggered = triggeredTiles.has(tileKey);
    const baseClasses = 'w-10 h-10 border border-gray-400 flex items-center justify-center text-xs font-bold relative cursor-pointer transition-all';
    
    // If triggered, show muted/greyed out version
    const opacity = isTriggered ? 'opacity-50' : '';
    
    switch (type) {
      case 'tw':
        return `${baseClasses} bg-red-600 text-white ${opacity}`;
      case 'dw':
        return `${baseClasses} bg-pink-400 text-white ${opacity}`;
      case 'tl':
        return `${baseClasses} bg-blue-600 text-white ${opacity}`;
      case 'dl':
        return `${baseClasses} bg-sky-300 text-white ${opacity}`;
      case 'start':
        return `${baseClasses} bg-pink-400 text-white ${opacity}`;
      default:
        return `${baseClasses} bg-emerald-50`;
    }
  };

  const getSquareLabel = (type: SquareType): string => {
    switch (type) {
      case 'tw':
        return 'TW';
      case 'dw':
        return 'DW';
      case 'tl':
        return 'TL';
      case 'dl':
        return 'DL';
      case 'start':
        return '★';
      default:
        return '';
    }
  };

  const handleSquareClick = (row: number, col: number) => {
    const clickedSquare = squares[row][col];
    const isBlank = !clickedSquare.letter;

    // If clicking on a blank tile, allow starting a new word
    if (isBlank) {
      // If we're not playing a word, just select the square
      if (!playingWord) {
        setSelectedSquare({ row, col });
        setHighlightedWordIndex(null);
        setEditingWordIndex(null);
        setDisplayedWord(null);
      } else {
        // If we're playing a word, allow selection within the word being played
        setSelectedSquare({ row, col });
      }
      return;
    }

    // If clicking on a tile with a letter, find words that start or end at this position
    if (!isBlank && !playingWord) {
      const wordsAtPosition = findWordsAtPosition(row, col);
      
      if (wordsAtPosition.length > 0) {
        // Find matching completed word or create a display word
        let wordToHighlight: number | null = null;
        
        // Try to find a matching completed word
        for (let i = 0; i < completedWords.length; i++) {
          const completedWord = completedWords[i];
          const matchingWord = wordsAtPosition.find(w => 
            w.orientation === completedWord.orientation &&
            w.tiles.length === completedWord.tiles.length &&
            w.tiles.every((t, idx) => 
              t.row === completedWord.tiles[idx].row && 
              t.col === completedWord.tiles[idx].col
            )
          );
          if (matchingWord) {
            wordToHighlight = i;
            break;
          }
        }

        // If no completed word found, but we have words at this position, show the first one
        if (wordToHighlight === null && wordsAtPosition.length > 0) {
          // Set orientation to match the first word found
          setOrientation(wordsAtPosition[0].orientation);
          // Display this word (it's not in completedWords yet)
          setDisplayedWord({
            word: wordsAtPosition[0].word,
            score: wordsAtPosition[0].score,
            tiles: wordsAtPosition[0].tiles,
            orientation: wordsAtPosition[0].orientation
          });
        } else {
          setDisplayedWord(null);
        }

        // If clicking the same square, cycle through words at this position
        if (selectedSquare?.row === row && selectedSquare?.col === col) {
          if (wordToHighlight !== null) {
            // Cycle through completed words at this position
            const allWordIndices: number[] = [];
            completedWords.forEach((word, index) => {
              const isPartOfWord = word.tiles.some(tile => tile.row === row && tile.col === col);
              if (isPartOfWord) {
                allWordIndices.push(index);
              }
            });
            
            if (allWordIndices.length > 1) {
              const currentPos = allWordIndices.indexOf(wordToHighlight);
              const nextPos = (currentPos + 1) % allWordIndices.length;
              setHighlightedWordIndex(allWordIndices[nextPos]);
              setOrientation(completedWords[allWordIndices[nextPos]].orientation);
            } else {
              // Toggle orientation to show other word if it exists
              const newOrientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
              const wordAtNewOrientation = wordsAtPosition.find(w => w.orientation === newOrientation);
              if (wordAtNewOrientation) {
                setOrientation(newOrientation);
                // Try to find matching completed word for new orientation
                const matchingWord = completedWords.findIndex(w => 
                  w.orientation === newOrientation &&
                  w.tiles.some(t => t.row === row && t.col === col)
                );
                if (matchingWord !== -1) {
                  setHighlightedWordIndex(matchingWord);
                } else {
                  setHighlightedWordIndex(null);
                }
              }
            }
          } else {
            // Toggle orientation
            setOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
          }
        } else {
          // New selection - highlight the word
          if (wordToHighlight !== null) {
            setHighlightedWordIndex(wordToHighlight);
            setOrientation(completedWords[wordToHighlight].orientation);
          } else if (wordsAtPosition.length > 0) {
            // Show the word but don't highlight as completed
            setHighlightedWordIndex(null);
            setOrientation(wordsAtPosition[0].orientation);
            setDisplayedWord({
              word: wordsAtPosition[0].word,
              score: wordsAtPosition[0].score,
              tiles: wordsAtPosition[0].tiles,
              orientation: wordsAtPosition[0].orientation
            });
          }
          setSelectedSquare({ row, col });
        }
      } else {
        // Tile has letter but no word found - just select it
        setSelectedSquare({ row, col });
        setHighlightedWordIndex(null);
        setDisplayedWord(null);
      }
    } else if (!isBlank && playingWord) {
      // If playing a word and clicking on a tile with a letter, don't allow it
      // (user should only be able to type on blank tiles)
      return;
    }
  };

  const isSelected = (row: number, col: number): boolean => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };

  const finishWord = useCallback(() => {
    if (currentWord.tiles.length > 1) {
      // Mark all premium tiles in this word as triggered (only if not already triggered)
      const newTriggeredTiles = new Set(triggeredTiles);
      currentWord.tiles.forEach(tile => {
        const tileKey = `${tile.row}-${tile.col}`;
        const squareType = squares[tile.row][tile.col].type;
        // Mark premium tiles as triggered (only if not already triggered)
        if (squareType !== 'normal' && !triggeredTiles.has(tileKey)) {
          newTriggeredTiles.add(tileKey);
        }
      });
      setTriggeredTiles(newTriggeredTiles);
      
      if (editingWordIndex !== null) {
        // Update existing word
        setCompletedWords(prev => {
          const updated = [...prev];
          updated[editingWordIndex] = {
            word: currentWord.tiles.map(t => t.letter).join(''),
            score: currentWord.score,
            tiles: [...currentWord.tiles],
            orientation: lockedOrientation || orientation
          };
          return updated;
        });
        // Highlight the edited word
        setHighlightedWordIndex(editingWordIndex);
        setEditingWordIndex(null);
      } else {
        // Save new word
        const newWord = {
          word: currentWord.tiles.map(t => t.letter).join(''),
          score: currentWord.score,
          tiles: [...currentWord.tiles],
          orientation: lockedOrientation || orientation
        };
        setCompletedWords(prev => {
          const updated = [...prev, newWord];
          // Highlight the newly added word (it's the last one in the array)
          setHighlightedWordIndex(updated.length - 1);
          return updated;
        });
      }
      
      // Keep selection on the first tile of the completed word
      if (currentWord.tiles.length > 0) {
        setSelectedSquare({ row: currentWord.tiles[0].row, col: currentWord.tiles[0].col });
      }
    }
    
    setPlayingWord(false);
    setLockedOrientation(null);
  }, [currentWord, triggeredTiles, squares, editingWordIndex, lockedOrientation, orientation]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedSquare) return;

      const { row, col } = selectedSquare;

      // Handle Enter key to finish word
      if (e.key === 'Enter' && playingWord) {
        e.preventDefault();
        finishWord();
        return;
      }

      // Handle letter input (A-Z)
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        // Only allow typing on blank tiles
        if (squares[row][col].letter) {
          // Tile already has a letter - don't allow typing
          return;
        }

        // Only allow typing if we're in playing mode or edit mode, or if tile is blank
        if (!playingWord && editingWordIndex === null) {
          // Start a new word on blank tile
          setPlayingWord(true);
          setLockedOrientation(orientation);
          setHighlightedWordIndex(null);
          setDisplayedWord(null);
        }
        
        const letter = e.key.toUpperCase();
        setSquares(prev => {
          const newSquares = [...prev];
          newSquares[row][col] = { ...newSquares[row][col], letter };
          return newSquares;
        });

        // Start playing word mode after first letter
        if (!playingWord) {
          setPlayingWord(true);
          setLockedOrientation(orientation);
        }

        // Auto-advance to next square (skip tiles that already have letters)
        const nextPos = getNextPosition(row, col, orientation);
        if (nextPos) {
          // Skip over tiles that already have letters
          let posToSelect = nextPos;
          while (posToSelect && squares[posToSelect.row][posToSelect.col].letter) {
            const next = getNextPosition(posToSelect.row, posToSelect.col, orientation);
            if (!next) break;
            posToSelect = next;
          }
          setSelectedSquare(posToSelect);
        }
      }
      // Handle backspace
      else if (e.key === 'Backspace') {
        e.preventDefault();
        
        // Only allow deletion in playing or edit mode
        if (playingWord || editingWordIndex !== null) {
          setSquares(prev => {
            const newSquares = [...prev];
            newSquares[row][col] = { ...newSquares[row][col], letter: '' };
            return newSquares;
          });

          // Move to previous square
          const prevPos = getPreviousPosition(row, col, orientation);
          if (prevPos) {
            setSelectedSquare(prevPos);
          }
        }
      }
      // Handle arrow keys - allow free movement if no valid word is being played
      // (currentWord.tiles.length <= 1 means no valid word)
      else if (e.key === 'ArrowRight' && col < 14) {
        const hasValidWord = currentWord.tiles.length > 1;
        if (!playingWord || !hasValidWord || lockedOrientation === 'horizontal') {
          setSelectedSquare({ row, col: col + 1 });
          setOrientation('horizontal');
        }
      }
      else if (e.key === 'ArrowLeft' && col > 0) {
        const hasValidWord = currentWord.tiles.length > 1;
        if (!playingWord || !hasValidWord || lockedOrientation === 'horizontal') {
          setSelectedSquare({ row, col: col - 1 });
          setOrientation('horizontal');
        }
      }
      else if (e.key === 'ArrowDown' && row < 14) {
        const hasValidWord = currentWord.tiles.length > 1;
        if (!playingWord || !hasValidWord || lockedOrientation === 'vertical') {
          setSelectedSquare({ row: row + 1, col });
          setOrientation('vertical');
        }
      }
      else if (e.key === 'ArrowUp' && row > 0) {
        const hasValidWord = currentWord.tiles.length > 1;
        if (!playingWord || !hasValidWord || lockedOrientation === 'vertical') {
          setSelectedSquare({ row: row - 1, col });
          setOrientation('vertical');
        }
      }
      // Handle space to toggle orientation - allow if no valid word is being played
      else if (e.key === ' ') {
        e.preventDefault();
        const hasValidWord = currentWord.tiles.length > 1;
        if (!playingWord || !hasValidWord) {
          setOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
          
          // If a word is highlighted, toggle to show the other orientation's word at same position
          if (highlightedWordIndex !== null && selectedSquare) {
            const newOrientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
            const wordAtNewOrientation = completedWords.findIndex(w => 
              w.orientation === newOrientation && 
              w.tiles.some(t => t.row === selectedSquare.row && t.col === selectedSquare.col)
            );
            if (wordAtNewOrientation !== -1) {
              setHighlightedWordIndex(wordAtNewOrientation);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSquare, orientation, playingWord, lockedOrientation, squares, editingWordIndex, triggeredTiles, completedWords, highlightedWordIndex, displayedWord, finishWord, currentWord]);

  const getNextPosition = (row: number, col: number, dir: 'horizontal' | 'vertical'): { row: number; col: number } | null => {
    if (dir === 'horizontal' && col < 14) {
      return { row, col: col + 1 };
    } else if (dir === 'vertical' && row < 14) {
      return { row: row + 1, col };
    }
    return null;
  };

  const getPreviousPosition = (row: number, col: number, dir: 'horizontal' | 'vertical'): { row: number; col: number } | null => {
    if (dir === 'horizontal' && col > 0) {
      return { row, col: col - 1 };
    } else if (dir === 'vertical' && row > 0) {
      return { row: row - 1, col };
    }
    return null;
  };

  const getLetterValue = (letter: string): number => {
    return LETTER_VALUES[letter.toUpperCase()] || 0;
  };

  // Check if a tile is part of the highlighted word
  const isTileHighlighted = (row: number, col: number): boolean => {
    if (highlightedWordIndex !== null) {
      const word = completedWords[highlightedWordIndex];
      return word.tiles.some(tile => tile.row === row && tile.col === col);
    }
    if (displayedWord !== null) {
      return displayedWord.tiles.some(tile => tile.row === row && tile.col === col);
    }
    return false;
  };

  // Find the current word string starting from any position
  const findCurrentWord = (row: number, col: number, dir: 'horizontal' | 'vertical') => {
    const tiles: { row: number; col: number; letter: string }[] = [];
    
    if (dir === 'horizontal') {
      // Find the start of the word (leftmost letter)
      let startCol = col;
      while (startCol > 0 && squares[row][startCol - 1].letter) {
        startCol--;
      }
      
      // Collect all consecutive letters
      let currentCol = startCol;
      while (currentCol < 15 && squares[row][currentCol].letter) {
        tiles.push({
          row,
          col: currentCol,
          letter: squares[row][currentCol].letter
        });
        currentCol++;
      }
    } else {
      // Find the start of the word (topmost letter)
      let startRow = row;
      while (startRow > 0 && squares[startRow - 1][col].letter) {
        startRow--;
      }
      
      // Collect all consecutive letters
      let currentRow = startRow;
      while (currentRow < 15 && squares[currentRow][col].letter) {
        tiles.push({
          row: currentRow,
          col,
          letter: squares[currentRow][col].letter
        });
        currentRow++;
      }
    }
    
    // Calculate score with premium tiles
    let baseScore = 0;
    let wordMultiplier = 1;
    
    tiles.forEach(tile => {
      const tileKey = `${tile.row}-${tile.col}`;
      const squareType = squares[tile.row][tile.col].type;
      const letterValue = getLetterValue(tile.letter);
      let letterScore = letterValue;
      
      // Only apply premium if tile hasn't been triggered yet
      if (!triggeredTiles.has(tileKey)) {
        // Apply letter multipliers first
        if (squareType === 'dl') {
          letterScore = letterValue * 2;
        } else if (squareType === 'tl') {
          letterScore = letterValue * 3;
        }
        
        // Track word multipliers
        if (squareType === 'dw' || squareType === 'start') {
          wordMultiplier *= 2;
        } else if (squareType === 'tw') {
          wordMultiplier *= 3;
        }
      }
      
      baseScore += letterScore;
    });
    
    // Apply word multipliers at the end
    const score = baseScore * wordMultiplier;
    
    // Get last tile
    const lastTile = tiles.length > 0 ? tiles[tiles.length - 1] : null;
    
    return { tiles, score, lastTile };
  };

  // Find words that start or end at a given position
  const findWordsAtPosition = (row: number, col: number): Array<{
    word: string;
    score: number;
    tiles: { row: number; col: number; letter: string }[];
    orientation: 'horizontal' | 'vertical';
    isStart: boolean;
    isEnd: boolean;
  }> => {
    const words: Array<{
      word: string;
      score: number;
      tiles: { row: number; col: number; letter: string }[];
      orientation: 'horizontal' | 'vertical';
      isStart: boolean;
      isEnd: boolean;
    }> = [];

    // Check horizontal word
    if (squares[row][col].letter) {
      const horizontalWord = findCurrentWord(row, col, 'horizontal');
      if (horizontalWord.tiles.length > 1) {
        const firstTile = horizontalWord.tiles[0];
        const lastTile = horizontalWord.tiles[horizontalWord.tiles.length - 1];
        words.push({
          word: horizontalWord.tiles.map(t => t.letter).join(''),
          score: horizontalWord.score,
          tiles: horizontalWord.tiles,
          orientation: 'horizontal',
          isStart: firstTile.row === row && firstTile.col === col,
          isEnd: lastTile.row === row && lastTile.col === col
        });
      }
    }

    // Check vertical word
    if (squares[row][col].letter) {
      const verticalWord = findCurrentWord(row, col, 'vertical');
      if (verticalWord.tiles.length > 1) {
        const firstTile = verticalWord.tiles[0];
        const lastTile = verticalWord.tiles[verticalWord.tiles.length - 1];
        words.push({
          word: verticalWord.tiles.map(t => t.letter).join(''),
          score: verticalWord.score,
          tiles: verticalWord.tiles,
          orientation: 'vertical',
          isStart: firstTile.row === row && firstTile.col === col,
          isEnd: lastTile.row === row && lastTile.col === col
        });
      }
    }

    return words;
  };

  // Update current word whenever squares or selection changes
  useEffect(() => {
    if (selectedSquare) {
      const word = findCurrentWord(selectedSquare.row, selectedSquare.col, orientation);
      setCurrentWord(word);
      
      // Only automatically enter playingWord mode if:
      // 1. We're not already in playingWord mode
      // 2. The selected tile is blank (allowing new word entry)
      // 3. There's a word being formed (length > 1)
      if (word.tiles.length > 1 && !playingWord) {
        const selectedTile = squares[selectedSquare.row][selectedSquare.col];
        // Only auto-enter playing mode if we're on a blank tile or editing
        if (!selectedTile.letter || editingWordIndex !== null) {
          setPlayingWord(true);
          setLockedOrientation(orientation);
        }
      }
      // Exit playingWord mode if all letters are deleted (no valid word)
      if (playingWord && word.tiles.length <= 1 && editingWordIndex === null) {
        setPlayingWord(false);
        setLockedOrientation(null);
      }
    } else {
      setCurrentWord({ tiles: [], score: 0, lastTile: null });
    }
  }, [squares, selectedSquare, orientation, playingWord, editingWordIndex]);

  // Close modal when clicking outside modal or word tiles
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if we're playing a word
      if (playingWord) return;
      
      // Don't close if there's no modal to close
      if (highlightedWordIndex === null && displayedWord === null) return;
      
      const target = e.target as HTMLElement;
      
      // Check if click is on the modal itself
      if (modalRef.current && modalRef.current.contains(target)) {
        return;
      }
      
      // Check if click is on a word tile (highlighted or displayed word)
      const isWordTile = () => {
        // Find the closest element with data-row and data-col attributes
        let currentElement: HTMLElement | null = target;
        while (currentElement) {
          const row = currentElement.getAttribute('data-row');
          const col = currentElement.getAttribute('data-col');
          
          if (row !== null && col !== null) {
            const tileRow = parseInt(row);
            const tileCol = parseInt(col);
            
            // Check if this tile is part of the highlighted/displayed word
            if (highlightedWordIndex !== null) {
              const word = completedWords[highlightedWordIndex];
              if (word.tiles.some(tile => tile.row === tileRow && tile.col === tileCol)) {
                return true;
              }
            }
            if (displayedWord !== null) {
              if (displayedWord.tiles.some(tile => tile.row === tileRow && tile.col === tileCol)) {
                return true;
              }
            }
          }
          
          currentElement = currentElement.parentElement;
        }
        return false;
      };
      
      // If click is not on modal or word tile, close the modal
      if (!isWordTile()) {
        setHighlightedWordIndex(null);
        setDisplayedWord(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [highlightedWordIndex, displayedWord, playingWord, completedWords]);

  const editWord = () => {
    if (highlightedWordIndex !== null) {
      const wordToEdit = completedWords[highlightedWordIndex];
      setEditingWordIndex(highlightedWordIndex);
      setPlayingWord(true);
      setLockedOrientation(wordToEdit.orientation);
      setOrientation(wordToEdit.orientation);
      // Select the first tile of the word
      if (wordToEdit.tiles.length > 0) {
        setSelectedSquare({ row: wordToEdit.tiles[0].row, col: wordToEdit.tiles[0].col });
      }
    }
  };

  const clearBoard = () => {
    // Reset all state
    setSquares(
      boardLayout.map((row, rowIdx) =>
        row.map((type, colIdx) => ({
          letter: '',
          type,
          row: rowIdx,
          col: colIdx
        }))
      )
    );
    setCompletedWords([]);
    setTriggeredTiles(new Set());
    setPlayingWord(false);
    setLockedOrientation(null);
    setSelectedSquare(null);
    setHighlightedWordIndex(null);
    setEditingWordIndex(null);
    setCurrentWord({ tiles: [], score: 0, lastTile: null });
    setDisplayedWord(null);
    setShowClearConfirmation(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-amber-900 text-center">Scrabble Board</h1>
        <p className="text-center text-amber-700 mt-2">Click a square and start typing!</p>
        <p className="text-center text-amber-600 text-sm mt-1">
          Arrow keys to move • Space to toggle direction • Backspace to delete
        </p>
        {(completedWords.length > 0 || squares.some(row => row.some(sq => sq.letter))) && (
          <div className="text-center mt-3">
            <button
              onClick={() => setShowClearConfirmation(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105"
            >
              Clear Board
            </button>
          </div>
        )}
      </div>

      {/* Floating word score display - always visible when playing word */}
      {playingWord && currentWord.tiles.length > 1 && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl border-4 border-white flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold opacity-90">Current Word</span>
              <span className="text-3xl font-bold tracking-wider">
                {currentWord.tiles.map(t => t.letter).join('')}
              </span>
            </div>
            <div className="w-px h-12 bg-white opacity-30"></div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold opacity-90">Score</span>
              <span className="text-3xl font-bold">{currentWord.score}</span>
            </div>
            <button
              onClick={finishWord}
              className="ml-4 bg-white text-green-600 px-6 py-2 rounded-xl font-bold hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg"
            >
              {editingWordIndex !== null ? 'Save Changes' : 'Finish Word'}
            </button>
          </div>
        </div>
      )}

      {/* Display modal for completed word (not in edit mode) */}
      {!playingWord && (highlightedWordIndex !== null || displayedWord !== null) && (
        <div 
          ref={modalRef}
          className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300"
        >
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl border-4 border-white flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold opacity-90">Word</span>
              <span className="text-3xl font-bold tracking-wider">
                {highlightedWordIndex !== null 
                  ? completedWords[highlightedWordIndex].word 
                  : displayedWord?.word || ''}
              </span>
            </div>
            <div className="w-px h-12 bg-white opacity-30"></div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold opacity-90">Score</span>
              <span className="text-3xl font-bold">
                {highlightedWordIndex !== null 
                  ? completedWords[highlightedWordIndex].score 
                  : displayedWord?.score || 0}
              </span>
            </div>
            {highlightedWordIndex !== null && (
              <button
                onClick={editWord}
                className="ml-4 bg-white text-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
              >
                Edit Play
              </button>
            )}
          </div>
        </div>
      )}

      {/* Clear Board Confirmation Modal */}
      {showClearConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-in zoom-in duration-200">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Clear Board?</h2>
              <p className="text-gray-600 mb-6">
                This will remove all words and letters from the board. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowClearConfirmation(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-all transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={clearBoard}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                >
                  Clear Board
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-amber-900 p-4 rounded-lg shadow-2xl">
        <div className="bg-amber-800 p-3 rounded flex flex-col gap-[1px]">
          {squares.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-[1px]">
              {row.map((square, colIdx) => (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  data-row={rowIdx}
                  data-col={colIdx}
                  className={`
                    ${getSquareClass(square.type, rowIdx, colIdx)}
                    ${isSelected(rowIdx, colIdx) ? 'outline outline-4 outline-yellow-400 outline-offset-[-2px] scale-105 z-10 relative' : ''}
                    hover:scale-105
                  `}
                  onClick={() => handleSquareClick(rowIdx, colIdx)}
                >
                  {!square.letter && (
                    <span className="text-[10px] font-semibold opacity-80">
                      {getSquareLabel(square.type)}
                    </span>
                  )}
                  {square.letter && (
                    <div className={`
                      w-full h-full bg-amber-100 flex items-center justify-center border-2 border-amber-900 rounded shadow-md relative
                      transition-all duration-200
                      ${isTileHighlighted(rowIdx, colIdx) ? 'scale-110 shadow-xl ring-2 ring-blue-400 z-20' : ''}
                    `}>
                      <span className="text-2xl font-bold text-gray-800">
                        {square.letter}
                      </span>
                      <span className="absolute bottom-0 right-1 text-[10px] font-bold text-gray-600">
                        {LETTER_VALUES[square.letter] || 0}
                      </span>
                    </div>
                  )}
                  
                  {isSelected(rowIdx, colIdx) && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      {orientation === 'horizontal' ? (
                        <div className="bg-yellow-400 rounded-full p-1 shadow-lg">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </div>
                      ) : (
                        <div className="bg-yellow-400 rounded-full p-1 shadow-lg">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12l7 7 7-7"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-600 rounded"></div>
          <span className="text-amber-900 font-semibold">Triple Word</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-pink-400 rounded"></div>
          <span className="text-amber-900 font-semibold">Double Word</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded"></div>
          <span className="text-amber-900 font-semibold">Triple Letter</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-sky-300 rounded"></div>
          <span className="text-amber-900 font-semibold">Double Letter</span>
        </div>
      </div>

      {/* Completed Words History */}
      {completedWords.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-lg max-w-2xl">
          <h2 className="text-xl font-bold text-amber-900 mb-4 text-center">Words Played</h2>
          <div className="space-y-2">
            {completedWords.map((word, index) => (
              <div
                key={index}
                onClick={() => {
                  setHighlightedWordIndex(index);
                  if (word.tiles.length > 0) {
                    setSelectedSquare({ row: word.tiles[0].row, col: word.tiles[0].col });
                  }
                }}
                className={`
                  flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all
                  ${highlightedWordIndex === index 
                    ? 'bg-blue-100 border-2 border-blue-400 shadow-md' 
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                  <span className="text-2xl font-bold text-gray-800 tracking-wide">{word.word}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {word.orientation === 'horizontal' ? '→' : '↓'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600">{word.score} pts</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t-2 border-gray-200 flex justify-between items-center">
            <span className="text-lg font-bold text-amber-900">Total Score:</span>
            <span className="text-2xl font-bold text-green-600">
              {completedWords.reduce((sum, word) => sum + word.score, 0)} points
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrabbleBoard;