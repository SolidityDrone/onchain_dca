import { useQuery, gql } from '@apollo/client';
import { useAccount } from 'wagmi';
import {  Table, Container, Button, Row, Col, Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';

import { web3 } from '../index';
import { lighterfiAddress } from '../index';
import DealCountdown from './components/CountDown';
import AmountFromWei from './components/AmountFromWei';
import polygonLogo from '../../src/assets/polygon-logo.svg';
import LoadingWheel from './components/LoadingWheel';
import TransactionDialog from './components/TransactionDialog';
import WalletConnectDialog from './components/WalletConnectDialog';
import TokenData from '../Tokens.json'; // Adjust the path accordingly
import LighterFiABI from '../LighterFi_ABI.json';

function Create() {

  const { address } = useAccount();
  const [strategyType, setStrategyType] = useState('');
  const [tokenIn, setTokenIn] = useState('');
  const [tokenOut, setTokenOut] = useState('');
  const [amount, setAmount] = useState('');
  const [timeInterval, setTimeInterval] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [transactionMessage, setTransactionMessage] = useState('');
  const [processingTransaction, setProcessingTransaction] = useState(false);
  const [originalTokenIn, setOriginalTokenIn] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessingTransaction(true);

    try {
      const lighterFiAddress = "0xf79D99E640d5E66486831FD0BC3e36a29d3148C0";
      const lighterfiContract = new web3.eth.Contract(LighterFiABI, lighterFiAddress);

      if (strategyType === 'DCA') {
        const tokenFrom = '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664';
        const tokenTo = tokenOut;
        const timeIntervalValue = web3.utils.toBN((timeInterval.toString()));
        const tokenInAmount = (web3.utils.toBN(web3.utils.toWei(amount.toString(), 'ether'))).toString().slice(0, -12);
        const limit = web3.utils.toBN(0);

        await lighterfiContract.methods.createStrategy(tokenFrom, tokenTo, timeIntervalValue, tokenInAmount, limit)
          .send({ from: address });

        setTransactionMessage('Transaction confirmed');
      } else if (strategyType === 'Limit') {
        const tokenFrom = tokenIn;
        const tokenTo = tokenOut;
        const timeIntervalValue = web3.utils.toBN(0);
        let tokenInAmount = web3.utils.toBN(web3.utils.toWei(amount.toString(), 'ether')).toString();
        const limit = web3.utils.toBN(web3.utils.toWei(limitPrice.toString(), 'ether')).toString().slice(0, -12);
        
        if (tokenIn === '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664' ){
          tokenInAmount = tokenInAmount.slice(0, -12);
        }

        await lighterfiContract.methods.createStrategy(tokenFrom, tokenTo, timeIntervalValue, tokenInAmount, limit)
          .send({ from: address });

        setTransactionMessage('Transaction confirmed');
      }
    } catch (error) {
      console.log(error);
      setTransactionMessage('Transaction failed');
    }

    setProcessingTransaction(false);
  };


  useEffect(() => {
    // If DCA is selected, set tokenIn to the address of USDC
    if (strategyType === 'DCA') {
      setTokenIn('0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664');
    } else if (strategyType === 'Limit') {
      // Listen to changes in tokenIn and tokenOut
      if (tokenIn !== '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664') {
        // If tokenIn is different from USDC, set tokenOut to USDC
        setTokenOut('0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664');
      } else if (tokenOut !== '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664' && tokenIn === '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664') {
        // If tokenOut is different from USDC and tokenIn is already USDC, set tokenIn to USDC
        setTokenOut('0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664');
      }
    }
  }, [strategyType, tokenIn, tokenOut]);



  const renderStrategyFields = () => {
    if (strategyType === 'DCA') {
      return (
        <>
          <Form.Group className="mb-3" controlId="amount">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="timeInterval">
            <Form.Label>Time Interval (in seconds)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter time interval"
              value={timeInterval}
              onChange={(e) => setTimeInterval(e.target.value)}
              required
            />
          </Form.Group>
        </>
      );
    } else if (strategyType === 'Limit') {
      return (
        <>
          <Form.Group className="mb-3" controlId="amount">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="limitPrice">
            <Form.Label>Limit Price</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter limit price"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              required
            />
          </Form.Group>
        </>
      );
    }

    return null;
  };

  return (
    
    <Container>
      <div className='formBox'>
        <div className='formInner'>

     
      <h2>Create a Strategy</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="strategyType">
          <Form.Label>Strategy Type</Form.Label>
          <Form.Control
            as="select"
            value={strategyType}
            onChange={(e) => setStrategyType(e.target.value)}
            required
          >
            <option value="" disabled>Select Strategy Type</option>
            <option value="DCA">DCA</option>
            <option value="Limit">Limit Order</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3" controlId="tokenIn">
          <Form.Label>Token In</Form.Label>
          <Form.Control
            as="select"
            value={tokenIn}
            onChange={(e) => setTokenIn(e.target.value)}
            required 
            disabled={strategyType === 'DCA'}
          >
            <option value="" disabled>Select Token In</option>
            {TokenData.tokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3" controlId="tokenOut">
          <Form.Label>Token Out</Form.Label>
          <Form.Control
            as="select"
            value={tokenOut}
            onChange={(e) => setTokenOut(e.target.value)}
            required
          >
            <option value="" disabled>Select Token Out</option>
            {TokenData.tokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        {renderStrategyFields()}

        <Button variant="primary" type="submit" disabled={processingTransaction}>
          {processingTransaction ? 'Processing...' : 'Create Strategy'}
        </Button>
      </Form>

      {transactionMessage && (
        <div className="mt-3">
          <strong>{transactionMessage}</strong>
        </div>
      )}
      </div>
      </div>
    </Container>
 
  );
}

export default Create;