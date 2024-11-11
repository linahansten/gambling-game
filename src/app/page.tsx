'use client';

import { Suspense, useEffect, useState } from 'react';
import type { HandType } from './types';
import React from 'react';

const suits = ['♠️', '♣️', '♥️', '♦️'];
const values = [
  { name: '2', value: 2 },
  { name: '3', value: 3 },
  { name: '4', value: 4 },
  { name: '5', value: 5 },
  { name: '6', value: 6 },
  { name: '7', value: 7 },
  { name: '8', value: 8 },
  { name: '9', value: 9 },
  { name: '10', value: 10 },
  { name: 'J', value: 10 },
  { name: 'Q', value: 10 },
  { name: 'K', value: 10 },
  { name: 'A', value: 11 },
];

const getRandomCard = () => {
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const value = values[Math.floor(Math.random() * values.length)];
  return { ...value, suit };
};

const calculateHandValue = (hand: HandType[]) => {
  let value = hand.reduce((acc, card) => acc + card.value, 0);
  let aceCount = hand.filter(card => card.name === 'A').length;

  while (value > 21 && aceCount > 0) {
    value -= 10;
    aceCount--;
  }

  return value;
};

const Card = ({ card, hidden }: { card: { name: string; suit: string }; hidden: boolean }) => (
  <div className={`w-32 h-48 ${hidden ? 'bg-gray-800' : 'bg-white'} border border-gray-300 rounded-lg shadow-lg flex flex-col items-center justify-center m-2 relative transition-transform transform hover:scale-105`}>
    {hidden ? (
      <div className="text-xl text-white font-semibold">Hidden</div>
    ) : (
      <>
        <div className="text-xl text-black absolute top-2 right-2 font-medium">{card.name}</div>
        <div className="text-7xl text-black">{card.suit}</div>
        <div className="text-xl text-black absolute bottom-2 left-2 font-medium">{card.name}</div>
      </>
    )}
  </div>
);

const BlackjackGame = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const [playerHand, setPlayerHand] = useState([getRandomCard(), getRandomCard()]);
  const [robotHand, setRobotHand] = useState([getRandomCard(), getRandomCard()]);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [playerHandValue, setPlayerHandValue] = useState(0);
  const [robotHandValue, setRobotHandValue] = useState(0);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      setPlayerHandValue(calculateHandValue(playerHand));
    }
  }, [playerHand, hasMounted]);

  useEffect(() => {
    if (hasMounted) {
      // Update robot hand value by only considering the visible cards
      setRobotHandValue(calculateHandValue(robotHand.slice(1))); // Exclude the first card (hidden)
    }
  }, [robotHand, hasMounted]);

  useEffect(() => {
    if (hasMounted && playerHandValue > 21) {
      setGameOver(true);
      setWinner('Robot Wins! You Busted.');
    }
  }, [playerHandValue, hasMounted]);

  useEffect(() => {
    if (hasMounted && !playerTurn && !gameOver) {
      const robotPlay = setInterval(() => {
        if (calculateHandValue(robotHand) < 17) {
          setRobotHand(prevHand => [...prevHand, getRandomCard()]);
        } else {
          clearInterval(robotPlay);
          determineWinner();
        }
      }, 1000);

      return () => clearInterval(robotPlay);
    }
  });

  const hit = () => {
    const newCard = getRandomCard();
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);

    if (calculateHandValue(newHand) > 21) {
      setGameOver(true);
      setWinner('Robot Wins! You Busted.');
    }
  };

  const stand = () => {
    setPlayerTurn(false);
  };

  const determineWinner = () => {
    const finalPlayerValue = calculateHandValue(playerHand);
    const finalRobotValue = calculateHandValue(robotHand);

    if (finalPlayerValue > 21) {
      setWinner('Robot Wins! You Busted.');
    } else if (finalRobotValue > 21) {
      setWinner('You Win! Robot Busted.');
    } else if (finalPlayerValue > finalRobotValue) {
      setWinner('You Win!');
    } else if (finalRobotValue > finalPlayerValue) {
      setWinner('Robot Wins!');
    } else {
      setWinner('It\'s a Tie!');
    }

    setGameOver(true);
  };

  const resetGame = () => {
    setPlayerHand([getRandomCard(), getRandomCard()]);
    setRobotHand([getRandomCard(), getRandomCard()]);
    setPlayerTurn(true);
    setGameOver(false);
    setWinner('');
  };

  if (!hasMounted) return null; // Prevent rendering until client-side only

  return (
    <div className="bg-gradient-to-b from-green-700 to-green-900 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-white text-3xl font-bold mb-8">Blackjack Game</h1>
      
      <div className="flex flex-row justify-between w-full max-w-5xl px-4">
        <div className="text-white text-2xl mb-4 w-1/2">
          <h2 className="text-center mb-2 text-xl font-semibold">Your Hand:</h2>
          <div className="flex justify-center">
            <Suspense fallback="loading">
              {playerHand.map((card, index) => <Card key={index} card={card} hidden={false} />)}
            </Suspense>
          </div>
          <div className="text-center text-xl font-bold mt-2">Value: {playerHandValue}</div>
        </div>

        <div className="text-white text-2xl mb-4 w-1/2">
          <h2 className="text-center mb-2 text-xl font-semibold">Robot&apos;s Hand:</h2>
          <div className="flex flex-wrap justify-center">
            {robotHand.map((card, index) => (
              <Card key={index} card={index === 0 && playerTurn ? { name: 'Hidden', suit: '' } : card} hidden={index === 0 && playerTurn} />
            ))}
          </div>
          <div className="text-center text-xl font-bold mt-2">
            Value: {playerTurn ? `Hidden + ${robotHandValue}` : calculateHandValue(robotHand)}
          </div>
        </div>
      </div>

      <div className="flex space-x-4 mb-8">
        {!gameOver && playerTurn && (
          <>
            <button
              className="bg-gray-800 text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
              onClick={hit}
            >
              Hit
            </button>
            <button
              className="bg-gray-800 text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
              onClick={stand}
            >
              Stand
            </button>
          </>
        )}

        {gameOver && (
          <button
            className="bg-red-600 text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:bg-red-500 transition duration-300"
            onClick={resetGame}
          >
            Play Again
          </button>
        )}
      </div>

      {gameOver && (
        <div className="text-yellow-300 text-2xl font-bold mb-8">{winner}</div>
      )}
    </div>
  );
};

export default BlackjackGame;
