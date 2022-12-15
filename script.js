'use strict';

// BANKIST APP

// Data 帳戶資訊
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-11-12T17:01:17.194Z',
    '2022-11-15T23:36:17.929Z',
    '2022-11-21T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'zh-TW', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements 獲取元素
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');


const formatMovementDate = function(date) {
  const calcDaysPassed = (date1, date2) =>
  Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);

  //判斷交易日期幾天前 大於七天直接顯示日期
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else{
    const day = `${date.getDate()}`.padStart(2,0);
    const month = `${date.getMonth() + 1}`.padStart(2,0);
    const year = date.getFullYear()
    return `${day}/${month}/${year}`;
  }

}

const formatCur = function(value, locale, currency){
  return new Intl.NumberFormat(locale, {
    style:'currency',
    currency:currency,
  }).format(value);
}

const displayMovements = function(acc, sort = false){

  //清空元素再開始新增
  containerMovements.innerHTML = '';

  //排序
  const movs = sort 
  ? acc.movements.slice().sort((a, b) => a-b) 
  : acc.movements;

  //帳戶出入明細
  movs.forEach(function(mov,i){
    const type = mov > 0 ? 'deposit' : 'withdrawal'

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date)

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type 
        movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
  `;

    //element.insertAdjectHTML(positon,text)
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};


//計算incomes,out,interest
const clacDisplaySummary = function(acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = 
  formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = 
  formatCur(Math.abs(out), acc.locale, acc.currency);
  

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1; //大於1的利息
    })
    .reduce((acc, int) => acc + int, 0);
    labelSumInterest.textContent = 
    formatCur(interest, acc.locale, acc.currency);
    
};


//計算帳戶餘額
const clacDisplayBalance = function(acc){
  acc.balance = acc.movements.reduce((acc,mov) => acc + mov,0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const createUsernames = function(accs){
  accs.forEach(function(acc){
    acc.username = acc.owner
  .toLowerCase()
  .split(' ')
  .map(name => name[0])
  .join('');
  });
};

createUsernames(accounts);

const updateUI = function(acc){
  displayMovements(acc)
  
  clacDisplayBalance(acc)

  clacDisplaySummary(acc)
}

//登出時間倒數
const startLogOutTimer = function() {
  const tick = function(){
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0){
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get stated'
      containerApp.style.opacity = 0 ;
    }

    time--;

  }

  let time = 600;

  const timer = setInterval(tick, 1000);

  return timer;
};


//登入按鈕
let currentAccount, timer;

btnLogin.addEventListener('click', function(e){
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value );
  console.log(currentAccount);


if(currentAccount?.pin === Number(inputLoginPin.value)){
  labelWelcome.textContent = `Welcome back, ${
    currentAccount.owner.split(' ')[0]
  }`;
  containerApp.style.opacity = 100;

  //登入時間API
  const now = new Date();
  const options ={
  hour:'numeric',
  minute:'numeric',
  day:'numeric',
  month:'long',
  year:'numeric',
  weekday:'long',
};

labelDate.textContent = new Intl.DateTimeFormat(
  currentAccount.locale, options).format(now);
  
  // const day = `${now.getDate()}`.padStart(2,0);
  // const month = `${now.getMonth() + 1}`.padStart(2,0);
  // const year = now.getFullYear();
  // const hour = `${now.getHours()}`.padStart(2,0);
  // const min = `${now.getMinutes()}`.padStart(2,0);
  // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

  //清空帳號密碼欄位
  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();

  if (timer) clearInterval(timer);
  timer = startLogOutTimer();

  updateUI(currentAccount)
}
})

//轉帳按鈕
btnTransfer.addEventListener('click',function(e){
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiveAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  )

inputTransferAmount.value = inputTransferTo.value = ''

if(
  amount > 0 &&
  receiveAcc &&
  currentAccount.balance >= amount &&
  receiveAcc?.username !== currentAccount.username
){

  //增加交易日期
  currentAccount.movementsDates.push(new Date().toISOString());
  receiveAcc.movementsDates.push(new Date().toISOString());


  // 交易
  currentAccount.movements.push(-amount);
  receiveAcc.movements.push(amount);

  //重製登出時間
  clearInterval(timer);
  timer = startLogOutTimer();

  updateUI(currentAccount)
} 
})

// 借款按鈕
btnLoan.addEventListener('click',function(e){
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if(amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)){

    currentAccount.movements.push(amount);

    //增加交易日期
    currentAccount.movementsDates.push(new Date().toISOString());

    clearInterval(timer);
    timer = startLogOutTimer();

    updateUI(currentAccount);

  }
    inputLoanAmount.value = '';
})



//刪除帳號按鈕
btnClose.addEventListener('click',function(e){
  e.preventDefault()  
  
  if(
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ){

    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    accounts.splice(index, 1);

    containerApp.style.opacity = 0 ;
  }

  inputClosePin.value = inputCloseUsername.value = '';
})

//排序按鈕

let sorted = false;
btnSort.addEventListener('click', function(e){
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
})


/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

/////////////////////////////////////////////////

